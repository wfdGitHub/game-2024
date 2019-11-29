var attackSkill = require("./attackSkill.js")
var healSkill = require("./healSkill.js")
var model = function() {}
model.init = function(locator,formula) {
	this.locator = locator
	this.formula = formula
}
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
	var recordInfo = {type : "attack",targets : []}
	var targets = this.locator.getTargets(skill.character,skill)
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		//判断命中率
		let info = this.formula.calDamage(skill.character, target, skill)
		var str = skill.character.camp+skill.character.index+"使用\033[36m"+skill.name+"\033[0m攻击"+target.camp+target.index
		if(!info.miss){
			info = target.onHit(skill.character,info,skill)
			str += "  \033[36m造成"+ info.value+"点伤害"
			if(info.crit){
				str +="(暴击)"
			}
			str += "   剩余"+target.hp+"/"+target.maxHP
			if(info.kill){
				str += "  击杀目标!"
			}
			str += "\033[0m"
		}else{
			str += "  被闪避"
		}
		console.log(str)
		recordInfo.targets.push({id : target.id,info : info})
	}
	return recordInfo
}
//恢复技能
model.useHealSkill = function(skill) {
	var recordInfo = {type : "heal",targets : []}
	var targets = this.locator.getTargets(skill.character,skill)
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		let info = this.formula.calHeal(skill.character, target, skill)
		info = target.onHeal(skill.character,info,skill)
		var str = skill.character.camp+skill.character.index+"使用\033[32m"+skill.name+"\033[0m攻击"+"治疗"+target.camp+target.index
		str += " \033[32m 恢复"+ info.value+"点血量 "
		if(info.crit){
			str +="(暴击)"
		}
		str += "   剩余"+target.hp+"/"+target.maxHP+"\033[0m"
		console.log(str)
		recordInfo.targets.push({id : target.id,info : info})
	}
	return recordInfo
}
module.exports = model