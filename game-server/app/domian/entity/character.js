var EventEmitter = require('events').EventEmitter;     // 引入事件模块
var buffFactory = require("../fight/buffFactory.js")
var advanceCfg = require("../../../config/gameCfg/advance.json")
var innateCfg = require("../../../config/gameCfg/innate.json")
var talentCfg = require("../../../config/gameCfg/talent.json")
var samsaraCfg = require("../../../config/gameCfg/samsara.json")
var passiveCfg = require("../../../config/gameCfg/passive.json")
var attackSkill = require("../fight/attackSkill.js")
var angre_skillCD = 100000					//怒气技能cd
var angre_injured = 100						//受伤恢复怒气值 * 受伤千分比
var angre_attack = 30 						//攻击恢复怒气值 * 敌方受伤千分比
var angre_kill = 20000						//击杀回复怒气值
var character = function(otps) {
	this.characterId = otps.characterId		//角色ID
	this.name =otps.name					//名称
	this.spriteType = otps.spriteType || 0 	//类型
	this.characterType = otps.characterType	//角色类型
	this.level = otps.level || 0			//等级
	this.fightSkills = {} 					//主动技能列表
	this.passives = []						//被动技能列表
	this.angerSkills = {}					//怒气技能列表
	this.globalSkills = []					//全局技能列表
    this.buffs = {}                        	//buff列表
    this.defaultSkill = false             	//默认攻击
	this.target = false						//当前目标
	this.died = false 						//死亡标记
    this.frozen = false                    	//冰冻标识  冰冻时技能CD停止
    this.dizzy = false                    	//眩晕标识  眩晕时不能行动
    this.chaos = false      				//混乱标识
    this.blackArt = false					//妖术标识
    this.silence = false					//沉默标识
    //被动技能属性
    this.doubleHitRate = 0					//连击概率
    this.doubleHitPower = 0					//连击伤害
    this.reviveRate = 0						//复活概率
    this.revivePower = 0					//复活生命比例
    this.passiveBuffs = []					//被动buff列表
	this.event = new EventEmitter();
	//=========================================//
    if(otps.passives){
    	this.passives = JSON.parse(otps.passives) || []
    }
    if(otps.golbal_skill){
    	this.globalSkills = JSON.parse(otps.golbal_skill) || []
    }
	this.addition(otps)
	//=========================================//
	this.b_arg = {
		"str" : 0,
		"agi" : 0,
		"vit" : 0,
		"phy" : 0,
		"strA" : 0,
		"agiA" : 0,
		"vitA" : 0,
		"phyA" : 0,
		"maxHP" : 0,
		"atk" : 0,
		"def" : 0,
		"atkSpeed" : 0,
		"crit" : 0,
		"critDef" : 0,
		"hitRate" : 0,
		"dodgeRate" : 0,
		"slay" : 0,
		"wreck" : 0,
		"block" : 0,
		"blockRate" : 0,
		"amp" : 0,
		"frozenAtk" : 0,
		"frozenDef" : 0,
		"dizzyAtk" : 0,
		"dizzyDef" : 0,
		"burnAtk" : 0,
		"burnDef" : 0,
		"poisonAtk" : 0,
		"poisonDef" : 0,
		"chaosAtk" : 0,
		"chaosDef" : 0,
		"blackArtAtk" : 0,
		"blackArtDef" : 0,
		"silenceAtk" : 0,
		"silenceDef" : 0
	}
	for(var i in otps){
		this.b_arg[i] = otps[i] || 0
	}
	//================战斗属性==================//
	//一级属性
	this.str = this.b_arg.str || 0		//力量
	this.agi = this.b_arg.agi || 0		//敏捷
	this.vit = this.b_arg.vit || 0 		//耐力
	this.phy = this.b_arg.phy || 0		//体力
	//二级属性
	this.atk = Math.floor(this.b_arg.atk + this.str * 2.2) || 0	//攻击力
	this.def = Math.floor(this.b_arg.def + this.vit * 1.8) || 0	//防御力
	this.maxHP = Math.floor(this.b_arg.maxHP + this.phy * 20) || 0	//最大血量
	this.hp = this.maxHP
	//三级属性
	this.atkSpeed = this.b_arg.atkSpeed || 1  					//攻速 每几秒攻击一次
	this.crit = this.b_arg.crit || 0								//暴击
	this.critDef = Math.floor(this.b_arg.critDef + this.vit * 1.5) || 0	//抗暴
	this.slay = this.b_arg.slay || 0								//必杀
	this.hitRate = Math.floor(this.b_arg.hitRate + this.agi * 0.5) || 0//命中
	this.dodgeRate =  Math.floor(this.b_arg.dodgeRate + this.agi * 0.5) || 0//闪避
	this.wreck = this.b_arg.wreck || 0 							//破击
	this.block = this.b_arg.block || 0							//格挡
	this.blockRate = this.b_arg.blockRate || 0					//格挡效果
	this.amp = this.b_arg.amp || 0								//伤害加深
	this.frozenAtk = this.b_arg.frozenAtk || 0					//冰冻命中
	this.frozenDef = this.b_arg.frozenDef || 0					//冰冻抗性
	this.dizzyAtk = this.b_arg.dizzyAtk || 0					//眩晕命中
	this.dizzyDef = this.b_arg.dizzyDef || 0					//眩晕抗性
	this.burnAtk = this.b_arg.burnAtk || 0						//燃烧命中
	this.burnDef = this.b_arg.burnDef || 0						//燃烧抗性
	this.poisonAtk = this.b_arg.poisonAtk || 0					//毒素命中
	this.poisonDef = this.b_arg.poisonDef || 0					//毒素抗性
	this.chaosAtk = this.b_arg.chaosAtk || 0					//混乱命中
	this.chaosDef = this.b_arg.chaosDef || 0					//混乱抗性
	this.blackArtAtk = this.b_arg.blackArtAtk || 0				//妖术命中
	this.blackArtDef = this.b_arg.blackArtDef || 0				//妖术抗性
	this.silenceAtk = this.b_arg.silenceAtk || 0				//沉默命中
	this.silenceDef = this.b_arg.silenceDef || 0				//沉默抗性
	//=========================================//
    if(otps.skills){
        var self = this
        var skills = JSON.parse(otps.skills)
        skills.forEach(function(skillId) {
          var specialSkill =  new attackSkill({skillId : skillId},self)
          self.addFightSkill(specialSkill)
        })
    }
    //增加普攻技能
    if(otps.defaultSkill){
	    var skill =  new attackSkill({skillId : otps.defaultSkill},this)
	    this.setDefaultSkill(skill)
    }
}
//计算加成效果
character.prototype.addition = function(otps) {
	//进阶加成
    if(otps.advance && advanceCfg[otps.advance]){
	    var advanceStr = advanceCfg[otps.advance][this.characterType+"_pa"]
	      	if(advanceStr){
	        this.formula(otps,advanceStr)
	    }
		//天赋加成
		var curLevel = advanceCfg[otps.advance][this.characterType+"_ie"]
		if(curLevel && innateCfg[this.characterId] && innateCfg[this.characterId][curLevel]){
			for(var i = 1;i <= curLevel;i++){
				if(talentCfg[innateCfg[this.characterId][i]]){
					var str = talentCfg[innateCfg[this.characterId][i]].pa
					this.formula(otps,str)
				}
			}
		}
    }
    if(otps.level){
    	//等级加成
	    otps.str = ((otps.str || 0) + Math.floor(otps.level * otps.strA)) || 0		//力量
	    otps.agi = ((otps.agi || 0) + Math.floor(otps.level * otps.agiA)) || 0		//力量
	    otps.vit = ((otps.vit || 0) + Math.floor(otps.level * otps.vitA)) || 0		//力量
	    otps.phy = ((otps.phy || 0) + Math.floor(otps.level * otps.phyA)) || 0		//力量
	    //转生加成
	    var samsara = Math.floor(((otps.level - 1) / 100))
	    if(samsara && samsaraCfg[samsara] && samsaraCfg[samsara][this.characterType+"_pa"]){
	    	var samsaraStr = samsaraCfg[samsara][this.characterType+"_pa"]
	    	this.formula(otps,samsaraStr)
	    }
    }
    //被动技能
    for(var i = 0;i < this.passives.length;i++){
    	var passive = passiveCfg[this.passives[i]]
    	if(passive){
	    	switch(passive.type){
	    		case "doubleHit":
	    			this.doubleHitRate = Number(passive.rate) || 0
	    			this.doubleHitPower =  Number(passive.arg) || 0
	    		break
	    		case "revive":
	    			this.reviveRate =  Number(passive.rate) || 0
	    			this.revivePower =  Number(passive.arg) || 0
	    		break
	    		case "increase":
	    			var increaseStr = passive.arg
	    			this.formula(otps,increaseStr)
	    		break
	    		case "buff":
	    			this.passiveBuffs.push({buffId : passive.buffId,duration : passive.duration,power : passive.power,buffRate : passive.rate})
	    		break
	    	}
    	}
    }
}
//属性加成公式
character.prototype.formula = function(otps,str,rate) {
	if(!rate || typeof(rate) != "number"){
		rate = 1
	}
	var strList = str.split("&")
    strList.forEach(function(m_str) {
      var m_list = m_str.split(":")
      var name = m_list[0]
      var value = Number(m_list[1] * rate)
      if(!otps[name]){
        otps[name] = 0
      }
      otps[name] += value
    })
}
//百分比属性加成公式
character.prototype.percentformula = function(otps,str) {
	var strList = str.split("&")
    strList.forEach(function(m_str) {
      var m_list = m_str.split(":")
      var name = m_list[0]
      var value = Number(m_list[1])
      if(!otps[name]){
        otps[name] = 0
      }
      otps[name] += Math.round(value * otps[name])
    })
}
character.prototype.getSimpleInfo = function() {
	var info = {
		name : this.name,
		maxHP : this.maxHP,
		hp : this.hp
	}
	return info
}
character.prototype.getInfo = function() {
	var info = {
		level : this.level,
		name : this.name,
		str : this.str,
		agi : this.agi,
		vit : this.vit,
		phy : this.phy,
		maxHP : this.maxHP,
		hp : this.hp,
		atk : this.atk,
		def : this.def,
		atkSpeed : this.atkSpeed,
		crit : this.crit,
		critDef : this.critDef,
		slay : this.slay,
		hitRate : this.hitRate,
		dodgeRate : this.dodgeRate,
		wreck : this.wreck,
		block : this.block,
		blockRate : this.blockRate,
		amp : this.amp,
		frozenAtk : this.frozenAtk,
		frozenDef : this.frozenDef,
		dizzyAtk : this.dizzyAtk,
		dizzyDef : this.dizzyDef,
		burnAtk : this.burnAtk,
		burnDef : this.burnDef,
		poisonAtk : this.poisonAtk,
		poisonDef : this.poisonDef,
		chaosAtk : this.chaosAtk,
		chaosDef : this.chaosDef,
		blackArt : this.blackArt,
	}
	return info
}
character.prototype.setArg = function(myTeam,enemyTeam,fighting) {
	this.myTeam = myTeam
	this.enemyTeam = enemyTeam
	this.fighting = fighting
}
//添加技能列表
character.prototype.addFightSkill = function(skill) {
	if(skill){
		this.fightSkills[skill.skillId] = skill
		if(skill.angerSkill){
			skill.skillCD = angre_skillCD
			this.angerSkills[skill.skillId] = skill
		}
	}
}
//减少怒气技能CD
character.prototype.lessenAngerCD = function(dt) {
	for(var id in this.angerSkills){
		this.angerSkills[id].lessenCD(dt)
	}
}
//禁用全部怒气技能
character.prototype.banAngerSkill = function() {
	for(var id in this.angerSkills){
		this.angerSkills[id].state = false
	}
}
//重置全部怒气技能
character.prototype.resetAngerSkill = function() {
	for(var id in this.angerSkills){
		this.angerSkills[id].updateCD()
	}
}
//设置默认攻击技能
character.prototype.setDefaultSkill = function(skill) {
    if(skill){
    	skill.defaultSkill = true
    	this.fightSkills[skill.skillId] = skill
        this.defaultSkill = skill
    }
}
//使用技能
character.prototype.useSkill = function(skillId) {
	if(this.fightSkills[skillId]){
		this.fightSkills[skillId].use()
	}else{
		new Error("技能不存在 : "+skillId)
	}
}
//攻击
character.prototype.harm = function(target,value) {
	var angre_value = Math.round((value * 1000) / target.maxHP) * angre_attack
	this.lessenAngerCD(angre_value)
}
//击杀
character.prototype.kill = function(target) {
	this.lessenAngerCD(angre_kill)
}
//被攻击
character.prototype.hit = function(attacker, damageInfo,source) {
	//判断免疫
	if(source.type == "skill" && this.buffs["immune"]){
		damageInfo.immune = true
		damageInfo.damage = 0
		this.buffs["immune"].consume()
	}else{
		this.reduceHp(attacker,damageInfo.damage)
	}
  	this.event.emit("hit",attacker, damageInfo,source)
}
//生命值增加
character.prototype.recoverHp = function(value) {
	if(this.died){
		return
	}
	this.hp += value
	var realRecover = value
	if(this.hp > this.maxHP){
		realRecover -= this.hp - this.maxHP
		this.hp = this.maxHP
	}
	if(realRecover> 0){
		this.event.emit("recover",value,realRecover,this.hp)
	}
}
//生命值减少
character.prototype.reduceHp = function(attacker,value) {
	attacker.harm(this,value)
	this.hp -= value;
	var angre_value = Math.round((value * 1000) / this.maxHP) * angre_injured
	this.lessenAngerCD(angre_value)
	if (this.hp <= 0) {
		this.hp = 0
		this.died = true
		this.afterDied(attacker);
		//判断复活
		if(this.reviveRate > this.fighting.seeded.random()){
			this.revive()
		}
	}
}
//复活
character.prototype.revive = function() {
	if(this.revivePower){
		this.hp = Math.round(this.maxHP * this.revivePower)
		this.died = false
		this.event.emit("revive",this.hp)
	}
}
character.prototype.afterDied = function(attacker) {
	this.resetAngerSkill()
	attacker.kill(this)
	this.event.emit("died",attacker)
}
//获取总属性值
character.prototype.getTotalAtt = function(name) {
	if(this[name]){
		var value = this[name]
		if(this.buffs["gainAtt"]){
			value += this.buffs["gainAtt"].getGainAtt(name)
		}
		if(this.buffs["lessAtt"]){
			value -= this.buffs["lessAtt"].getlessAtt(name)
		}
		return value
	}
	else
		return 0
}
//获取基础属性值
character.prototype.getBasicAtt = function(name) {
	if(this[name])
		return this[name]
	else
		return 0
}
character.prototype.update = function(stepper) {
	for(var i in this.buffs){
		this.buffs[i].update(stepper)
	}
	if(!this.frozen){
		for(var skillId in this.fightSkills){
			this.fightSkills[skillId].updateTime(stepper)
		}
	}
	//判断普攻
	if(!this.dizzy && !this.frozen && !this.blackArt){
		if(this.defaultSkill && this.defaultSkill.state){
			this.defaultSkill.useSkill()
		}
	}
}
//是否不可使用技能
character.prototype.banUse = function() {
    if(this.dizzy || this.frozen || this.chaos || this.blackArt || this.silence){
        return true
    }else{
        return false
    }
}
character.prototype.addBuff = function(attacker,otps) {
	//判断是否命中
	if(!buffFactory.checkBuffRate(attacker,this,otps)){
		return
	}
    var buffId = otps.buffId
    if(this.buffs[buffId]){
        this.buffs[buffId].overlay(attacker,otps)
    }else{
        var buff = buffFactory.getBuff(attacker,this,otps)
        if(buff){
            buff.initialize()
            this.buffs[buffId] = buff
        }else{
            console.error("buff 不存在")
        }
    }
}
character.prototype.removeBuff = function(buffId) {
    if(this.buffs[buffId]){
        delete this.buffs[buffId]
    }
}
module.exports = character