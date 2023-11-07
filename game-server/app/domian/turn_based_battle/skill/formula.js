//数值计算
var model = function(fighting) {
	this.fighting = fighting
}
//直接伤害计算
model.prototype.calDamage = function(attacker,target,skill) {
	var info = {}
	info.id = target.id
	info.value = 0
	var d_type = skill.d_type
	//临时属性计算
	if(skill.talents.weak_damage_type){
		if(target.getTotalAtt("main_mag") > target.getTotalAtt("main_phy"))
			d_type = "phy"
		else
			d_type = "mag"
	}
	info.d_type = d_type
	if(info.d_type == "mag")
		this.onMag(attacker,target,skill)
	else if(info.d_type == "phy")
		this.onPhy(attacker,target,skill)
	if(target.buffs["mag_damage"])
		this.onMagBuff(attacker,target,skill)
	if(target.buffs["phy_damage"])
		this.onPhyBuff(attacker,target,skill)
	if(target.getHPRate() > 0.5)
		this.onHighHP(attacker,target,skill)
	//==========================开始计算伤害
	//闪避判断
	if(!target.buffs["vital_point"]){
		var dodge = target.getTotalAtt("hitDef") - attacker.getTotalAtt("hit") + (target.getTotalAtt("main_hit") - attacker.getTotalAtt("main_hit")) * 0.005
		dodge = Math.min(dodge,0.9) 	//闪避率最高不超过90%
		if(this.fighting.randomCheck(dodge,"dodge")){
			info.dodge = true
			return info
		}
	}
	//计算基础伤害量
	var basic = Math.ceil((attacker.getTotalAtt("atk") - target.getTotalAtt("armor") * Math.max(0,(1 - attacker.getTotalAtt("ign_armor")))) * skill.getTotalAtt("atk_mul") + skill.getTotalAtt("atk_value"))
	//技能增伤
	if(skill.isAnger)
		basic += Math.ceil(basic * (attacker.getTotalAtt("angerAmp") - target.getTotalAtt("angerDef")))
	else
		basic += Math.ceil(basic * (attacker.getTotalAtt("normalAmp") - target.getTotalAtt("normalDef")))
	//主属性增伤
	if(info.d_type == "mag"){
		basic += Math.ceil(basic * (attacker.getTotalAtt("magAmp") - target.getTotalAtt("magDef")))
		basic += Math.ceil(basic * (attacker.getTotalAtt("main_mag") - target.getTotalAtt("main_mag")) * 0.01)
	}
	else if(info.d_type == "phy"){
		basic += Math.ceil(basic * (attacker.getTotalAtt("phyAmp") - target.getTotalAtt("phyDef")))
		basic += Math.ceil(basic * (attacker.getTotalAtt("main_phy") - target.getTotalAtt("main_phy")) * 0.01)
	}
	basic = Math.ceil(basic * (1 + attacker.getTotalAtt("amp") - target.getTotalAtt("ampDef")))
	basic = Math.ceil(basic * (1 - (target.getTotalAtt("main_dr") - 60) / target.getTotalAtt("main_dr")))
	//格挡判断
	if(!target.buffs["vital_point"]){
		var block = target.getTotalAtt("block") - attacker.getTotalAtt("blockDef") + (target.getTotalAtt("main_slay") - attacker.getTotalAtt("main_slay")) * 0.005
		block = Math.min(block,0.9) 	//格挡率最高不超过90%
		if(this.fighting.randomCheck(block,"block")){
			info.block = true
			basic = Math.ceil(basic * 0.5)
		}
	}
	//暴击判断
	if(!info.block){
		var crit = attacker.getTotalAtt("crit") - target.getTotalAtt("critDef")
		if(this.fighting.randomCheck(crit,"crit")){
			info.crit = true
			var slay = 1.5 + attacker.getTotalAtt("slay") - attacker.getTotalAtt("slayDef") + (attacker.getTotalAtt("main_slay") - 60) * 0.006
			basic = Math.ceil(basic * slay)
		}
	}
	info.value = Math.max(basic,0)
	this.onDamageOver(attacker,target,skill,info)
	attacker.clearTmpInfo()
	target.clearTmpInfo()
	return info
}
//间接伤害计算
model.prototype.calIndirectDamage = function(attacker,target,mul,value,d_type) {
	var basic = (attacker.getTotalAtt("atk") - target.getTotalAtt("armor")) * mul
	basic = Math.max(basic,1) + (value || 0)
	basic = Math.ceil(basic * (1 + attacker.getTotalAtt(d_type+"Amp") - target.getTotalAtt(d_type+"Def")))
	basic = Math.ceil(basic * (1 + attacker.getTotalAtt("amp") - target.getTotalAtt("ampDef")))
	basic = Math.ceil(basic * (1 - (target.getTotalAtt("main_dr") - 60) * 0.006))
	if(target.buffs["buff_405095"])
		basic += Math.ceil(target.buffs["buff_405095"].getBuffMul() * basic)
	return basic
}
//中毒伤害计算
model.prototype.calPoisonDamage = function(attacker,target,mul,value) {
	var basic = (attacker.getTotalAtt("atk") - target.getTotalAtt("armor")) * mul
	basic = Math.max(basic,1) + (value || 0)
	basic = Math.ceil(basic * (1 - (target.getTotalAtt("main_dr") - 60) * 0.006))
	if(target.buffs["buff_405095"])
		basic += Math.ceil(target.buffs["buff_405095"].getBuffMul() * basic)
	return basic
}
//治疗计算
model.prototype.calHeal = function(attacker,target,skill) {
	var info = {}
	info.id = target.id
	var basic = Math.ceil((attacker.getTotalAtt("atk")) * skill.getTotalAtt("heal_mul") + skill.getTotalAtt("heal_value"))
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
	//若内力高于目标,造成的伤害提高提升
	if(attacker.buffs["buff_406022"]){
		var tmpValue = attacker.getTotalAtt("main_mag") - target.getTotalAtt("main_mag")
		tmpValue = Math.min(Math.max(tmpValue,0),100)
		attacker.changeTotalTmp("magAmp",tmpValue * attacker.buffs["buff_406022"].getBuffValue())
	}
}
//外伤BUFF处理
model.prototype.onPhy = function(attacker,target,skill) {
	//外功暴击加成
	if(skill.talents.phy_slay)
		attacker.changeTotalTmp("slay",skill.talents.phy_slay)
}
//存在内伤BUFF处理
model.prototype.onMagBuff = function(attacker,target,skill) {
	if(skill.talents.mag_buff_att1 && skill.talents.mag_buff_value1)
		attacker.changeTotalTmp(skill.talents.mag_buff_att1,skill.talents.mag_buff_value1)
	if(skill.talents.mag_buff_att2 && skill.talents.mag_buff_value2)
		attacker.changeTotalTmp(skill.talents.mag_buff_att2,skill.talents.mag_buff_value2)
	if(skill.talents.mag_buff_amp)
		attacker.changeTotalTmp(skill.talents.mag_buff_att1,skill.talents.mag_buff_value1)
}
//存在外伤BUFF处理
model.prototype.onPhyBuff = function(attacker,target,skill) {
	if(skill.talents.phy_buff_att1 && skill.talents.phy_buff_value1)
		attacker.changeTotalTmp(skill.talents.phy_buff_att1,skill.talents.phy_buff_value1)
	if(skill.talents.phy_buff_att2 && skill.talents.phy_buff_value2)
		attacker.changeTotalTmp(skill.talents.phy_buff_att2,skill.talents.phy_buff_value2)
}
//高于50%生命值处理
model.prototype.onHighHP = function(attacker,target,skill) {
	if(skill.talents.high_hp_crit_slay){
		attacker.changeTotalTmp("crit",skill.talents.high_hp_crit_slay)
		attacker.changeTotalTmp("slay",skill.talents.high_hp_crit_slay)
	}
}
//伤害计算完成后处理
model.prototype.onDamageOver = function(attacker,target,skill,info) {
	if(skill.talents.maxHP_damage)
		info.value += Math.floor(attacker.getTotalAtt("maxHP") * skill.talents.maxHP_damage)
	if(skill.talents.hp_low_amp)
		info.value += Math.floor(info.value * (1 - Math.min(1,target.getTotalAtt("hp") / target.getTotalAtt("maxHP"))) * skill.talents.hp_low_amp)
	if(skill.talents["career_amp_"+target.career])
		info.value += Math.floor(info.value * skill.talents["career_amp_"+target.career])
	if(target.talents["sexDef_"+attacker.sex])
		info.value = Math.floor(info.value * (1-target.talents["sexDef_"+attacker.sex]))
	if(attacker.talents.ctr_amp && target.checkControl())
		info.value += Math.floor(info.value * attacker.talents.ctr_amp)
}
module.exports = model