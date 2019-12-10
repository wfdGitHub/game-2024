var attackSkill = require("./attackSkill.js")
var healSkill = require("./healSkill.js")
var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var model = function() {}
model.init = function(locator,formula,seeded) {
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
			var burnBuffInfo = skill.burn_buff_change
			if(this.seeded.random("判断BUFF命中率") < burnBuffInfo.buffRate){
				buffManager.createBuff(skill.character,targets[i],{buffId : burnBuffInfo.buffId,buffArg : burnBuffInfo.buffArg,duration : burnBuffInfo.duration})
			}
		}
	}
	//判断buff
	if(skill.buffId){
		var buffTargets = this.locator.getBuffTargets(skill.character,skill.buff_tg,targets)
		for(var i = 0;i < buffTargets.length;i++){
			if(buffTargets[i].died){
				break
			}
			if(this.seeded.random("判断BUFF命中率") < skill.buffRate){
				buffManager.createBuff(skill.character,buffTargets[i],{buffId : skill.buffId,buffArg : skill.buffArg,duration : skill.duration})
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
	if(skill.isAnger){
		//释放技能后恢复自身怒气
		if(skill.character.skill_anger_s)
			skill.character.addAnger(skill.character.skill_anger_s,skill.skillId)
		//释放技能后恢复全体队友怒气
		if(skill.character.skill_anger_a)
			for(var i = 0;i < skill.character.team.length;i++)
				if(!skill.character.team[i].died)
					skill.character.team[i].addAnger(skill.character.skill_anger_a,skill.skillId)
		//释放技能后回复当前本方阵容站位最靠前的武将怒气
		if(skill.character.skill_anger_first){
			let tmpTargets = this.locator.getTargets(skill.character,"team_min_index")
			for(var i = 0;i < tmpTargets.length;i++){
				tmpTargets[i].addAnger(skill.character.skill_anger_first,skill.skillId)
			}
		}
		//释放技能后恢复己方后排怒气
		if(skill.character.skill_anger_back){
			let tmpTargets = this.locator.getTargets(skill.character,"team_horizontal_back")
			for(var i = 0;i < tmpTargets.length;i++){
				tmpTargets[i].addAnger(skill.character.skill_anger_back,skill.skillId)
			}
		}
		//释放技能后降低敌人怒气
		if(skill.character.skill_less_anger){
			for(var i = 0;i < targets.length;i++){
				if(targets[i].died){
					break
				}
				targets[i].lessAnger(skill.character.skill_less_anger,skill.skillId)
			}
		}
		//释放技能后追加技能
		if(skill.character.skill_later_skill && this.seeded.random("判断追加技能") < skill.character.skill_later_skill.rate){
			let tmpSkill = this.createSkill(skill.character.skill_later_skill,skill.character)
			this.useSkill(tmpSkill)
		}
		//释放技能后追加BUFF
		if(skill.character.skill_later_buff){
			for(var i = 0;i < targets.length;i++){
				if(!targets[i].died){
					var burnBuffInfo = skill.character.skill_later_buff
					if(this.seeded.random("判断BUFF命中率") < burnBuffInfo.buffRate){
						buffManager.createBuff(skill.character,targets[i],{buffId : burnBuffInfo.buffId,buffArg : burnBuffInfo.buffArg,duration : burnBuffInfo.duration})
					}
				}
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
		return
	}
	var lessAmp = 0
	//判断技能目标减少
	if(skill.lessAmp && targets.length){
		var lessNum = this.locator.getTargetsNum(skill.targetType) - targets.length
		if(lessNum > 0){
			lessAmp = skill.lessAmp * lessNum
		}
	}
	var allDamage = 0
	var kill_num = 0
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		//计算伤害
		let info = this.formula.calDamage(skill.character, target, skill,lessAmp)
		info = target.onHit(skill.character,info,skill)
		allDamage += info.realValue
		recordInfo.targets.push(info)
		if(info.kill){
			kill_num++
		}
	}
	fightRecord.push(recordInfo)
	skill.character.must_crit = false
	if(kill_num){
		if(skill.kill_amp || skill.character.kill_amp)
			skill.character.addAtt("amplify",(skill.kill_amp + skill.character.kill_amp) * kill_num)
		if(skill.character.kill_anger)
			skill.character.addAnger(skill.character.kill_anger * kill_num,skill.skillId)
		if(skill.character.kill_crit)
			skill.character.addAtt("crit",skill.character.kill_crit * kill_num)
		if(skill.character.kill_heal){
			let recordInfo = {type : "other_heal",targets : []}
			recordInfo.targets.push(skill.character.onHeal(skill.character,{value : skill.character.getTotalAtt("maxHP") * skill.character.kill_heal * kill_num},skill))
			fightRecord.push(recordInfo)
		}
		if(skill.character.kill_must_crit){
			skill.character.must_crit = true
		}
	}
	//伤害值转生命判断
	if(allDamage){
		if(skill.turn_rate && skill.turn_tg && !skill.character.died){
			let recordInfo = {type : "other_heal",targets : []}
			let healValue = Math.round(allDamage * skill.turn_rate) || 1
			targets = this.locator.getTargets(skill.character,skill.turn_tg)
			for(var i = 0;i < targets.length;i++){
				let target = targets[i]
				let info = this.formula.calHeal(skill.character,target,healValue)
				info = target.onHeal(skill.character,info,skill)
				recordInfo.targets.push(info)
			}
			fightRecord.push(recordInfo)
		}
		if(skill.isAnger && skill.character.skill_turn_rate && skill.character.skill_turn_tg && !skill.character.died){
			let recordInfo = {type : "other_heal",targets : []}
			let healValue = Math.round(allDamage * skill.character.skill_turn_rate) || 1
			targets = this.locator.getTargets(skill.character,skill.character.skill_turn_tg)
			for(var i = 0;i < targets.length;i++){
				let target = targets[i]
				let info = this.formula.calHeal(skill.character,target,healValue)
				info = target.onHeal(skill.character,info,skill)
				recordInfo.targets.push(info)
			}
			fightRecord.push(recordInfo)
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
		this.useSkill(skill.character.defaultSkill)
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
	for(var i = 0;i < targets.length;i++){
		if(skill.character.died){
			break
		}
		let target = targets[i]
		let value = 0
		if(skill.healType == "atk"){
			value = skill.character.getTotalAtt("atk") * skill.mul
			value = Math.round(value * (1 + skill.character.skill_heal_amp))
		}else if(healType == "hp"){
			value = Math.round(target.getTotalAtt("maxHP") * skill.mul)
		}else{
			console.error("healType error "+healType)
		}
		let info = this.formula.calHeal(skill.character,target,value)
		info = target.onHeal(skill.character,info,skill)
		recordInfo.targets.push(info)
	}
	fightRecord.push(recordInfo)
	return targets
}
module.exports = model