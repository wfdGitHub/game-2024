//技能管理器
const skill_base = require("./skill_base.js")
var model = function(fighting) {
	this.fighting = fighting
	this.skill_base = skill_base
}
//开始使用技能（预处理）
model.prototype.useSkill = function(skillInfo) {
	var skill = skillInfo.skill
	if(!skill){
		console.log("skillInfo error ",skillInfo)
		return
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
	this.skillAfter(skillInfo,skill,record,attackTargets)
	if(attackTargets.length)
		this.buffSkill(skill,attackTargets)
	else if(healTargets.length)
		this.buffSkill(skill,healTargets)
}
//伤害技能
model.prototype.attackSkill = function(skillInfo,skill,record) {
	record.attack = []
	var allCount = skill.getTotalAtt("atk_count")
	var targets = []
	for(var count = 0;count < allCount;count++){
		if(skillInfo.targets)
			targets = skillInfo.targets
		else
			targets = this.fighting.locator.getTargets(skill.character,skill.atk_aim)
		skill.attackBefore(targets)
		for(var i = 0;i < targets.length;i++){
			targets[i].onHitBefore(skill.character,skill)
			var info = this.fighting.formula.calDamage(skill.character, targets[i],skill)
			info.value = Math.floor(info.value * skillInfo.mul)
			info.value += skill.getTotalAtt("real_value")
			info = targets[i].onHit(skill.character,info,true,skill.isAnger)
			targets[i].onHiting(skill.character,skill,info)
			record.attack.push(info)
		}
	}
	skill.character.attackAfter(skill)
	return targets
}
//治疗技能
model.prototype.healSkill = function(skillInfo,skill,record) {
	record.heal = []
	if(skill.talents.revive_friend_mul){
		var team = skill.character.team
		for(var i = 0;i < team.length;i++){
			if(!team[i].isNaN && team[i].died){
				team[i].revive(Math.floor(skill.character.getTotalAtt("atk") * skill.talents.revive_friend_mul))
				return []
			}
		}
	}
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
model.prototype.skillAfter = function(skillInfo,skill,record,attackTargets) {
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
				skill.character.onKill(target,skill,info)
			}else{
				//受击处理
				target.onHitAfter(skill,skill.character,info)
				//触发闪避
				if(info.dodge)
					target.onMiss(skill.character,info)
				//触发格挡
				if(info.block)
					target.onBlock(skill.character,info)
				//触发暴击
				if(info.crit)
					target.onCrit(skill.character,info)
			}
			skill.attackAfter(target,info)
		}
		//概率清空目标怒气
		if(skill.talents.clear_anger){
			for(var i = 0;i < record.attack.length;i++){
				var info = record.attack[i]
				if(!info.died && this.fighting.randomCheck(skill.talents.clear_anger,"clear_anger")){
					var target = this.fighting.allHero[info.id]
					target.lessAnger(target.curAnger,true)
				}
			}
		}
		//吸血
		if(skill.talents.suck_blood || skill.character.talents.suck_blood || skill.character.buffs["suck_blood"]){
			var suck_blood = skill.talents.suck_blood || 0 + skill.character.talents.suck_blood || 0
			if(skill.character.buffs["suck_blood"])
				suck_blood += skill.character.buffs["suck_blood"].getBuffValue()
			skill.character.onOtherHeal(skill.character,suck_blood * allDamage)
		}
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
			skillInfo = skill.character.usePointSkill(skill,100)
			skillInfo.mul = 0.5
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
	this.skillMonitor(skill)
	if(attackTargets.length)
		this.attackMonitor(skill.character,skill,attackTargets)
}
//BUFF判断
model.prototype.buffSkill = function(skill,targets,infos) {
	if(!targets.length)
		return
	//技能BUFF
	for(var buffId in skill.buffs){
		var buff = skill.buffs[buffId]
		var buffTargets = this.fighting.locator.getBuffTargets(skill.character,buff.targetType,targets)
		for(var i = 0;i < buffTargets.length;i++)
			this.fighting.buffManager.createBuffWithRate(skill,buffTargets[i],buff)
	}
	//触发BUFF
	if(!skill.character.buffs["vital_point"]){
		for(var buffId in skill.trigger_buffs){
			var buff = skill.trigger_buffs[buffId]
			var buffTargets = this.fighting.locator.getBuffTargets(skill.character,buff.targetType,targets)
			for(var i = 0;i < buffTargets.length;i++)
				this.fighting.buffManager.createBuffWithRate(skill,buffTargets[i],buff)
		}
	}
}
//行动攻击监听
model.prototype.attackMonitor = function(attacker,skill,targets) {
	for(var i = 0;i < this.fighting.heroAtionMonitor.length;i++)
		this.fighting.heroAtionMonitor[i](attacker,skill,targets)
}
//释放技能监听
model.prototype.skillMonitor = function(skill) {
	for(var i = 0;i < skill.character.fightInfo["skillMonitor"].length;i++)
		skill.character.fightInfo["skillMonitor"][i](skill)
}
module.exports = model