var formula = function(seeded) {
	this.seeded = seeded
}
//伤害计算
formula.prototype.calDamage = function(attacker, target, skill,addAmp) {
	var info = {type : "damage",value : 0}
	var tmpAmplify = 0
	var tmpCrit = 0
	if(target.buffs["burn"] && (skill.burn_att_change || skill.character.burn_att_change)){
		var attInfo = Object.assign({},skill.burn_att_change)
		tmpAmplify += attInfo["amplify"] || 0
		tmpCrit += attInfo["crit"] || 0
		if(skill.isAnger && skill.character.burn_att_change){
			tmpAmplify += skill.character.burn_att_change["amplify"] || 0
			tmpCrit += skill.character.burn_att_change["crit"] || 0
		}
	}
	//命中判断
	var hitRate = 1 + attacker.getTotalAtt("hitRate") - target.getTotalAtt("dodgeRate")
	if(this.seeded.random("闪避判断") > hitRate){
		info.miss = true
		return info
	}
	//暴击判断
	var crit = attacker.getTotalAtt("crit") - target.getTotalAtt("critDef") + tmpCrit
	if(attacker.low_hp_crit){
		crit += Math.floor((attacker.attInfo.maxHP-attacker.attInfo.hp)/attacker.attInfo.maxHP * 10) * attacker.low_hp_crit
	}
	if(attacker.must_crit || this.seeded.random("暴击判断") < crit){
		info.crit = true
	}
	//伤害计算
	var atk = attacker.getTotalAtt("atk")
	var def = target.getTotalAtt(skill.damageType+"Def")
	var mul = 1 + attacker.getTotalAtt("amplify") - target.getTotalAtt("reduction") + tmpAmplify
	if(skill.isAnger)
	 	mul += 	attacker.skill_attack_amp
	else
		mul +=	attacker.normal_attack_amp
	if(attacker.low_hp_amp)
		mul += Math.floor((attacker.attInfo.maxHP-attacker.attInfo.hp)/attacker.attInfo.maxHP * 10) * attacker.low_hp_amp
	if(target.burn_hit_reduction){
		if(attacker.buffs["burn"])
			mul -= target.burn_hit_reduction
	}
	info.value = Math.round((atk - def) * skill.mul * mul)
	if(addAmp){
		info.value = Math.round(info.value * (1+addAmp))
	}
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
formula.prototype.calHeal = function(character,target,value){//attacker,target,skill) {
	var info = {type : "heal",value : 0}
	//暴击判断
	if(this.seeded.random("治疗暴击判断") < character.getTotalAtt("healRate")){
		info.crit = true
	}
	info.value = Math.round(value * (1 + target.getTotalAtt("healAdd")))
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