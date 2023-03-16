//技能管理器
var model = function(fighting,locator,formula) {
	this.fighting = fighting
	this.locator = locator
	this.formula = formula
}
//开始使用技能（预处理）
model.prototype.useSkill = function(skill) {
	var record {
		"id" : skill.character.id,
		"sid" : skill.sid,
		"isAnger" : skill.isAnger
	}
	skill.before()
	this.skillAction(skill,record)
}
//使用技能中
model.prototype.skillAction = function(skill,record) {
	if(skill.atk_aim && skill.atk_mul)
		this.attackSkill(skill,record)
	if(skill.heal_aim && skill.heal_mul)
		this.healSkill(skill,record)
	this.skillAfter(skill,record)
}
//使用技能结束
model.prototype.skillAfter = function(skill,record) {
	this.fighting.fightRecord.push(record)
	skill.after()
}
//伤害技能
model.prototype.attackSkill = function(skill,record) {
	record.attack = []
	record.damageType = skill.damageType
	var targets = this.locator.getTargets(skill.character,skill.atk_aim)
	for(var i = 0;i < targets.length;i++){
		var info = this.formula.calDamage(skill.character, targets[i],skill)
		info = targets[i].onHit(skill.character,info)
		record.attack.push(info)
	}
}
//治疗技能
model.prototype.healSkill = function(skill,record) {
	record.heal = []
	var targets = this.locator.getTargets(skill.character,skill.heal_aim)
	for(var i = 0;i < targets.length;i++){
		var info = this.formula.calHeal(skill.character, targets[i],skill)
		record.heal.push(info)
	}
}
module.exports = model