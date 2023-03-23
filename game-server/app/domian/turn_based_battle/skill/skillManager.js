//技能管理器
var model = function(fighting) {
	this.fighting = fighting
}
//开始使用技能（预处理）
model.prototype.useSkill = function(skillInfo) {
	var skill = skillInfo.skill
	var record = {
		"type" : "skill",
		"id" : skill.character.id,
		"sid" : skill.sid,
		"isAnger" : skill.isAnger,
		"changeAnger" :skillInfo.changeAnger,
		"curAnger" : skillInfo.curAnger
	}
	skill.before()
	this.skillAction(skill,record)
}
//使用技能中
model.prototype.skillAction = function(skill,record) {
	var attackTargets = []
	var healTargets = []
	if(skill.atk_aim && skill.atk_mul){
		attackTargets = this.attackSkill(skill,record)
	}
	if(skill.heal_aim && skill.heal_mul){
		healTargets = this.healSkill(skill,record)
	}
	this.fighting.fightRecord.push(record)
	this.buffSkill(skill,attackTargets,record.attack)
	this.buffSkill(skill,healTargets,record.heal)
	this.skillAfter(skill,record)
}
//使用技能结束
model.prototype.skillAfter = function(skill,record) {
	//攻击触发判断
	if(record.attack){
		for(var i = 0;i < record.attack.length;i++){
			var info = record.attack[i]
			var target = this.fighting.allHero[info.id]
			if(info.died){
				//死亡处理
				target.onDieAfter(skill.character,info)
				//触发击杀
				skill.character.onKill(target,info)
			}else{
				//受击处理
				target.onHitAfter(skill.character,info)
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
}
//伤害技能
model.prototype.attackSkill = function(skill,record) {
	record.attack = []
	record.damageType = skill.damageType
	var allCount = skill.atk_count + skill.tmpCount
	for(var count = 0;count < allCount;count++){
		var targets = this.fighting.locator.getTargets(skill.character,skill.atk_aim)
		for(var i = 0;i < targets.length;i++){
			targets[i].onHitBefore(skill.character)
			var info = this.fighting.formula.calDamage(skill.character, targets[i],skill)
			info.value +=  Math.floor(skill.tmpDamage / targets.length / allCount)
			info = targets[i].onHit(skill.character,info)
			record.attack.push(info)
		}
	}
	return targets
}
//治疗技能
model.prototype.healSkill = function(skill,record) {
	record.heal = []
	var targets = this.fighting.locator.getTargets(skill.character,skill.heal_aim)
	for(var i = 0;i < targets.length;i++){
		var info = this.fighting.formula.calHeal(skill.character, targets[i],skill)
		record.heal.push(info)
	}
	return targets
}
//BUFF判断
model.prototype.buffSkill = function(skill,targets,infos) {
	if(!targets.length)
		return
	for(var buffId in skill.buffs){
		var buff = skill.buffs[buffId]
		var buffTargets = this.fighting.locator.getBuffTargets(skill.character,buff.targetType,targets,infos)
		for(var i = 0;i < targets.length;i++){
			if(this.fighting.random(buff.buffId) < buff.rate){
				this.fighting.buffManager.createBuff(skill.character,targets[i],buff)
			}
		}
	}
}
module.exports = model