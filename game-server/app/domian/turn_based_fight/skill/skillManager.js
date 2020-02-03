var attackSkill = require("./attackSkill.js")
var healSkill = require("./healSkill.js")
var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var model = function() {}
model.init = function(fighting,locator,formula,seeded) {
	this.fighting = fighting
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
	if(skill.burn_buff_change){
		for(var i = 0;i < targets.length;i++){
			if(targets[i].died ||!targets[i].buffs["burn"]){
				break
			}
			var buffInfo = Object.assign({},skill.burn_buff_change,skill.character.burn_buff_change)
			if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
				buffManager.createBuff(skill.character,targets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
			}
		}
	}
	//判断buff
	if(skill.buffId){
		var buffTargets = this.locator.getBuffTargets(skill.character,skill.buff_tg,targets)
		let buffRate = skill.buffRate
		let buffArg = skill.buffArg
		//判断技能目标减少
		if(skill.character.less_skill_buffRate){
			let allLenth = this.locator.getTargetsNum(skill.targetType)
			buffRate += ((allLenth - targets.length + 1) / allLenth) * skill.character.less_skill_buffRate
		}
		if(skill.character.less_buff_arg){
			let allLenth = this.locator.getTargetsNum(skill.targetType)
			buffArg = buffArg * (1 + ((allLenth - targets.length + 1) / allLenth) * skill.character.less_buff_arg)
			console.log("buffArg",buffArg)
		}
		for(var i = 0;i < buffTargets.length;i++){
			if(buffTargets[i].died){
				break
			}
			if(this.seeded.random("判断BUFF命中率") < buffRate){
				buffManager.createBuff(skill.character,buffTargets[i],{buffId : skill.buffId,buffArg : buffArg,duration : skill.duration})
			}
		}
	}
	//判断自身生命值恢复
	if(skill.self_heal){
		var recordInfo =  skill.character.onHeal(skill.character,{type : "heal",value : skill.character.getTotalAtt("maxHP") * skill.self_heal},skill)
		recordInfo.type = "self_heal"
		fightRecord.push(recordInfo)
	}
	//判断自身怒气恢复
	if(skill.skill_anger_s)
		skill.character.addAnger(skill.skill_anger_s,skill.skillId)
	//判断全队怒气恢复
	if(skill.skill_anger_a)
		for(var i = 0;i < skill.character.team.length;i++)
			if(!skill.character.team[i].died)
				skill.character.team[i].addAnger(skill.skill_anger_a,skill.skillId)
	if(skill.skill_less_anger){
		for(var i = 0;i < targets.length;i++){
			if(targets[i].died){
				break
			}
			targets[i].lessAnger(skill.skill_less_anger,skill.skillId)
		}
	}
	if(skill.isAnger && !skill.character.died){
		//释放技能后恢复自身怒气
		if(skill.character.skill_anger_s)
			skill.character.addAnger(skill.character.skill_anger_s)
		//释放技能后恢复全体队友怒气
		if(skill.character.skill_anger_a)
			for(var i = 0;i < skill.character.team.length;i++)
				if(!skill.character.team[i].died)
					skill.character.team[i].addAnger(skill.character.skill_anger_a)
		//释放技能后回复当前本方阵容站位最靠前的武将怒气
		if(skill.character.skill_anger_first){
			let tmpTargets = this.locator.getTargets(skill.character,"team_min_index")
			for(var i = 0;i < tmpTargets.length;i++){
				tmpTargets[i].addAnger(skill.character.skill_anger_first)
			}
		}
		//释放技能后恢复己方后排怒气
		if(skill.character.skill_anger_back){
			let tmpTargets = this.locator.getTargets(skill.character,"team_horizontal_back")
			for(var i = 0;i < tmpTargets.length;i++){
				tmpTargets[i].addAnger(skill.character.skill_anger_back)
			}
		}
		//释放技能后降低敌人怒气
		if(skill.character.skill_less_anger){
			for(var i = 0;i < targets.length;i++){
				if(targets[i].died){
					break
				}
				targets[i].lessAnger(skill.character.skill_less_anger)
			}
		}
		//释放技能后追加技能
		if(skill.character.skill_later_skill && this.seeded.random("判断追加技能") < skill.character.skill_later_skill.rate){
			let tmpSkillInfo = Object.assign({skillId : skill.skillId,name : skill.name},skill.character.skill_later_skill)
			let tmpSkill = this.createSkill(tmpSkillInfo,skill.character)
			this.useSkill(tmpSkill)
		}
		//释放技能后追加BUFF
		if(skill.character.skill_later_buff){
			let buffTargets = this.locator.getBuffTargets(skill.character,skill.character.skill_later_buff.buff_tg,targets)
			for(var i = 0;i < buffTargets.length;i++){
				if(!buffTargets[i].died){
					var buffInfo = skill.character.skill_later_buff
					if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
						buffManager.createBuff(skill.character,buffTargets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
			}
		}
	}else if(!skill.character.died){
		//普攻后恢复自身怒气
		if(skill.character.normal_add_anger)
			skill.character.addAnger(skill.character.normal_add_anger)
		//普攻后降低目标怒气
		if(skill.character.normal_less_anger){
			for(var i = 0;i < targets.length;i++){
				targets[i].lessAnger(skill.character.normal_less_anger)
			}
		}
		//普攻后追加BUFF
		if(skill.character.normal_later_buff){
			let buffInfo = skill.character.normal_later_buff
			let buffRate = buffInfo.buffRate
			//判断技能目标减少
			if(skill.character.less_normal_buffRate){
				let allLenth = this.locator.getTargetsNum(skill.targetType)
				buffRate += ((allLenth - targets.length + 1) / allLenth) * skill.character.less_normal_buffRate
			}
			for(var i = 0;i < targets.length;i++){
				if(!targets[i].died){
					if(this.seeded.random("判断BUFF命中率") < buffRate){
						buffManager.createBuff(skill.character,targets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
			}
		}
	}
	//判断死亡
	for(var i = 0;i < targets.length;i++){
		if(targets[i].died){
			//复活判断
			if(targets[i].teamInfo.resurgence_team){
				targets[i].resurgence(targets[i].teamInfo.resurgence_team)
				delete targets[i].teamInfo.resurgence_team
			}
			//死亡释放技能判断
			if(targets[i].died_use_skill){
				this.useSkill(targets[i].angerSkill)
			}
		}
	}
}
//伤害技能
model.useAttackSkill = function(skill) {
	var recordInfo = skill.getInfo()
	recordInfo.targets = []
	if(this.locator.getTargetsNum(skill.targetType) > 1){
		recordInfo.group = true
	}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	if(!targets.length){
		fightRecord.push(recordInfo)
		return []
	}
	var addAmp = 0
	//判断技能目标减少
	if(targets.length && (skill.addAmp || skill.character.skill_less_amp)){
		var lessNum = this.locator.getTargetsNum(skill.targetType) - targets.length
		if(lessNum > 0){
			addAmp += (skill.addAmp + skill.character.skill_less_amp) * lessNum
		}
	}
	//判断敌方阵亡伤害加成
	if(skill.character.enemy_died_amp){
		let dieNum = 0
		for(var i = 0;i < skill.character.enemy.length;i++){
			if(!skill.character.enemy[i].isNaN && skill.character.enemy[i].died){
				dieNum++
			}
		}
		if(dieNum)
			addAmp += dieNum * skill.character.enemy_died_amp
	}
	var allDamage = 0
	var kill_num = 0
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		//计算伤害
		let info = this.formula.calDamage(skill.character, target, skill,addAmp)
		info = target.onHit(skill.character,info,skill)
		allDamage += info.realValue
		recordInfo.targets.push(info)
		if(info.kill){
			kill_num++
		}
	}
	fightRecord.push(recordInfo)
	if(kill_num){
		if(skill.kill_amp || skill.character.kill_amp)
			skill.character.addAtt("amplify",(skill.kill_amp + skill.character.kill_amp) * kill_num)
		if(skill.character.kill_anger)
			skill.character.addAnger(skill.character.kill_anger * kill_num,skill.skillId)
		if(skill.character.kill_crit)
			skill.character.addAtt("crit",skill.character.kill_crit * kill_num)
		if(skill.character.kill_heal){
			let tmpRecord = {type : "other_heal",targets : []}
			tmpRecord.targets.push(skill.character.onHeal(skill.character,{value : skill.character.getTotalAtt("maxHP") * skill.character.kill_heal * kill_num},skill))
			fightRecord.push(tmpRecord)
		}
		if(skill.character.kill_must_crit){
			skill.character.next_must_crit = true
		}
	}
	//伤害值转生命判断
	if(allDamage){
		if(skill.turn_rate && skill.turn_tg && !skill.character.died){
			let tmpRecord = {type : "other_heal",targets : []}
			let healValue = Math.round(allDamage * (skill.turn_rate + skill.character.skill_turn_rate)) || 1
			let tmptargets = this.locator.getTargets(skill.character,skill.turn_tg)
			for(var i = 0;i < tmptargets.length;i++){
				let target = tmptargets[i]
				let info = this.formula.calHeal(skill.character,target,healValue)
				info = target.onHeal(skill.character,info,skill)
				tmpRecord.targets.push(info)
			}
			fightRecord.push(tmpRecord)
		}else if(skill.isAnger && skill.character.skill_turn_rate && skill.character.skill_turn_tg && !skill.character.died){
			let tmpRecord = {type : "other_heal",targets : []}
			let healValue = Math.round(allDamage * skill.character.skill_turn_rate) || 1
			let tmptargets = this.locator.getTargets(skill.character,skill.character.skill_turn_tg)
			for(var i = 0;i < tmptargets.length;i++){
				let target = tmptargets[i]
				let info = this.formula.calHeal(skill.character,target,healValue)
				info = target.onHeal(skill.character,info,skill)
				tmpRecord.targets.push(info)
			}
			fightRecord.push(tmpRecord)
		}
		if(!skill.isAnger && skill.character.normal_burn_turn_heal){
			let flag = false
			for(var i = 0;i < targets.length;i++){
				if(targets[i].buffs["burn"]){
					flag = true
					break
				}
			}
			if(flag){
				let tmpRecord = {type : "other_heal",targets : []}
				let info = this.formula.calHeal(skill.character,skill.character,skill.character.normal_burn_turn_heal * allDamage)
				info = skill.character.onHeal(skill.character,info,skill)
				tmpRecord.targets.push(info)
				fightRecord.push(tmpRecord)
			}
		}
	}
	//受伤判断
	for(var i = 0;i < recordInfo.targets.length;i++){
		if(!targets[i].died){
			//受到直接伤害转化成生命
			if(targets[i].hit_turn_rate && targets[i].hit_turn_tg && recordInfo.targets[i].realValue){
				let tmpRecord = {type : "other_heal",targets : []}
				let healValue = Math.round(recordInfo.targets[i].realValue * targets[i].hit_turn_rate) || 1
				let tmptargets = this.locator.getTargets(targets[i],targets[i].hit_turn_tg)
				for(var j = 0;j < tmptargets.length;j++){
					let target = tmptargets[j]
					let info = this.formula.calHeal(skill.character,target,healValue)
					info = target.onHeal(targets[j],info)
					tmpRecord.targets.push(info)
				}
				fightRecord.push(tmpRecord)
			}
			//降低攻击者怒气
			if(targets[i].hit_less_anger){
				skill.character.lessAnger(targets[i].hit_less_anger)
			}
			//收到伤害附加BUFF
			if(targets[i].hit_buff){
				var buffInfo = targets[i].hit_buff
				if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
					buffManager.createBuff(targets[i],skill.character,{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
				}
			}
			//收到直接伤害反弹
			if(targets[i].hit_rebound){
				let hit_rebound_value = targets[i].hit_rebound + targets[i].hit_rebound_add
				let tmpRecord = {type : "other_damage",value : hit_rebound_value * recordInfo.targets[i].realValue}
				tmpRecord = skill.character.onHit(targets[i],tmpRecord)
				fightRecord.push(tmpRecord)
				console.log("伤害反弹")
			}
		}
	}
	//判断攻击目标大于三人则增加两点怒气
	if(skill.thr_anger){
		if(targets.length >= 3){
			skill.character.addAnger(2,skill.skillId)
		}
	}
	//追加普通攻击判断(仅怒气技能生效)
	if((skill.isAnger && (skill.add_d_s || skill.character.skill_add_d_s)) || (kill_num && skill.character.kill_add_d_s)){
		if(skill.character.add_d_s_crit){
			skill.character.must_crit = true
			this.useSkill(skill.character.defaultSkill)
			skill.character.must_crit = false
		}else{
			this.useSkill(skill.character.defaultSkill)
		}
	}
	return targets
}
//恢复技能
model.useHealSkill = function(skill) {
	var recordInfo = skill.getInfo()
	recordInfo.targets = []
	if(this.locator.getTargetsNum(skill.targetType) > 1){
		recordInfo.group = true
	}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	let rate = 1
	if(skill.character.skill_heal_amp && skill.isAnger)
		rate += skill.character.skill_heal_amp
	else if(skill.character.normal_heal_amp && !skill.isAnger){
		rate += skill.character.normal_heal_amp
	}
	var min_hp_friend = null
	if(skill.isAnger && skill.character.heal_min_hp_rate){
		min_hp_friend = this.locator.getTargets(skill.character,"team_minHp_1")[0]
	}
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		let value = 0
		if(skill.healType == "atk"){
			value = Math.round(skill.character.getTotalAtt("atk") * skill.mul * rate)
		}else if(healType == "hp"){
			value = Math.round(target.getTotalAtt("maxHP") * skill.mul * rate)
		}else{
			console.error("healType error "+healType)
		}
		if(min_hp_friend && min_hp_friend == target){
			value = Math.round(value * (skill.character.heal_min_hp_rate + 1))
		}
		let info = this.formula.calHeal(skill.character,target,value)
		info = target.onHeal(skill.character,info,skill)
		recordInfo.targets.push(info)
	}
	fightRecord.push(recordInfo)
	return targets
}
module.exports = model