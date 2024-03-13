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
	buffManager.init(this.seeded,fighting)
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
model.useSkill = function(skill,chase) {
	var targets = []
	var diedSkill = false
	if(skill.character.died)
		diedSkill = true
	switch(skill.type){
		case "attack":
			targets = this.useAttackSkill(skill,chase)
		break
		case "heal":
			targets = this.useHealSkill(skill,chase)
		break
		default:
			targets = []
	}
	var targetsNum = this.locator.getTargetsNum(skill.targetType)
	if(skill.isAnger){
		//技能判断燃烧状态附加BUFF
		if(skill.burn_buff_change_skill){
			for(var i = 0;i < targets.length;i++){
				if(targets[i].died || !targets[i].buffs["burn"]){
					continue
				}
				var buffInfo = Object.assign({},skill.burn_buff_change_skill,skill.character.burn_buff_change_skill)
				if((diedSkill && skill.character.died_burn_buff_must) || this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
					buffManager.createBuff(skill.character,targets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
				}
			}
		}
		//释放技能后恢复攻击最高队友怒气
		if(skill.character.skill_add_maxAtk_anger){
			var tmpTargets = this.locator.getTargets(skill.character,"team_maxAtk_1")
			if(tmpTargets[0] && !tmpTargets[0]["died"]){
				tmpTargets[0].addAnger(skill.character.skill_add_maxAtk_anger)
			}
		}
		//释放技能后恢复同阵营怒气最少的三个英雄怒气值
		if(skill.character.skill_add_realm3_anger){
			var tmpTargets = this.locator.getTargets(skill.character,"realm_minAnger_3")
			for(var i = 0;i < tmpTargets.length;i++){
				if(!tmpTargets[i]["died"]){
					tmpTargets[i].addAnger(skill.character.skill_add_realm3_anger)
				}
			}
		}
		//释放技能后恢复同阵营攻击最高的英雄怒气值
		if(skill.character.skill_add_maxAtk_realm_anger){
			var tmpTargets = this.locator.getTargets(skill.character,"realm_maxAtk_1")
			for(var i = 0;i < tmpTargets.length;i++){
				if(!tmpTargets[i]["died"]){
					tmpTargets[i].addAnger(skill.character.skill_add_maxAtk_realm_anger)
				}
			}
		}
		//释放技能后增加横排英雄怒气
		if(skill.character.skill_hor_anger){
			var tmpTargets = this.locator.getFriendVertical(skill.character)
			for(var i = 0;i < tmpTargets.length;i++){
				if(!tmpTargets[i]["died"]){
					tmpTargets[i].addAnger(skill.character.skill_hor_anger)
				}
			}
			if(!skill.character["died"])
				skill.character.addAnger(skill.character.skill_hor_anger)
		}
		//释放技能后增加纵排英雄怒气
		if(skill.character.skill_ver_anger){
			var tmpTargets = this.locator.getFriendHorizontal(skill.character)
			for(var i = 0;i < tmpTargets.length;i++){
				if(!tmpTargets[i]["died"]){
					tmpTargets[i].addAnger(skill.character.skill_ver_anger)
				}
			}
			if(!skill.character["died"])
				skill.character.addAnger(skill.character.skill_ver_anger)
		}
		//释放技能后，会清除己方生命最低的1名英雄的非控制类异常状态
		if(skill.character.skill_clear_debuff){
			var tmpTarget = this.locator.getTargets(skill.character,"team_minHp_1")
			if(tmpTarget[0]){
				tmpTarget[0].removeDeBuffNotControl()
			}
		}
	}else{
		if(skill.burn_buff_change_normal || skill.character.burn_buff_change_normal){
			for(var i = 0;i < targets.length;i++){
				if(targets[i].died ||!targets[i].buffs["burn"]){
					break
				}
				var buffInfo = Object.assign({},skill.burn_buff_change_normal,skill.character.burn_buff_change_normal)
				if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
					buffManager.createBuff(skill.character,targets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
				}
			}
		}
	}
	//判断自身生命值恢复
	if(skill.self_heal && !skill.character.died){
		var recordInfo =  skill.character.onHeal(skill.character,{type : "heal",maxRate : skill.self_heal},skill)
		recordInfo.type = "self_heal"
		fightRecord.push(recordInfo)
	}
	//攻击纵排目标时降低怒气
	if(skill.character.enemy_vertical_anger && skill.targetType == "enemy_vertical"){
		for(var i = 0;i < targets.length;i++){
			if(targets[i].died){
				break
			}
			targets[i].lessAnger(skill.character.enemy_vertical_anger)
		}
	}
	if(skill.isAnger && !skill.character.died){
		if(!chase){
			//释放技能后恢复自身怒气
			if(skill.skill_anger_s){
				skill.character.addAnger(skill.skill_anger_s,skill.skillId)
			}
			//释放技能后恢复全体队友怒气
			if(skill.skill_anger_a)
				for(var i = 0;i < skill.character.team.length;i++)
					if(!skill.character.team[i].died)
						skill.character.team[i].addAnger(skill.skill_anger_a)
			//释放技能后回复当前本方阵容站位最靠前的武将怒气
			if(skill.character.skill_anger_first){
				var tmpTargets = this.locator.getTargets(skill.character,"team_min_index")
				for(var i = 0;i < tmpTargets.length;i++){
					tmpTargets[i].addAnger(skill.character.skill_anger_first)
				}
			}
			//释放技能后降低敌方怒气
			if(skill.skill_less_anger){
				for(var i = 0;i < targets.length;i++){
					if(targets[i].died){
						break
					}
					targets[i].lessAnger(skill.skill_less_anger,skill.skillId)
				}
			}
			//释放技能后恢复己方后排怒气
			if(skill.character.skill_anger_back){
				var tmpTargets = this.locator.getTargets(skill.character,"team_horizontal_back")
				for(var i = 0;i < tmpTargets.length;i++){
					tmpTargets[i].addAnger(skill.character.skill_anger_back)
				}
			}
			//释放技能后追加技能
			if(skill.character.skill_later_skill && this.seeded.random("判断追加技能") < skill.character.skill_later_skill.rate){
				var tmpSkillInfo = Object.assign({skillId : skill.skillId,name : skill.name},skill.character.skill_later_skill)
				var tmpSkill = this.createSkill(tmpSkillInfo,skill.character)
				tmpSkill.isAnger = true
				this.useSkill(tmpSkill,true)
			}
			//释放技能后追加BUFF
			if(skill.character.skill_later_buff){
				var buffTargets = this.locator.getBuffTargets(skill.character,skill.character.skill_later_buff.buff_tg,targets)
				for(var i = 0;i < buffTargets.length;i++){
					if(!buffTargets[i].died){
						var buffInfo = skill.character.skill_later_buff
						if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
							buffManager.createBuff(skill.character,buffTargets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
						}
					}
				}
			}
		}
	}else if(!skill.character.died){
		//普攻后恢复自身怒气
		if(skill.character.normal_add_anger)
			skill.character.addAnger(skill.character.normal_add_anger,skill.skillId)
		//普攻后降低目标怒气
		if(skill.character.normal_less_anger){
			for(var i = 0;i < targets.length;i++){
				targets[i].lessAnger(skill.character.normal_less_anger,skill.skillId)
			}
		}
		//普攻后追加BUFF
		if(skill.character.normal_later_buff){
			var buffInfo = skill.character.normal_later_buff
			var buffRate = buffInfo.buffRate
			//判断技能目标减少
			if(skill.character.less_normal_buffRate){
				var allLenth = targetsNum
				buffRate += ((allLenth - targets.length + 1) / allLenth) * skill.character.less_normal_buffRate
			}
			var buffTargets = this.locator.getBuffTargets(skill.character,buffInfo.buff_tg,targets)
			for(var i = 0;i < buffTargets.length;i++){
				if(!buffTargets[i].died){
					if(this.seeded.random("判断BUFF命中率") < buffRate){
						buffManager.createBuff(skill.character,buffTargets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
			}
		}
	}
	if(targets.length == 1){
		//判断单体目标
		if(skill.character.single_less_anger)
			targets[0].lessAnger(skill.character.single_less_anger,skill.skillId)
	}
	var diedFlag = false
	//判断死亡
	for(var i = 0;i < targets.length;i++){
		if(targets[i].died){
			diedFlag = true
			//直接伤害死亡时对击杀者释放buff
			if(targets[i].died_later_buff){
				if(!skill.character.died){
					var buffInfo = targets[i].died_later_buff
					if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
						buffManager.createBuff(targets[i],skill.character,{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
			}
			//同阵营队友阵亡后释放技能
			for(var j = 0;j < targets[i].team.length;j++)
				if(targets[i].team[j].realmDiedSkill && targets[i].team[j].checkActionable() && !targets[i].team[j].died && targets[i].team[j].id != targets[i].id && targets[i].realm == targets[i].team[j].realm){
					var tmpSkill = targets[i].team[j].angerSkill
					this.useSkill(tmpSkill,true)
				}
		}
	}
	//吸取攻击力
	if(skill.suckAtk){
		for(var i = 0;i < targets.length;i++){
			if(!targets[i].died){
				var tmpAtk = Math.floor(targets[i].attInfo.atk * skill.suckAtk)
				buffManager.createBuff(skill.character,skill.character,{buffId:"atkAdd",buffArg:tmpAtk,duration:3})
				buffManager.createBuff(skill.character,targets[i],{buffId:"atkLess",buffArg:tmpAtk,duration:2})
			}
		}
	}
	//额外回合
	if(skill.isAnger && skill.character.extraAtion){
		var tmpTargets = this.locator.getTargets(skill.character,"realm_minAnger_1")
		if(tmpTargets[0]){
			this.fighting.next_character.push(tmpTargets[0])
		}
	}
	//追加普攻增加伤害吸收盾
	if(chase && skill.character.chase_shield && !skill.character.died)
		buffManager.createBuff(skill.character,skill.character,{buffId:"shield",buffArg:skill.character.chase_shield,duration:1})
	//击杀重复释放技能
	if(!chase && diedFlag && skill.killRet && !skill.character.died){
		this.useSkill(skill,false)
	}

}
//伤害技能
model.useAttackSkill = function(skill,chase) {
	if(skill.character.died && !skill.character.died_use_skill){
		return []
	}
	var addAmp = 0
	var allDamage = 0
	var kill_num = 0
	var kill_burn_num = 0
	var burn_num = 0
	var dead_anger = 0
	var burnDamage = 0
	var died_targets = []
	var damage_save_value = 0
	var recordInfo = skill.getInfo()
	var overflow = 0
	recordInfo.targets = []
	var targetsNum = this.locator.getTargetsNum(skill.targetType)
	if(targetsNum > 1){
		recordInfo.group = true
	}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	if(!targets.length){
		fightRecord.push(recordInfo)
		return []
	}
	if(skill.lose_hp && !skill.character.isBoss){
		var tmpRecord = {type : "other_damage",value : Math.ceil(skill.lose_hp * skill.character.attInfo.hp),d_type:skill.damageType}
		tmpRecord = skill.character.onHit(skill.character,tmpRecord)
		fightRecord.push(tmpRecord)
	}
	if(!chase){
		//判断怒气增加伤害
		if(skill.angerAmp){
			addAmp += skill.angerAmp
			delete skill.angerAmp
		}
		//判断技能目标减少
		var lessNum = targetsNum - targets.length
		if(lessNum && skill.isAnger){
			if(skill.character.skill_less_amp)
				addAmp += skill.character.skill_less_amp * lessNum
			if(skill.lessAmp)
				addAmp += skill.lessAmp * lessNum
		}
		if(skill.character.less_clear_invincible){
			var allLenth = targetsNum
			var buffRate = ((allLenth - targets.length + 1) / allLenth) * skill.character.less_clear_invincible
			for(var i = 0;i < targets.length;i++){
				if(!targets[i].died && (targets[i].buffs["invincible"] || targets[i].buffs["invincibleSuck"])){
					if(this.seeded.random("清除无敌盾") < buffRate){
						if(targets[i].buffs["invincible"])
							targets[i].buffs["invincible"].destroy("dispel")
						if(targets[i].buffs["invincibleSuck"])
							targets[i].buffs["invincibleSuck"].destroy("dispel")
					}
				}
			}
		}
		//判断敌方阵亡伤害加成
		if(skill.character.enemy_died_amp){
			var dieNum = 0
			for(var i = 0;i < skill.character.enemy.length;i++){
				if(!skill.character.enemy[i].isNaN && skill.character.enemy[i].died){
					dieNum++
				}
			}
			if(dieNum)
				addAmp += dieNum * skill.character.enemy_died_amp
		}
		if(skill.isAnger && skill.character.damage_save_value){
			damage_save_value = Math.floor(skill.character.damage_save_value / targets.length)
			skill.character.damage_save_value = 0
		}
	}else{
		if(skill.isAnger && skill.character.add_skill_amp){
			addAmp += skill.character.add_skill_amp
		}else if(!skill.isAnger && skill.character.add_default_amp){
			addAmp += skill.character.add_default_amp
		}
	}
	var must_crit = false
	if(chase && !skill.isAnger && skill.character.add_d_s_crit)
		must_crit = true
	var lessAngerList = []
	var callbacks = []
	for(var i = 0;i < targets.length;i++){
		var target = targets[i]
		var tmpAddAmp = addAmp
		if(skill.character.skill_amp_or_lessAnger){
			if(target.curAnger < 4)
				tmpAddAmp += skill.character.skill_amp_or_lessAnger
			else if(target.curAnger > 4)
				lessAngerList.push(target)
		}
		//计算伤害
		var info = this.formula.calDamage(skill.character, target, skill,tmpAddAmp,must_crit,chase)
		info.value += damage_save_value
		info.d_type = skill.damageType
		if(skill.seckill)
			info.seckillRate = skill.seckill
		info = target.onHit(skill.character,info,callbacks)
		if(info.overflow)
			overflow += info.overflow
		if(info.realValue > 0)
			allDamage += info.realValue
		if(target.buffs["burn"]){
			burn_num++
			burnDamage += info.realValue
		}
		recordInfo.targets.push(info)
		if(info.kill){
			died_targets.push(target)
			kill_num++
			dead_anger += target.curAnger
			if(target.buffs["burn"])
				kill_burn_num++
		}
	}
	fightRecord.push(recordInfo)
	//判断buff
	if(skill.buffId){
		var buffTargets = this.locator.getBuffTargets(skill.character,skill.buff_tg,targets)
		var buffRate = skill.buffRate
		var buffArg = skill.buffArg
		//判断技能目标减少
		if(skill.character.less_skill_buffRate){
			var allLenth = targetsNum
			buffRate += buffRate * (1 + (allLenth - targets.length + 1) / allLenth) * skill.character.less_skill_buffRate
		}
		if(skill.character.less_buff_arg){
			var allLenth = targetsNum
			buffArg += buffArg * (1 + ((allLenth - targets.length + 1) / allLenth)) * skill.character.less_buff_arg
		}
		for(var i = 0;i < buffTargets.length;i++){
			if(buffTargets[i].died){
				break
			}
			if(this.seeded.random("判断BUFF命中率") < buffRate){
				buffManager.createBuff(skill.character,buffTargets[i],{buffId : skill.buffId,buffArg : buffArg,duration : skill.duration})
			}
		}
		if(skill.character.realm_extra_buff_minHp){
			var target = this.locator.getTargets(skill.character,"enemy_minHP")[0]
			if(target && !target.buffs[skill.buffId]){
				buffRate = (buffRate * skill.character.realm_extra_buff_minHp * (skill.character.teamInfo["realms"][skill.character.realm] - 1))
				if(buffRate && this.seeded.random("判断BUFF命中率") < buffRate){
					buffManager.createBuff(skill.character,target,{buffId : skill.buffId,buffArg : buffArg,duration : skill.duration})
				}
			}
		}
		if(skill.character.realm_extra_buff_maxAtk){
			var target = this.locator.getTargets(skill.character,"enemy_maxAtk_1")[0]
			if(target && !target.buffs[skill.buffId]){
				buffRate = (buffRate * skill.character.realm_extra_buff_maxAtk * (skill.character.teamInfo["realms"][skill.character.realm] - 1))
				if(buffRate && this.seeded.random("判断BUFF命中率") < buffRate){
					buffManager.createBuff(skill.character,target,{buffId : skill.buffId,buffArg : buffArg,duration : skill.duration})
				}
			}
		}
	}
	for(var i = 0;i < callbacks.length;i++)
		callbacks[i]()
	//受到单体技能回血
	if(skill.isAnger && targetsNum == 1 && targets[0].single_skill_heal && !targets[0].died && recordInfo.targets.length == 1 && recordInfo.targets[0].realValue > 0){
		fightRecord.push({type:"show_tag",id:targets[0].id,tag:"single_skill_heal"})
		var tmpInfo =  targets[0].onHeal(targets[0],{type : "heal",value : targets[0].attInfo.maxHP * targets[0].single_skill_heal})
		tmpInfo.type = "self_heal"
		fightRecord.push(tmpInfo)
	}
	//伤害超出生命值上限时释放buff判断
	if(skill.character.over_buff_maxHp && skill.character.over_buff_arg){
		for(var i = 0;i < targets.length;i++){
			if(!targets[i].died && (recordInfo.targets[i].realValue / targets[i].attInfo.maxHP) >= skill.character.over_buff_maxHp){
				var buffInfo = skill.character.over_buff_arg
				if(this.seeded.random("超出上限buff") < buffInfo.buffRate)
					buffManager.createBuff(skill.character,targets[i],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
			}
		}
	}
	//嘲讽判断
	if(skill.character.cf_rate){
		var allLenth = targetsNum
		var tmpRate = ((allLenth - targets.length + 1) / allLenth) * skill.character.cf_rate
		for(var i = 0;i < targets.length;i++){
			if(!targets[i].died){
				if(this.seeded.random("嘲讽") < tmpRate)
					buffManager.createBuff(skill.character,targets[i],{buffId : "chaofeng",duration : 1})
			}
		}
	}
	for(var i = 0;i < lessAngerList.length;i++){
		lessAngerList[i].lessAnger(1,skill.skillId)
	}
	if(skill.isAnger && skill.character.overDamageToMaxHp && overflow && !skill.character.died){
		var target = this.locator.getTargesMaxHP(targets)
		if(target){
			var tmpRecord = {type : "other_damage",value : Math.ceil(skill.character.overDamageToMaxHp * overflow),d_type:skill.damageType}
			tmpRecord = target.onHit(skill.character,tmpRecord)
			fightRecord.push(tmpRecord)
		}
	}
	if(skill.isAnger && skill.character.dispel_intensify){
		var allLenth = targetsNum
		var tmpRate = ((allLenth - targets.length + 1) / allLenth) * skill.character.dispel_intensify
		for(var i = 0;i < targets.length;i++){
			if(!targets[i].died){
				if(this.seeded.random("清除BUFF概率") < tmpRate)
					targets[i].removeIntensifyBuff()
			}
		}
	}
	if(kill_num){
		if(skill.kill_amp || skill.character.kill_amp)
			skill.character.addAtt("amplify",(skill.kill_amp + skill.character.kill_amp) * kill_num)
		if(skill.character.kill_anger)
			skill.character.addAnger(skill.character.kill_anger * kill_num,skill.skillId)
		if(skill.character.kill_crit)
			skill.character.addAtt("crit",skill.character.kill_crit * kill_num)
		if(skill.character.kill_slay)
			skill.character.addAtt("slay",skill.character.kill_slay * kill_num)
		if(skill.character.kill_heal){
			var tmpRecord = {type : "other_heal",targets : []}
			tmpRecord.targets.push(skill.character.onHeal(skill.character,{maxRate : skill.character.kill_heal * kill_num}))
			fightRecord.push(tmpRecord)
		}
		if(skill.character.kill_must_crit)
			skill.character.next_must_crit = true
		if(skill.character.kill_rob_anger && skill.isAnger)
			skill.character.addAnger(dead_anger,skill.skillId)
		//直接伤害击杀灼烧目标后，回复自身生命值百分比
		if(skill.character.kill_burn_heal && kill_burn_num){
			var tmpRecord =  skill.character.onHeal(skill.character,{maxRate : skill.character.kill_burn_heal * kill_burn_num})
			tmpRecord.type = "self_heal"
			fightRecord.push(tmpRecord)
		}
		//击杀后给自身添加伤害吸收盾
		if(skill.character.kill_shield){
			buffManager.createBuff(skill.character,skill.character,{buffId : "shield",buffArg : skill.character.kill_shield * kill_num,duration : 1})
		}
		//直接伤害击杀目标后，概率清除己方武将身上该目标死亡前释放的所有异常效果（灼烧、中毒、眩晕、沉默、麻痹
		if(skill.character.kill_clear_buff){
			for(var i = 0;i < died_targets.length;i++){
				if(skill.character.kill_clear_buff && this.seeded.random("击杀清除BUFF") < skill.character.kill_clear_buff){
				    skill.character.team.forEach(function(team_target,index) {
				        if(!team_target.died){
				        	team_target.clearReleaserBuff(died_targets[i])
				        }
				    })
				}
			}
		}
		//击杀后追加技能
		if(skill.character.kill_later_skill && this.seeded.random("判断追加技能") < skill.character.kill_later_skill.rate){
			fightRecord.push({type:"show_tag",id:skill.character.id,tag:"kill_later_skill"})
			var tmpSkillInfo = Object.assign({skillId : skill.skillId,name : skill.name},skill.character.kill_later_skill)
			var tmpSkill = this.createSkill(tmpSkillInfo,skill.character)
			this.useSkill(tmpSkill,true)
		}
	}
	//伤害值转生命判断
	if(allDamage > 0){
		if(skill.turn_rate && skill.turn_tg && !skill.character.died){
			var tmpRecord = {type : "other_heal",targets : []}
			var healValue = Math.round(allDamage * (skill.turn_rate + skill.character.skill_turn_rate)) || 1
			var tmptargets = this.locator.getTargets(skill.character,skill.turn_tg)
			for(var i = 0;i < tmptargets.length;i++){
				var target = tmptargets[i]
				var info = this.formula.calHeal(skill.character,target,healValue,skill)
				info = target.onHeal(skill.character,info,skill)
				tmpRecord.targets.push(info)
			}
			fightRecord.push(tmpRecord)
		}else if(skill.isAnger && skill.character.skill_turn_rate && skill.character.skill_turn_tg && !skill.character.died){
			var tmpRecord = {type : "other_heal",targets : []}
			var healValue = Math.round(allDamage * skill.character.skill_turn_rate) || 1
			var tmptargets = this.locator.getTargets(skill.character,skill.character.skill_turn_tg)
			for(var i = 0;i < tmptargets.length;i++){
				var target = tmptargets[i]
				var info = this.formula.calHeal(skill.character,target,healValue,skill)
				info = target.onHeal(skill.character,info,skill)
				tmpRecord.targets.push(info)
			}
			fightRecord.push(tmpRecord)
		}
		if(burnDamage){
			if(!skill.isAnger && skill.character.normal_burn_turn_heal){
				var tmpRecord = {type : "other_heal",targets : []}
				var info = this.formula.calHeal(skill.character,skill.character,skill.character.normal_burn_turn_heal * burnDamage,skill)
				info = skill.character.onHeal(skill.character,info,skill)
				tmpRecord.targets.push(info)
				fightRecord.push(tmpRecord)
			}
			if(skill.isAnger && skill.character.skill_burn_turn_heal){
				var tmpRecord = {type : "other_heal",targets : []}
				var info = this.formula.calHeal(skill.character,skill.character,Math.round(skill.character.skill_burn_turn_heal * burnDamage),skill)
				info = skill.character.onHeal(skill.character,info,skill)
				tmpRecord.targets.push(info)
				fightRecord.push(tmpRecord)
			}
		}
		if(skill.character.phy_turn_hp && skill.damageType == "phy"){
			var tmpInfo = skill.character.onHeal(skill.character,{type : "heal",value : skill.character.phy_turn_hp * allDamage})
			tmpInfo.type = "self_heal"
			fightRecord.push(tmpInfo)
		}
		//伤害转护盾
		if(skill.character.damage_change_shield){
			buffManager.createBuff(skill.character,skill.character,{buffId : "shield",buffArg : Math.floor(allDamage * skill.character.damage_change_shield),duration : 1,number:true})
		}
		//法术伤害转护盾
		if(skill.character.mag_change_shield && skill.damageType == "mag"){
			buffManager.createBuff(skill.character,skill.character,{buffId : "shield",buffArg : Math.floor(allDamage * skill.character.mag_change_shield),duration : 1,number:true})
		}
	}
	//受伤判断
	for(var i = 0;i < recordInfo.targets.length;i++){
		if(!targets[i].died){
			//受到直接伤害转化成生命
			if(targets[i].hit_turn_rate && targets[i].hit_turn_tg && recordInfo.targets[i].realValue > 0){
				var tmpRecord = {type : "other_heal",targets : []}
				var healValue = Math.round(recordInfo.targets[i].realValue * targets[i].hit_turn_rate) || 1
				var tmptargets = this.locator.getTargets(targets[i],targets[i].hit_turn_tg)
				for(var j = 0;j < tmptargets.length;j++){
					var tmptarget = tmptargets[j]
					var info = this.formula.calHeal(skill.character,tmptarget,healValue,skill)
					info = tmptarget.onHeal(targets[j],info)
					tmpRecord.targets.push(info)
				}
				fightRecord.push(tmpRecord)
			}
			if(!skill.isAnger){
				//普通攻击
				//回复自己怒气
				if(targets[i].hit_anger_s){
					targets[i].addAnger(targets[i].hit_anger_s,skill.skillId)
				}
				//受到普攻附加BUFF
				if(targets[i].hit_normal_buff){
					var buffInfo = targets[i].hit_normal_buff
					if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
						buffManager.createBuff(targets[i],skill.character,{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
				if(targets[i]["normal_atk_turn_hp"]){
					var tmpInfo =  targets[i].onHeal(targets[i],{type : "heal",value : recordInfo.targets[i]["realValue"] * targets[i]["normal_atk_turn_hp"]})
					tmpInfo.type = "self_heal"
					fightRecord.push(tmpInfo)
				}
			}else{
				//技能攻击
				if(targets[i].hit_skill_buff){
					var buffInfo = targets[i].hit_skill_buff
					if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
						var tmptargets = this.locator.getTargets(skill.character,buffInfo.buff_tg)
						for(var j = 0;j < tmptargets.length;j++)
							buffManager.createBuff(targets[i],tmptargets[j],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
				if(targets[i]["skill_atk_turn_hp"]){
					var tmpInfo =  targets[i].onHeal(targets[i],{type : "heal",value : recordInfo.targets[i]["realValue"] * targets[i]["skill_atk_turn_hp"]})
					tmpInfo.type = "self_heal"
					fightRecord.push(tmpInfo)
				}
			}
			//受到伤害附加BUFF
			if(targets[i].hit_buff){
				var buffInfo = targets[i].hit_buff
				if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
					buffManager.createBuff(targets[i],skill.character,{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
				}
			}
			//被灼烧敌人攻击时回复怒气
			if(targets[i].burn_hit_anger && skill.character.buffs["burn"]){
				targets[i].addAnger(targets[i].burn_hit_anger,skill.skillId)
			}
			//攻击受到眩晕效果的目标时，额外降低目标怒气。
			if(skill.character.dizzy_hit_anger && targets[i].buffs["dizzy"]){
				targets[i].lessAnger(skill.character.dizzy_hit_anger,skill.skillId)
			}
			//受到直接攻击时，生命值低于40%回复生命比例
			if(targets[i]["first_aid"] && (targets[i].attInfo.hp / targets[i].attInfo.maxHP) < 0.4){
				var tmpInfo =  targets[i].onHeal(targets[i],{type : "heal",value : targets[i].attInfo.maxHP * targets[i]["first_aid"]})
				tmpInfo.type = "self_heal"
				fightRecord.push(tmpInfo)
				targets[i]["first_aid"] = 0
			}
			//受到女性英雄攻击恢复怒气
			if(targets[i].women_damage_anger && skill.character.sex == 2){
				targets[i].addAnger(targets[i].women_damage_anger)
			}
			//对敌方造成法术伤害时，如果目标处于异常状态，则使其怒气降低1点
			if(skill.character.mag_debuff_anger && skill.damageType == "mag" && targets[i].getDebuffNum()){
				targets[i].lessAnger(1)
			}
		}
		if(!skill.isAnger && targets[i].hit_less_anger){
			//降低攻击者怒气
			skill.character.lessAnger(targets[i].hit_less_anger,skill.skillId)
		}
		if(recordInfo.targets[i].realValue > 0){
			var hit_rebound_value = 0
			//收到直接伤害反弹
			if(targets[i].hit_rebound){
				hit_rebound_value += Math.floor(targets[i].hit_rebound * recordInfo.targets[i].realValue)
			}
			//受到技能伤害反弹
			if(targets[i].skill_rebound_prob && targets[i].skill_rebound_ratio && skill.isAnger){
				if(this.seeded.random("技能反弹概率") < targets[i].skill_rebound_prob){
					hit_rebound_value += Math.floor(targets[i].skill_rebound_ratio * recordInfo.targets[i].realValue)
				}
			}
			if(hit_rebound_value){
				var tmpRecord = {type : "other_damage",value : hit_rebound_value,d_type:skill.damageType}
				tmpRecord = skill.character.onHit(targets[i],tmpRecord)
				fightRecord.push(tmpRecord)
			}
		}
	}
	if(!chase){
		//判断攻击目标大于三人则增加两点怒气
		if(skill.thr_anger){
			if(targets.length >= 3){
				skill.character.addAnger(2,skill.skillId)
			}
		}
	}
	//释放技能时，每命中一个燃烧状态下的目标恢复自身1点怒气
	if(skill.isAnger && skill.character.skill_burn_anger && burn_num){
		skill.character.addAnger(skill.character.skill_burn_anger * burn_num)
	}
	//追加普通攻击判断
	if(skill.isAnger && (skill.add_d_s || skill.character.skill_add_d_s)){
		this.useSkill(skill.character.defaultSkill,true)
	}
	if(kill_num && skill.character.kill_add_d_s){
		this.useSkill(skill.character.defaultSkill,true)
	}
	return targets
}
//恢复技能
model.useHealSkill = function(skill,chase) {
	if(skill.character.died && !skill.character.died_use_skill){
		return []
	}
	var recordInfo = skill.getInfo()
	recordInfo.targets = []
	var targetsNum = this.locator.getTargetsNum(skill.targetType)
	if(targetsNum > 1){
		recordInfo.group = true
	}
	var targets = this.locator.getTargets(skill.character,skill.targetType)
	var rate = 1
	if(skill.character.skill_heal_amp && skill.isAnger)
		rate += skill.character.skill_heal_amp
	else if(skill.character.normal_heal_amp && !skill.isAnger){
		rate += skill.character.normal_heal_amp
	}
	var min_hp_friend = null
	var min_hp3_list = null
	if(skill.isAnger){
		if(skill.character.heal_min_hp_rate || skill.character.realm_heal_buff_minHp)
			min_hp_friend = this.locator.getTargets(skill.character,"team_minHp_1")[0]
		if(skill.character.heal_min_hp3_rate){
			min_hp3_list = {}
			var tmpList = this.locator.getTargets(skill.character,"team_minHp_3")
			for(var i = 0;i < tmpList.length;i++){
				min_hp3_list[tmpList[i].id] = true
			}
		}
	}
	//判断怒气增加伤害
	if(skill.angerAmp){
		rate += skill.angerAmp
		delete skill.angerAmp
	}
	var callbacks = []
	for(var i = 0;i < targets.length;i++){
		var target = targets[i]
		var value = 0
		var mul = skill.mul
		if(min_hp3_list && min_hp3_list[target.id])
			mul += skill.character.heal_min_hp3_rate
		if(skill.healType == "atk"){
			value = Math.round(skill.character.getTotalAtt("atk") * mul * rate)
		}else if(healType == "hp"){
			value = Math.round(target.getTotalAtt("maxHP") * mul * rate)
		}else{
			console.error("healType error "+healType)
		}
		if(min_hp_friend && min_hp_friend == target){
			if(skill.character.heal_min_hp_rate)
				value = Math.round(value * (skill.character.heal_min_hp_rate + 1))
		}
		if(skill.character.unpoison_heal && skill.character.realm == target.realm){
			target.removeDeBuffNotControl()
			value = Math.round(value * (skill.character.unpoison_heal + 1))
		}
		var info = this.formula.calHeal(skill.character,target,value,skill)
		if(skill.isAnger && skill.character.heal_maxHp)
			info.maxRate = skill.character.heal_maxHp
		if(target.forbidden && skill.character.forbidden_shield){
			callbacks.push(function(){buffManager.createBuff(skill.character,target,{buffId : "shield",buffArg : Math.floor(info.value * skill.character.forbidden_shield),duration : 1,number : true})})
		}else{
			info = target.onHeal(skill.character,info,skill)
			recordInfo.targets.push(info)
			if(skill.character.over_heal_shield && info.value > info.realValue){
				callbacks.push(function(){buffManager.createBuff(skill.character,target,{buffId : "shield",buffArg : Math.floor((info.value - info.realValue) * skill.character.over_heal_shield),duration : 1,number : true})})
			}
		}
	}
	fightRecord.push(recordInfo)
	//判断buff
	if(skill.buffId){
		var buffTargets = this.locator.getBuffTargets(skill.character,skill.buff_tg,targets)
		var buffRate = skill.buffRate
		var buffArg = skill.buffArg
		//判断技能目标减少
		if(skill.character.less_skill_buffRate){
			var allLenth = targetsNum
			buffRate += buffRate * (1 + (allLenth - targets.length + 1) / allLenth) * skill.character.less_skill_buffRate
		}
		if(skill.character.less_buff_arg){
			var allLenth = targetsNum
			buffArg += buffArg * (1 + ((allLenth - targets.length + 1) / allLenth)) * skill.character.less_buff_arg
		}
		// if(skill.buffId == "dizzy" && skill.character.dizzy_clear_anger)
		// 	buffRate *= 0.5
		for(var i = 0;i < buffTargets.length;i++){
			if(buffTargets[i].died){
				break
			}
			if(this.seeded.random("判断BUFF命中率") < buffRate){
				buffManager.createBuff(skill.character,buffTargets[i],{buffId : skill.buffId,buffArg : buffArg,duration : skill.duration})
			}
		}
		if(skill.character.realm_extra_buff_minHp){
			var target = this.locator.getTargets(skill.character,"enemy_minHP")[0]
			if(target && !target.buffs[skill.buffId]){
				buffRate = (buffRate * skill.character.realm_extra_buff_minHp * (skill.character.teamInfo["realms"][skill.character.realm] - 1))
				if(buffRate && this.seeded.random("判断BUFF命中率") < buffRate){
					buffManager.createBuff(skill.character,target,{buffId : skill.buffId,buffArg : buffArg,duration : skill.duration})
				}
			}
		}
		if(skill.character.realm_extra_buff_maxAtk){
			var target = this.locator.getTargets(skill.character,"enemy_maxAtk_1")[0]
			if(target && !target.buffs[skill.buffId]){
				buffRate = (buffRate * skill.character.realm_extra_buff_maxAtk * (skill.character.teamInfo["realms"][skill.character.realm] - 1))
				if(buffRate && this.seeded.random("判断BUFF命中率") < buffRate){
					buffManager.createBuff(skill.character,target,{buffId : skill.buffId,buffArg : buffArg,duration : skill.duration})
				}
			}
		}
	}
	if(skill.isAnger){
		if(skill.character.realm_heal_buff_minHp && min_hp_friend && min_hp_friend.realm == skill.character.realm){
			for(var i = 0;i < targets.length;i++){
				if(min_hp_friend == targets[i] ){
					buffManager.createBuff(skill.character,targets[i],skill.character.realm_heal_buff_minHp)
					break
				}
			}
		}
		if(skill.character.heal_unControl){
			for(var i = 0;i < targets.length;i++){
				if(!targets[i].died)
					targets[i].removeControlBuff()
			}
		}
		if(skill.cleanDebuff){
			for(var i = 0;i < targets.length;i++){
				if(!targets[i].died)
					targets[i].removeDeBuff()
			}
		}
		if(skill.character.heal_addAnger){
			for(var i = 0;i < targets.length;i++){
				if(!targets[i].died)
					targets[i].addAnger(skill.character.heal_addAnger)
			}
		}
		if(skill.character.heal_same_shild){
			for(var i = 0;i < targets.length;i++){
				if(!targets[i].died && targets[i].realm == skill.character.realm)
					buffManager.createBuff(skill.character,targets[i],{buffId : "shield",buffArg : skill.character.heal_same_shild,duration : 1})
			}
		}
	}
    //增加怒气
    if(skill.anger_target){
        for(var i = 0;i < targets.length;i++){
            if(!targets[i].died)
                targets[i].addAnger(skill.anger_target)
        }
    }
	for(var i = 0;i < callbacks.length;i++)
		callbacks[i]()
	return targets
}
module.exports = model