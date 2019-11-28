var formula = function(seeded) {
	this.seeded = seeded
}
//伤害计算
formula.prototype.calDamage = function(attacker, target, skill) {
	var info = {value : 0,skill : skill}
	if(!target.getTotalAtt){
		console.log("11")
	}
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
	var atk = attacker.getTotalAtt("atk");
	var def = target.getTotalAtt(skill.damageType+"Def");
	var value = Math.round((atk - def) * skill.mul * (1 + (attacker.getTotalAtt("amplify") - target.getTotalAtt("reduction")) * 0.0001))
	if(info.crit){
		value = Math.round(value * (1.5 + attacker.getTotalAtt("slay") - target.getTotalAtt("slayDef")))
	}
	//最小伤害
	if (value <= 1) {
		value = 1;
	}
	info.value = value
    return info
}

module.exports = formula