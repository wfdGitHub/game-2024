var formula = function(seeded) {
	this.seeded = seeded
}
//伤害计算
formula.prototype.calDamage = function(attacker, target, skill,addAmp,must_crit,chase) {
	var info = {type : "damage",value : 0}
	var tmpAmplify = 0
	var tmpCrit = 0
	if(target.buffs["burn"]){
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
	if(attacker.control_amp && (target.buffs["disarm"] || target.buffs["dizzy"] || target.buffs["silence"])){
		tmpAmplify += attacker.control_amp
	}
	//命中判断
	if(!(skill.isAnger && attacker.skill_must_hit)){
		var hitRate = 1 + attacker.getTotalAtt("hitRate") - target.getTotalAtt("dodgeRate")
		if(this.seeded.random("闪避判断") > hitRate){
			info.miss = true
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
		if(attacker.low_hp_crit){
			crit += Math.floor((attacker.attInfo.maxHP-attacker.attInfo.hp)/attacker.attInfo.maxHP * 10) * attacker.low_hp_crit
		}
		if(attacker.must_crit || this.seeded.random("暴击判断") < crit){
			info.crit = true
		}
	}
	//伤害计算
	var atk = attacker.getTotalAtt("atk")
	var def = target.getTotalAtt(skill.damageType+"Def")
	var mul = 1 + attacker.getTotalAtt("amplify") - target.getTotalAtt("reduction")
	if(mul < 0.1)
		mul = 0.1
	if(tmpAmplify)
		mul *= 1 + tmpAmplify
	if(skill.isAnger)
	 	mul *= 1 + attacker.skill_attack_amp
	else
		mul *=1 + attacker.normal_attack_amp
	if(attacker.low_hp_amp)
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
	info.value = Math.round((atk - def) * skill.mul * mul)
	if(addAmp){
		info.value = Math.round(info.value * (1+addAmp))
	}
	if(info.crit){
		info.value = Math.round(info.value * (1.5 + attacker.getTotalAtt("slay") - target.getTotalAtt("slayDef")))
		if(skill.isAnger && attacker.skill_crit_maxHp){
			info.value +=  Math.floor(attacker.skill_crit_maxHp * target.attInfo.maxHP)
		}
	}
	if(chase){
		if(!skill.isAnger){
			if(attacker.add_default_maxHp){
				info.realDamage = Math.floor(target.attInfo.maxHP * attacker.add_default_maxHp)
				info.value += info.realDamage
			}
		}
	}else{
		if(skill.isAnger){
			if(attacker.maxHP_damage || skill.maxHP_damage){
				var tmpRate = attacker.maxHP_damage + skill.maxHP_damage
				info.realDamage = Math.floor(target.attInfo.maxHP * tmpRate)
				info.value += info.realDamage
			}
		}
	}
	if(target.buffs["reduction"]){
		info.value = Math.floor(info.value * (1-target.buffs["reduction"]["value"]))
	}
	if(target.reduction_over){
		if(info.value >= target.attInfo.maxHP * 0.4){
			info.value = Math.floor(info.value * (1-target.reduction_over))
		}
	}
	//最小伤害
	if (info.value <= 1) {
		info.value = 1
	}
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
	//目标血量每减少10%，对其造成的的治疗量加成
	if(character.low_hp_heal)
		info.value = Math.round(info.value * (1 + Math.floor((target.attInfo.maxHP-target.attInfo.hp)/target.attInfo.maxHP * 10) * character.low_hp_heal))
	//最小治疗
	if (info.value <= 1) {
		info.value = 1
	}
	return info
}
module.exports = formula