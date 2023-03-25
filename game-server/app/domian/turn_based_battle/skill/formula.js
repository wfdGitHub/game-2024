//数值计算
var model = function(fighting) {
	this.fighting = fighting
}
//直接伤害计算
model.prototype.calDamage = function(attacker,target,skill) {
	attacker.clearTmpInfo()
	target.clearTmpInfo()
	var info = {}
	info.id = target.id
	info.value = 0
	var d_type = skill.d_type
	//伤害类型根据目标最低防御属性选择
	if(skill.talents.weak_damage_type){
		if(target.getTotalAtt("main_mag") > target.getTotalAtt("main_phy"))
			d_type = "phy"
		else
			d_type = "mag"
	}
	info.d_type = d_type
	if(d_type == "mag")
		this.onMag(attacker,target,skill)
	else if(d_type == "phy")
		this.onPhy(attacker,target,skill)
	//闪避判断
	var dodge = target.getTotalAtt("hitDef") - attacker.getTotalAtt("hit")
	dodge = Math.min(dodge,0.9) 	//闪避率最高不超过90%
	if(this.randomCheck(dodge,"dodge")){
		info.dodge = true
		return info
	}
	//计算基础伤害量
	var basic = Math.ceil((attacker.getTotalAtt("atk") - target.getTotalAtt("armor") * (1 - attacker.getTotalAtt("ign_armor"))) * skill.atk_mul + skill.atk_value)
	//主属性增伤
	if(d_type == "mag")
		basic += Math.ceil(basic * (attacker.getTotalAtt("magAmp") - target.getTotalAtt("magDef")))
	else if(d_type == "phy")
		basic += Math.ceil(basic * (attacker.getTotalAtt("phyAmp") - target.getTotalAtt("phyDef")))

	basic = Math.ceil(basic * (1 + attacker.getTotalAtt("amp") - target.getTotalAtt("ampDef")))
	basic = Math.ceil(basic * (1 - target.getTotalAtt("ampDefMain")))
	//格挡判断
	var block = target.getTotalAtt("block") - attacker.getTotalAtt("blockDef")
	block = Math.min(block,0.9) 	//格挡率最高不超过90%
	if(this.randomCheck(block,"block")){
		info.block = true
		basic = Math.ceil(basic * 0.5)
	}else{
		//暴击判断
		var crit = attacker.getTotalAtt("crit") - target.getTotalAtt("critDef")
		if(this.randomCheck(crit,"crit")){
			info.crit = true
			var slay = 1.5 + attacker.getTotalAtt("slay") - attacker.getTotalAtt("slayDef")
			basic = Math.ceil(basic * slay)
		}
	}
	info.value = basic
	this.onDamageOver(attacker,target,skill,info)
	return info
}
//间接伤害计算
model.prototype.calIndirectDamage = function(attacker,target,mul,value,d_type) {
	var basic = (attacker.getTotalAtt("atk") - target.getTotalAtt("armor")) * mul
	basic = Math.max(basic,1) + (value || 0)
	basic = Math.ceil(basic * (1 + attacker.getTotalAtt(d_type+"Amp") - target.getTotalAtt(d_type+"Def")))
	basic = Math.ceil(basic * (1 + attacker.getTotalAtt("amp") - target.getTotalAtt("ampDef")))
	basic = Math.ceil(basic * (1 - target.getTotalAtt("ampDefMain")))
	return basic
}
//治疗计算
model.prototype.calHeal = function(attacker,target,skill) {
	var info = {}
	info.id = target.id
	var basic = Math.ceil((attacker.getTotalAtt("atk")) * skill.heal_mul + skill.heal_value)
	basic += Math.ceil(basic * attacker.getTotalAtt("healAmp"))
	basic += Math.ceil(basic * target.getTotalAtt("healAdd"))
	info.value = basic
	return info
}
//外功伤害处理
model.prototype.onPhy = function(attacker,target,skill) {
	//外功暴击加成
	if(skill.talents.phy_slay)
		attacker.changeTotalTmp("slay",skill.talents.phy_slay)
}
//内功伤害处理
model.prototype.onMag = function(attacker,target,skill) {
	//内功忽视护甲
	if(skill.talents.mag_ign_armor)
		attacker.changeTotalTmp("ign_armor",skill.talents.mag_ign_armor)
}
//伤害计算完成后处理
model.prototype.onDamageOver = function(attacker,target,skill,info) {
	if(skill.talents.maxHP_damage)
		info.value += Math.floor(target.getTotalAtt("maxHP") * skill.talents.maxHP_damage)
}
model.prototype.randomCheck = function(num,reason) {
	return this.fighting.random(reason) < num ? true : false
}
module.exports = model