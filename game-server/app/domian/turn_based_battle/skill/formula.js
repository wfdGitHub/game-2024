//数值计算
var model = function(fighting) {
	this.fighting = fighting
}
//伤害计算
model.prototype.calDamage = function(attacker,target,skill) {
	var info = {}
	info.id = target.id
	info.value = 0
	//闪避判断
	var dodge = target.getTotalAtt("hitDef") - attacker.getTotalAtt("hit")
	dodge += (target.getTotalAtt("main_hit") - attacker.getTotalAtt("main_hit")) * 0.05
	dodge = Math.min(dodge,0.9) 	//闪避率最高不超过90%
	if(this.randomCheck(dodge,"dodge")){
		info.miss = true
		return info
	}
	//计算基础伤害量
	var basic = Math.ceil((attacker.getTotalAtt("atk") - target.getTotalAtt("armor")) * skill.atk_mul + skill.atk_value)
	//主属性增伤
	if(skill.damageType == "mag"){
		basic += Math.ceil(basic * (target.getTotalAtt("main_mag") - attacker.getTotalAtt("main_mag")) * 0.01)
		basic += Math.ceil(basic * (attacker.getTotalAtt("magAmp") - target.getTotalAtt("magDef")))
	}
	else if(skill.damageType == "phy"){
		basic += Math.ceil(basic * (target.getTotalAtt("main_phy") - attacker.getTotalAtt("main_phy")) * 0.01)
		basic += Math.ceil(basic * (attacker.getTotalAtt("phyAmp") - target.getTotalAtt("phyDef")))
	}
	basic = Math.ceil(basic * (1 + attacker.getTotalAtt("amp") - target.getTotalAtt("ampDef")))
	basic = Math.ceil(basic * (1 - (target.getTotalAtt("main_dr") - 50) * 0.008))
	//格挡判断
	var wuxing = attacker.getTotalAtt("main_slay") - target.getTotalAtt("main_slay")
	var block = target.getTotalAtt("block") - attacker.getTotalAtt("blockDef") - wuxing * 0.005
	block = Math.min(block,0.9) 	//格挡率最高不超过90%
	if(this.randomCheck(block,"block")){
		info.block = true
		basic = Math.ceil(basic * 0.5)
	}else{
		//暴击判断
		var crit = attacker.getTotalAtt("crit") - target.getTotalAtt("critDef")
		if(this.randomCheck(crit,"crit")){
			info.crit = true
			var slay = 1.5 + ((target.getTotalAtt("main_slay") - 50) * 0.006) + attacker.getTotalAtt("slay") - attacker.getTotalAtt("slayDef")
			basic = Math.ceil(basic * slay)
		}
	}
	info.value = basic
	return info
}
model.prototype.calHeal = function(attacker,target,skill) {
	var info = {}
	info.id = target.id
	var basic = Math.ceil((attacker.getTotalAtt("atk")) * skill.heal_mul + skill.heal_value)
	basic += Math.ceil(basic * attacker.getTotalAtt("healAmp"))
	basic += Math.ceil(basic * target.getTotalAtt("healAdd"))
	info.value = basic
	return info
}
model.prototype.randomCheck = function(num,reason) {
	return this.fighting.random(reason) < num ? true : false
}
module.exports = model