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
	var targets = []
	switch(skill.type){
		case "attack":
			targets = this.useAttackSkill(skill)
		break
		case "heal":
			targets = this.useHealSkill(skill)
		break
		default:
			targets = []
	}
	//判断燃烧状态附加BUFF
	if(skill.burnBuffChange){
		for(var i = 0;i < targets.length;i++){
			if(skill.character.died || !targets[i].buffs["burn"]){
				break
			}
			var burnBuffInfo = JSON.parse(skill.burnBuffChange)
			let target = targets[i]
			if(this.seeded.random("判断BUFF命中率") < burnBuffInfo.buffRate){
				buffManager.createBuff(skill.character,target,{buffId : burnBuffInfo.buffId,buffArg : burnBuffInfo.buffArg,duration : burnBuffInfo.duration})
			}
		}
	}
	//判断buff
	if(skill.buffId){
		var buffTargets = this.locator.getBuffTargets(skill.character,skill.buff_tg,targets)
		for(var i = 0;i < buffTargets.length;i++){
			if(skill.character.died){
				break
			}
			let target = buffTargets[i]
			if(this.seeded.random("判断BUFF命中率") < skill.buffRate){
				buffManager.createBuff(skill.character,target,{buffId : skill.buffId,buffArg : skill.buffArg,duration : skill.duration})
			}
		}
	}
	//判断自身生命值恢复
	if(skill.self_heal){
		var recordInfo =  skill.character.onHeal(skill.character,{type : "heal",value : skill.character.maxHP * skill.self_heal},skill)
		recordInfo.type = "self_heal"
		fightRecord.push(recordInfo)
	}
	//判断自身怒气恢复
	if(skill.anger_s)
		skill.character.addAnger(skill.anger_s,skill.skillId)
	//判断全队怒气恢复
	if(skill.anger_a)
		for(var i = 0;i < skill.character.team.length;i++)
			if(!skill.character.team[i].died)
				skill.character.team[i].addAnger(skill.anger_a,skill.skillId)
	//判断怒气降低
	if(skill.less_anger){
		for(var i = 0;i < targets.length;i++){
			if(skill.character.died){
				break
			}
			target.lessAnger(skill.less_anger,skill.skillId)
		}
	}
}
//伤害技能
model.useAttackSkill = function(skill) {
	var recordInfo = skill.getInfo()
	recordInfo.targets = []
	if(this.locator.getTargetsNum() == 1){
		recordInfo.group = true
	}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	if(!targets.length){
		fightRecord.push(recordInfo)
		return
	}
	var lessAmp = 0
	//判断技能目标减少
	if(skill.lessAmp && targets.length){
		var lessNum = this.locator.getTargetsNum(skill.targetType) - targets.length
		if(lessNum > 0){
			lessAmp = skill.lessAmp * lessNum
		}
	}
	var allDamage = 0
	var kill_amp = 0
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		//计算伤害
		let info = this.formula.calDamage(skill.character, target, skill,lessAmp)
		info = target.onHit(skill.character,info,skill)
		allDamage += info.realValue
		recordInfo.targets.push(info)
		if(info.kill && skill.kill_amp){
			kill_amp += skill.kill_amp
		}
	}
	if(kill_amp){
		skill.character.amplify += skill.kill_amp
	}
	//判断攻击目标大于三人则增加两点怒气
	if(skill.thr_anger){
		if(targets.length >= 3){
			skill.character.addAnger(2,skill.skillId)
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
	//追加普通攻击判断(仅怒气技能生效)
	if(skill.isAnger && skill.add_d_s){
		console.log("追加普通攻击")
		this.useSkill(skill.character.defaultSkill)
	}
	return targets
}
//恢复技能
model.useHealSkill = function(skill) {
	var recordInfo = skill.getInfo()
	recordInfo.targets = []
	if(this.locator.getTargetsNum() == 1){
		recordInfo.group = true
	}
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
	fightRecord.push(recordInfo)
	return targets
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