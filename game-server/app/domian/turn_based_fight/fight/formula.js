var formula = function(seeded) {
	this.seeded = seeded
}
//伤害计算
formula.prototype.calDamage = function(attacker, target, skill) {
	var info = {type : "damage",value : 0}
	//命中判断
	var hitRate = 8500 + attacker.getTotalAtt("hitRate") - target.getTotalAtt("dodgeRate")
	if(this.seeded.random("闪避判断") * 10000  > hitRate){
		info.miss = true
		return info
	}
	//暴击判断
	var crit = 1000 + attacker.getTotalAtt("crit") - target.getTotalAtt("critDef")
	if(this.seeded.random("暴击判断") * 10000  < crit){
		info.crit = true
	}
	//伤害计算
	var atk = attacker.getTotalAtt("atk")
	var def = target.getTotalAtt(skill.damageType+"Def")
	info.value = Math.round((atk - def) * skill.mul * (1 + (attacker.getTotalAtt("amplify") - target.getTotalAtt("reduction")) * 0.0001))
	if(info.crit){
		info.value = Math.round(info.value * (1.5 + attacker.getTotalAtt("slay") - target.getTotalAtt("slayDef")))
	}
	//最小伤害
	if (info.value <= 1) {
		info.value = 1
	}
    return info
}
//治疗计算
formula.prototype.calHeal = function(attacker,target,skill) {
	var info = {type : "heal",value : 0}
	//暴击判断
	var crit = attacker.getTotalAtt("healRate")
	if(this.seeded.random("治疗暴击判断") * 10000  < crit){
		info.crit = true
	}
	if(skill.healType == "atk"){
		info.value = Math.round(attacker.getTotalAtt("atk") * skill.mul * (1 + target.getTotalAtt("healAdd")))
	}else if(skill.healType == "hp"){
		info.value = Math.round(target.getTotalAtt("maxHP") * skill.mul * (1 + target.getTotalAtt("healAdd")))
	}else{
		console.error("healType error "+skill.healType)
	}
	if(info.crit){
		info.value = Math.round(info.value * 1.5)
	}
	//最小治疗
	if (info.value <= 1) {
		info.value = 1
	}
	return info
}
module.exports = formula