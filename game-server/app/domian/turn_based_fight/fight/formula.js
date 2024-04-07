var buffManager = require("../buff/buffManager.js")
var species = require("../../../../config/gameCfg/species.json")
var formula = function(seeded,otps={}) {
	this.seeded = seeded
	this.phyRate = otps.phyRate || 1
	this.magRate = otps.magRate || 1
}
//伤害计算
formula.prototype.calDamage = function(attacker, target, skill,addAmp,must_crit,chase) {
	var info = {type : "damage",value : 0}
	var tmpAmplify = 0
	var tmpCrit = 0
	//攻击时目标存在对应BUFF自身属性改变
	if(attacker.otps.target_exist_buff_name && target.buffs[attacker.otps.target_exist_buff_name])
		attacker.changeTotalTmp(attacker.otps.target_exist_buff_att,attacker.otps.target_exist_buff_value)
	//被攻击时敌方存在对应BUFF自身属性改变
	if(target.otps.behit_exist_buff_name && attacker.buffs[target.otps.behit_exist_buff_name])
		target.changeTotalTmp(target.otps.behit_exist_buff_att,target.otps.behit_exist_buff_value)
	if(attacker.damage_always_burn || target.buffs["burn"]){
		if(skill.isAnger){
			if(skill.burn_att_change_skill || skill.character.burn_att_change_skill){
				var attInfo = Object.assign({},skill.burn_att_change_skill)
				tmpAmplify += attInfo["amplify"] || 0
				tmpCrit += attInfo["crit"] || 0
				if(skill.character.burn_att_change_skill){
					tmpAmplify += skill.character.burn_att_change_skill["amplify"] || 0
					tmpCrit += skill.character.burn_att_change_skill["crit"] || 0
				}
			}
		}else{
			if(skill.burn_att_change_normal || skill.character.burn_att_change_normal){
				var attInfo = Object.assign({},skill.burn_att_change_normal)
				tmpAmplify += attInfo["amplify"] || 0
				tmpCrit += attInfo["crit"] || 0
				if(skill.character.burn_att_change_normal){
					tmpAmplify += skill.character.burn_att_change_normal["amplify"] || 0
					tmpCrit += skill.character.burn_att_change_normal["crit"] || 0
				}
			}
		}
	}
	if(attacker.target_anger_amp && target.curAnger > 4){
		tmpAmplify += attacker.target_anger_amp * (target.curAnger - 4)
	}
	if(attacker.control_amp && (target.buffs["disarm"] || target.buffs["dizzy"] || target.buffs["silence"] || target.buffs["frozen"] || target.buffs["chaofeng"])){
		tmpAmplify += attacker.control_amp
	}
	//命中判断
	if(attacker.characterType != "master"){
		var dodgeFlag = false
		if(target.dodgeState){
			target.dodgeState = false
			dodgeFlag = true
		}else if(!attacker.skill_must_hit && !target.buffs["suoding"]){
			var hitRate = 1 + attacker.getTotalAtt("hitRate") - target.getTotalAtt("dodgeRate")
			if(target.attInfo.hp < target.attInfo.maxHP && target.low_hp_dodge){
				hitRate -= Math.floor((target.attInfo.maxHP-target.attInfo.hp)/target.attInfo.maxHP * 10) * target.low_hp_dodge
			}
			if(this.seeded.random("闪避判断") > hitRate)
				dodgeFlag = true
		}
		if(dodgeFlag){
			info.miss = true
			target.onMiss()
			return info
		}
	}
	//暴击判断
	if(!skill.isAnger && attacker.normal_crit){
		info.crit = true
	}else if(must_crit){
		info.crit = true
	}else{
		var crit = attacker.getTotalAtt("crit") - target.getTotalAtt("critDef") + tmpCrit
		crit += attacker[skill.damageType+"_crit"] || 0
		if(skill.tmp_crit)
			crit += skill.tmp_crit
		if(attacker.attInfo.hp < attacker.attInfo.maxHP && attacker.low_hp_crit){
			crit += Math.floor((attacker.attInfo.maxHP-attacker.attInfo.hp)/attacker.attInfo.maxHP * 10) * attacker.low_hp_crit
		}
		if(attacker.otps.wushu_crit && target.buffs["wushu"])
			crit += attacker.otps.wushu_crit
		if(attacker.must_crit || attacker.buffs["baonu"] || attacker.buffs["kb_polang"] || this.seeded.random("暴击判断") < crit){
			info.crit = true
		}
	}
	//伤害计算
	var atk = attacker.getTotalAtt("atk")
	atk += attacker[skill.damageType+"Atk"]
	if(skill.skillType == "power")
		atk += skill.basic
	var def = target.getTotalAtt(skill.damageType+"Def")
	var neglect_def = 0
	if(attacker.neglect_def || skill.neglect_def)
		neglect_def += (attacker.neglect_def || 0) + (skill.neglect_def || 0)
	neglect_def += attacker["neglect_"+skill.damageType]
	if(neglect_def > 1)
		neglect_def = 1
	def = Math.floor(def * (1 - neglect_def))
	var mul = 1
	if(attacker.characterType != "master")
		mul += attacker.getTotalAtt("amplify") - target.getTotalAtt("reduction")
	if(mul < 0.1)
		mul = 0.1
	if(tmpAmplify)
		mul *= 1 + tmpAmplify
	if(skill.isAnger && attacker.skill_attack_amp)
	 	mul *= 1 + attacker.skill_attack_amp - target.skill_attack_def
	else if(!skill.isAnger && attacker.normal_attack_amp)
		mul *=1 + attacker.normal_attack_amp
	if(attacker.attInfo.hp < attacker.attInfo.maxHP && attacker.low_hp_amp)
		mul *= 1 + Math.floor((attacker.attInfo.maxHP-attacker.attInfo.hp)/attacker.attInfo.maxHP * 10) * attacker.low_hp_amp
	if(target.burn_hit_reduction){
		if(attacker.buffs["burn"])
			mul *= 1 - target.burn_hit_reduction
	}
	if(attacker.first_amp && attacker.fighting.round == 1){
		mul *= 1 + attacker.first_amp
	}
	if(target.buffs["dizzy"] && target.buffs["dizzy"].releaser && target.buffs["dizzy"].releaser.realm_dizzy_amp && target.buffs["dizzy"].releaser.realm == attacker.realm){
		mul *= 1 + target.buffs["dizzy"].releaser.realm_dizzy_amp
	}
	if(target.realm_friend_reduction){
		mul *= 1 - (target.realm_friend_reduction * (target.teamInfo["realms_survival"][target.realm] - 1))
	}
	if(attacker.realm_friend_amp){
		mul *= 1 + (attacker.realm_friend_amp * (attacker.teamInfo["realms_survival"][attacker.realm] - 1))
	}
	if(skill["camp_amp_"+target.realm])
		mul *= 1 + skill["camp_amp_"+target.realm]
	if(attacker.power_up && skill.skillType == "power")
		mul *= 1 + attacker.power_up
	if(attacker.otps.refrain_huyou && (target.otps.huyou !== undefined || target.otps.guiyi !== undefined))
		mul *= 1 + attacker.otps.refrain_huyou
	if(attacker.otps.refrain_wushu && target.otps.pass_wushu)
		mul *= 1 + attacker.otps.refrain_wushu
	info.value = Math.ceil(((atk*atk)/(atk+def)) * skill.mul * mul)
	if(addAmp)
		info.value = Math.ceil(info.value * (1+addAmp))
	//破冰一击
	if(skill.thawing_frozen && target.buffs["frozen"]){
		target.buffs["frozen"].destroy()
		var tmpRate = skill.thawing_frozen
		if(attacker.thawing_frozen)
			tmpRate += attacker.thawing_frozen
		info.value += Math.floor(tmpRate * info.value)
		if(attacker.pbyj_qs)
			target.removeIntensifyBuff()
	}
	//水龙冲击
	if(skill.thawing_burn && target.buffs["burn"]){
		target.buffs["burn"].destroy()
		var tmpRate = skill.thawing_burn
		if(skill.character.thawing_burn)
			tmpRate += skill.character.thawing_burn
		info.value += Math.floor(tmpRate * info.value)
		if(attacker.thawing_burn_hudun)
			buffManager.createBuff(attacker,attacker,{buffId : "shield",buffArg : attacker.thawing_burn_hudun,duration : 1})
		if(attacker.thawing_burn_anger)
			attacker.addAnger(attacker.thawing_burn_anger)
		if(attacker.slcj_zs)
			buffManager.createBuff(attacker,target,{"buffId":"forbidden","duration":1})
		if(attacker.slcj_xy)
			buffManager.createBuff(attacker,target,{"buffId":"dizzy","duration":1})
	}
	if(target.buffs["flash"]){
		var count = 0
		if(attacker.flash_settle){
			count = target.buffs["flash"].getValue()
			target.buffs["flash"].destroy()
		}else{
			count = 1
			target.buffs["flash"].useBuff()
		}
		info.value +=  Math.floor(0.04 * target.attInfo.maxHP * count)
		if(attacker.gd_mb && this.seeded.random("gd_mb") < attacker.gd_mb)
			buffManager.createBuff(attacker,target,{"buffId":"disarm","duration":1})
		//释放技能时，每命中一个感电状态下的目标恢复自身1点怒气
		if(attacker.skill_flash_anger)
			attacker.addAnger(attacker.skill_flash_anger)
	}
	if(target.buffs["weak"]){
		if(attacker.xr_zs && this.seeded.random("xr_zs") < attacker.xr_zs)
			buffManager.createBuff(attacker,target,{"buffId":"forbidden","duration":1})
	}
	if(info.crit){
		info.value = Math.round(info.value * (1.5 + attacker.getTotalAtt("slay") - target.getTotalAtt("slayDef")))
		
		if(skill.isAnger && attacker.skill_crit_maxHp){
			info.value +=  Math.floor(attacker.skill_crit_maxHp * target.attInfo.maxHP)
		}
		if(target.buffs["crit_seal"]){
			info.value +=  Math.floor(0.08 * target.attInfo.maxHP)
			target.buffs["crit_seal"].useBuff()
		}
	}
	//种族克制
	if(skill.skillType !== "power"){
		var specieRate = species[attacker.realm][target.realm]
		if(target.specie_immune == skill.specie)
			specieRate = specieRate * 0.1
		if(specieRate > 1){
			if(target.specie_behit)
				specieRate = target.specie_behit * specieRate
			if(attacker.specie_hit)
				specieRate = attacker.specie_hit * specieRate
		}
		info.spe = specieRate
		info.value = Math.floor(info.value * specieRate)
	}
	
	//物理法术伤害加成减免
	var typeAdd = attacker.getTotalAtt(skill.damageType+"_add") - target.getTotalAtt(skill.damageType+"_def")
	info.value += Math.floor(info.value * typeAdd)

	//物理法术增伤BUFF
	if(attacker.buffs["amplify_"+skill.damageType]){
		info.value += Math.floor(info.value * attacker.buffs["amplify_"+skill.damageType].value)
	}
	//判断震慑
	if(attacker.buffs["zhenshe"] && target.realm == 2){
		info.value = Math.floor(info.value * 0.64)
	}
	//判断锁定
	if(target.buffs["suoding"]){
		info.value = Math.floor(info.value * 1.2)
	}
	//判断沙尘暴
	if(target.buffs["sand"] && target.buffs["sand"].releaser == attacker){
		info.value = Math.floor(info.value * 1.3)
	}
	//免伤BUFF
	if(target.buffs["armor"]){
		info.value = Math.floor(info.value * (1-target.buffs["armor"].value))
	}
	//闪避对神武智慧减伤
	if(target.sb_acc && (attacker.sw_acc || attacker.zh_acc)){
		info.value = Math.floor(info.value * (1-target.sb_acc))
	}
	//瞄准对闪避增伤
	if(attacker.mz_acc && target.sb_acc){
		info.value = Math.floor(info.value * (1+attacker.mz_acc))
	}
	//威压对愈合亲和增伤
	if(attacker.wy_acc && (target.qh_acc || target.yh_acc)){
		info.value = Math.floor(info.value * (1+attacker.wy_acc))
	}
	//嘲讽减伤
	if(attacker.buffs["chaofeng"] && target.cfRed){
		info.value = Math.floor(info.value * (1-target.cfRed))
	}
	//法术伤害波动
	if(attacker.mag_fluctuate && skill.damageType == "mag"){
		info.value = Math.floor(info.value * (attacker.mag_fluctuate + this.seeded.random("法术波动") * 0.3))
	}
	//受击伤害加成
	if(attacker.behit_value)
		info.value += Math.floor(info.value * attacker.behit_value)
	//回合伤害加成
	if(attacker.round_amplify)
		info.value += Math.floor(info.value * attacker.round_amplify * (attacker.fighting.round - 1))
	//每个减益BUFF伤害加成
	if(attacker.enemy_low_amp){
		info.value += Math.floor(info.value * attacker.enemy_low_amp * target.getDebuffNum())
	}
	//有减益BUFF伤害加成减免
	if(target.getDebuffNum() && (attacker.enemy_debuff_amp || target.my_debuff_red)){
		info.value += Math.floor(info.value * (attacker.enemy_debuff_amp - target.my_debuff_red))
	}
	//增益伤害加成
	if(attacker.my_intensify_amp){
		info.value += Math.floor(info.value * attacker.my_intensify_amp * attacker.getIntensifyNum())
	}
	//对方存在增益效果加成
	if(attacker.otps.enemy_intensify_amp && target.getIntensifyNum())
		info.value += Math.floor(info.value * attacker.otps.enemy_intensify_amp)
	//战法伤害加成
	if(attacker.zf_amp){
		info.value += Math.floor(info.value * attacker.zf_amp)
	}
	//己方同阵营英雄行动后，自身伤害提升，最多叠加4次
	if(attacker.realm_action_amp && attacker.teamInfo["realms_ation"][attacker.realm]){
		var count = attacker.teamInfo["realms_ation"][attacker.realm]
		if(count > 4)
			count = 4
		info.value += Math.floor(info.value * attacker.realm_action_amp * count)
	}
	//每回合首次受到伤害减免
	if(skill.isAnger && target.first_beSkill_red && target.first_beSkill_flag){
		target.first_beSkill_flag = false
		info.value -= Math.floor(info.value * target.first_beSkill_red)
	}
	//行动前伤害减免
	if(target.before_action_red && !target.action_flag){
		info.value -= Math.floor(info.value * target.before_action_red)
	}
	//伤害吸收盾伤害减免
	if(target.buffs["shield"] && target.shield_red){
		info.value -= Math.floor(info.value * target.shield_red)
	}
	//对重伤状态下的目标伤害提升
	if(attacker.forbidden_amp && target.buffs["forbidden"]){
		info.value += Math.floor(info.value * attacker.forbidden_amp)
	}
	//对流血状态下的目标伤害提升
	if(attacker.bleed_amp && target.buffs["bleed"]){
		info.value += Math.floor(info.value * attacker.bleed_amp)
	}
	//破甲伤害加成
	if(attacker.pojia_amp && target.buffs["pojia"]){
		info.value += Math.floor(info.value * target.buffs["pojia"].getValue() * attacker.pojia_amp)
	}
	//场景伤害加成
	if(skill.damageType == "phy"){
		info.value = Math.floor(info.value * this.phyRate)
	}else if(skill.damageType == "mag"){
		info.value = Math.floor(info.value * this.magRate)
	}
	//本回合受到同一英雄伤害减免
	if(target.round_same_hit_red && target.round_same_value[attacker.id]){
		info.value = Math.floor(info.value * Math.max((1 - (target.round_same_value[attacker.id] * target.round_same_hit_red)),0))
	}
	//耐力对强力减免
	if(attacker.otps.pass_ql && target.otps.pass_nl)
		info.value = Math.floor(info.value * 0.8)
	//弱点加成
	if(target.otps["ruodian_"+attacker.realm])
		info.value += Math.floor(info.value * target.otps["ruodian_"+attacker.realm])
	//最大生命值加成
	var hpRate = attacker.getTotalAtt("HP_damage")
	if(chase){
		if(!skill.isAnger)
			hpRate += attacker.add_default_maxHp
		else if(attacker.add_anger_maxHp)
				hpRate += attacker.add_anger_maxHp
	}
	if(skill.maxHP_damage)
		hpRate += skill.maxHP_damage
	//技能最大生命值加成
	if(skill.isAnger){
		if(attacker.polang_power && attacker.buffs["polang"])
			hpRate += attacker.buffs["polang"].getValue() * attacker.polang_power
		if(attacker.skill_bleed_maxHp && target.buffs["bleed"])
			hpRate += target.buffs["bleed"].getValue() * attacker.skill_bleed_maxHp
		if(attacker.fanzhi_damage && attacker.buffs["fanzhi"])
			hpRate += attacker.buffs["fanzhi"].getValue() * attacker.fanzhi_damage
		if(attacker.maxHP_damage)
			hpRate += attacker.maxHP_damage
	}
	if(hpRate){
		info.realDamage = Math.floor(target.attInfo.maxHP * hpRate)
		info.value += info.realDamage
	}
	//减伤判断
	if(target.reduction_over){
		if(info.value >= target.attInfo.maxHP * 0.4){
			info.value = Math.floor(info.value * (1-target.reduction_over))
		}
	}
	info.value = Math.floor(skill.tmpMul * info.value)
	//最小伤害
	if (info.value <= 1)
		info.value = 1
	attacker.clearTmpInfo()
	target.clearTmpInfo()
    return info
}
//治疗计算
formula.prototype.calHeal = function(character,target,value,skill){
	var info = {type : "heal",value : 0}
	//暴击判断
	if(!skill.isAnger && character.normal_crit){
		info.crit = true
	}else{
		if(this.seeded.random("治疗暴击判断") < character.getTotalAtt("healRate")){
			info.crit = true
		}
	}
	info.value = Math.round(value * (1 + target.getTotalAtt("healAdd")))
	if(info.crit){
		info.value = Math.round(info.value * 1.5)
	}
	if(character.power_up && skill.skillType == "power")
		info.value = Math.floor((1 + character.power_up) * info.value)
	//目标血量每减少10%，对其造成的的治疗量加成
	if(target.attInfo.hp < target.attInfo.maxHP && character.low_hp_heal)
		info.value = Math.round(info.value * (1 + Math.floor((target.attInfo.maxHP-target.attInfo.hp)/target.attInfo.maxHP * 10) * character.low_hp_heal))
	//最小治疗
	if (info.value <= 1) {
		info.value = 1
	}
	return info
}
module.exports = formula