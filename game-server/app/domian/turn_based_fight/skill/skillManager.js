var attackSkill = require("./attackSkill.js")
var healSkill = require("./healSkill.js")
var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var model = function() {}
model.init = function(locator,formula,seeded) {
	this.locator = locator
	this.formula = formula
	this.seeded = seeded
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
	var recordInfo = {id : skill.character.id,type : "attack",targets : [],skillId : skill.skillId,name : skill.name}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	if(!targets.length){
		fightRecord.push(recordInfo)
		return
	}
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
		recordInfo.targets.push(info)
		//判断buff
		if(skill.buffId){
			if(this.seeded.random("判断BUFF命中率") < skill.buffRate){
				buffManager.createBuff(skill.character,target,{buffId : skill.buffId,buffArg : skill.buffArg,duration : skill.duration})
			}
		}
	}
	//判断自身怒气恢复
	if(skill.anger_s)
		skill.character.addAnger(skill.anger_s)
	//判断全队怒气恢复
	if(skill.anger_a)
		for(var i = 0;i < skill.character.team.length;i++)
			if(!skill.character.team[i].died)
				skill.character.team[i].addAnger(skill.anger_a)
	//判断攻击目标大于三人则增加两点怒气
	if(skill.thr_anger){
		if(targets.length >= 3){
			skill.character.addAnger(2)
		}
	}
	//伤害值转生命判断
	if(allDamage && skill.turn_rate && skill.turn_tg && !skill.character.died){
		recordInfo.next = {type : "heal",targets : []}
		let healValue = Math.round(allDamage * skill.turn_rate) || 1
		targets = this.locator.getTargets(skill.character,skill.turn_tg)
		for(var i = 0;i < targets.length;i++){
			let target = targets[i]
			let info = this.formula.calHeal(skill.character,target,healValue)
			info = target.onHeal(skill.character,info,skill)
			recordInfo.next.targets.push(info)
		}
	}
	fightRecord.push(recordInfo)
	//追加普通攻击判断
	if(skill.add_d_s){
		console.log("追加普通攻击")
		this.useSkill(skill.character.defaultSkill)
	}
}
//恢复技能
model.useHealSkill = function(skill) {
	var recordInfo = {id : skill.character.id,type : "heal",targets : [],skillId : skill.skillId,name : skill.name}
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
		recordInfo.targets.push(info)
	}
	//判断自身怒气恢复
	if(skill.anger_s)
		skill.character.addAnger(skill.anger_s)
	//判断全队怒气恢复
	if(skill.anger_a)
		for(var i = 0;i < skill.character.team.length;i++)
			if(!skill.character.team[i].died)
				skill.character.team[i].addAnger(skill.anger_a)
	fightRecord.push(recordInfo)
}
//技能效果特殊先决条件
model.checkPremise = function(premise) {
	switch(premise){
		case "target3":

		break
		default:
			return false
	}
}
//技能效果触发
model.doEffect = function(effect) {
	// body...
}
module.exports = model