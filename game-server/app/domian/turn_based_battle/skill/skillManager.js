//技能管理器
var model = function(fighting) {
	this.fighting = fighting
}
//开始使用技能（预处理）
model.prototype.useSkill = function(skillInfo) {
	var skill = skillInfo.skill
	if(!skill){
		console.log("skill.character.id")
	}
	var record = {
		"type" : "skill",
		"id" : skill.character.id,
		"sid" : skill.sid,
		"isAnger" : skill.isAnger,
		"changeAnger" :skillInfo.changeAnger,
		"curAnger" : skillInfo.curAnger
	}
	skill.before()
	this.skillAction(skillInfo,skill,record)
}
//使用技能中
model.prototype.skillAction = function(skillInfo,skill,record) {
	var attackTargets = []
	var healTargets = []
	if(skill.atk_aim){
		attackTargets = this.attackSkill(skillInfo,skill,record)
	}
	if(skill.heal_aim){
		healTargets = this.healSkill(skillInfo,skill,record)
	}
	this.fighting.fightRecord.push(record)
	this.buffSkill(skill,healTargets,record.heal)
	this.skillAfter(skillInfo,skill,record)
}
//伤害技能
model.prototype.attackSkill = function(skillInfo,skill,record) {
	record.attack = []
	var allCount = skill.getTotalAtt("atk_count")
	for(var count = 0;count < allCount;count++){
		var targets = this.fighting.locator.getTargets(skill.character,skill.atk_aim)
		skill.attackBefore(targets)
		for(var i = 0;i < targets.length;i++){
			targets[i].onHitBefore(skill.character,skill)
			var info = this.fighting.formula.calDamage(skill.character, targets[i],skill)
			info.value += skill.getTotalAtt("real_value")
			info.value = Math.floor(info.value * skillInfo.mul)
			info = targets[i].onHit(skill.character,info,true)
			targets[i].onHiting(skill.character,skill,info)
			record.attack.push(info)
		}
	}
	return targets
}
//治疗技能
model.prototype.healSkill = function(skillInfo,skill,record) {
	record.heal = []
	var targets = this.fighting.locator.getTargets(skill.character,skill.heal_aim)
	for(var i = 0;i < targets.length;i++){
		var info = this.fighting.formula.calHeal(skill.character, targets[i],skill)
		info.value = Math.floor(info.value * skillInfo.mul)
		info = targets[i].onHeal(skill.character,info)
		if(info.value)
			record.heal.push(info)
	}
	return targets
}
//使用技能结束
model.prototype.skillAfter = function(skillInfo,skill,record) {
	var KILL_FLAG = false
	var EXIST_TARGET = false
	var allDamage = 0
	//攻击触发判断
	if(record.attack && record.attack.length){
		EXIST_TARGET = true
		for(var i = 0;i < record.attack.length;i++){
			var info = record.attack[i]
			allDamage += info.realValue
			var target = this.fighting.allHero[info.id]
			if(info.died){
				KILL_FLAG = true
				//死亡处理
				target.onDieAfter(skill.character,info,skill)
				//触发击杀
				skill.character.onKill(target,info)
			}else{
				//受击处理
				target.onHitAfter(skill,skill.character,info)
				//触发闪避
				if(info.dodge)
					target.onDodge(skill.character,info)
				//触发格挡
				if(info.block)
					target.onBlock(skill.character,info)
				//触发暴击
				if(info.crit)
					target.onCrit(skill.character,info)
			}
		}
		//概率清空目标怒气
		if(skill.talents.clear_anger){
			for(var i = 0;i < record.attack.length;i++){
				var info = record.attack[i]
				if(!info.died && this.fighting.random("clear_anger") < skill.talents.clear_anger){
					var target = this.fighting.allHero[info.id]
					target.lessAnger(target.curAnger,true)
				}
			}
		}
		//吸血
		if(skill.talents.suck_blood)
			skill.character.onOtherHeal(skill.character,skill.talents.suck_blood * allDamage)
		//储存伤害到下一次普攻
		if(skill.talents.store_to_normal)
			skill.character.defaultSkill.changeTotalTmp("real_share_value",skill.talents.store_to_normal * allDamage)
	}
	if(record.heal){
		//治疗触发判断
		for(var i = 0;i < record.heal.length;i++){
			var info = record.heal[i]
			var target = this.fighting.allHero[info.id]
			//受到治疗
			target.onHealAfter(skill.character,info)
		}
	}
	skill.after()
	//击杀触发
	if(KILL_FLAG){
		if(skill.talents.kill_repet && !skillInfo.no_combo){
			skillInfo = skill.character.useAllAangerSkill()
			if(skillInfo)
				this.useSkill(skillInfo)
		}
		if(skill.talents.full_heal_kill)
			skill.character.onOtherHeal(skill.character,skill.character.getTotalAtt("maxHP"))
		if(skill.talents.addAnger_kill)
			skill.character.addAnger(skill.talents.addAnger_kill,true)
	}else{
		//未击杀
		if(skill.talents.loss_hp_amp && EXIST_TARGET){
			var target = this.fighting.allHero[record.attack[0].id]
			var loss_hp = Math.floor(skill.character.getTotalAtt("hp") * 0.15)
			skill.character.onOtherDamage(skill.character,loss_hp)
			target.onOtherDamage(skill.character,Math.floor(loss_hp * skill.talents.loss_hp_amp))
		}
	}
}
//BUFF判断
model.prototype.buffSkill = function(skill,targets,infos) {
	if(!targets.length)
		return
	for(var buffId in skill.buffs){
		var buff = skill.buffs[buffId]
		var buffTargets = this.fighting.locator.getBuffTargets(skill.character,buff.targetType,targets,infos)
		for(var i = 0;i < buffTargets.length;i++)
			this.fighting.buffManager.createBuffWithRate(skill,buffTargets[i],buff)
	}
}
module.exports = model