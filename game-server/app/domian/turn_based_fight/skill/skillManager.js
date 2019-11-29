var attackSkill = require("./attackSkill.js")
var healSkill = require("./healSkill.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function() {}
model.init = function(locator,formula) {
	this.locator = locator
	this.formula = formula
}
var defaultHeal = {}
//创建技能
model.createSkill = function(otps,character) {
	switch(otps.type){
		case "attack":
			return new attackSkill(otps,character)
		case "heal":
			return new healSkill(otps,character)
		default:
			return false
	}
}
//使用技能
model.useSkill = function(skill) {
	switch(skill.type){
		case "attack":
			return this.useAttackSkill(skill)
		break
		case "heal":
			return this.useHealSkill(skill)
		break
		default:
			return false
	}
}
//伤害技能
model.useAttackSkill = function(skill) {
	var recordInfo = {type : "attack",targets : [],skillId : skill.skillId}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	var allDamage = 0
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		//判断命中率
		let info = this.formula.calDamage(skill.character, target, skill)
		info = target.onHit(skill.character,info,skill)
		allDamage += info.realValue
		recordInfo.targets.push({id : target.id,info : info})
	}
	//判断自身怒气恢复
	if(skill.anger_s)
		skill.character.addAnger(skill.anger_s)
	//判断全队怒气恢复
	if(skill.anger_a)
		for(var i = 0;i < skill.character.team.length;i++)
			if(!skill.character.team[i].died)
				skill.character.team[i].addAnger(skill.anger_a)
	//伤害值转生命判断
	if(allDamage && skill.turn_rate && skill.turn_tg && !skill.character.died){
		recordInfo.next = {type : "heal",targets : []}
		let healValue = Math.round(allDamage * skill.turn_rate) || 1
		targets = this.locator.getTargets(skill.character,skill.turn_tg)
		for(var i = 0;i < targets.length;i++){
			let target = targets[i]
			let info = this.formula.calHeal(skill.character,target,healValue)
			info = target.onHeal(skill.character,info,skill)
			recordInfo.next.targets.push({id : target.id,info : info})
		}
	}
	fightRecord.push(recordInfo)
}
//恢复技能
model.useHealSkill = function(skill) {
	var recordInfo = {type : "heal",targets : []}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		let value = 0
		if(skill.healType == "atk"){
			value = Math.round(skill.character.getTotalAtt("atk") * skill.mul)
		}else if(healType == "hp"){
			value = Math.round(target.getTotalAtt("maxHP") * skill.mul)
		}else{
			console.error("healType error "+healType)
		}
		let info = this.formula.calHeal(skill.character,target,value)
		info = target.onHeal(skill.character,info,skill)
		recordInfo.targets.push({id : target.id,info : info})
	}
	fightRecord.push(recordInfo)
}
module.exports = model