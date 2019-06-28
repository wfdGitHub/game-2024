var EventEmitter = require('events').EventEmitter;     // 引入事件模块
var buffFactory = require("../fight/buffFactory.js")
var advanceCfg = require("../../../config/gameCfg/advance.json")
var innateCfg = require("../../../config/gameCfg/innate.json")
var talentCfg = require("../../../config/gameCfg/talent.json")
var samsaraCfg = require("../../../config/gameCfg/samsara.json")
var character = function(otps) {
	this.characterId = otps.id		//角色ID
	this.name =otps.name			//名称
	this.spriteType = otps.spriteType || 0 	//类型
	this.characterType = otps.characterType	//角色类型
	this.level = otps.level || 0			//等级
	this.addition(otps)
	//=========================================//
	this.b_arg = {}
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
	this.fightSkills = {} 					//技能列表
    this.buffs = {}                        	//buff列表
    this.defaultSkill = false             	//默认攻击
	this.target = false						//当前目标
	this.died = false 						//死亡标记
    this.frozen = false                    	//冰冻标识  冰冻时技能CD停止
    this.dizzy = false                    	//眩晕标识  眩晕时不能行动
    this.chaos = false      				//混乱标识
    this.blackArt = false					//妖术标识
    this.silence = false					//沉默标识
	this.event = new EventEmitter();
}
//计算加成效果
character.prototype.addition = function(otps) {
	//进阶加成
    if(otps.advance && advanceCfg[otps.advance]){
	    var advanceStr = advanceCfg[otps.advance][this.characterType+"_pa"]
	      	if(advanceStr){
	        console.log("进阶加成",advanceStr)
	        this.formula(otps,advanceStr)
	    }
		//天赋加成
		var curLevel = advanceCfg[otps.advance][this.characterType+"_ie"]
		if(curLevel && innateCfg[this.characterId] && innateCfg[this.characterId][curLevel]){
			for(var i = 1;i <= curLevel;i++){
				if(talentCfg[innateCfg[this.characterId][i]]){
					var str = talentCfg[innateCfg[this.characterId][i]].pa
					console.log("天赋加成",str)
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
	    	console.log("转生加成",samsaraStr)
	    	this.formula(otps,samsaraStr)
	    }
    }
}
//属性加成公式
character.prototype.formula = function(otps,str) {
	var strList = str.split("&")
    strList.forEach(function(m_str) {
      var m_list = m_str.split(":")
      var name = m_list[0]
      var value = Number(m_list[1])
      if(!otps[name]){
        otps[name] = 0
      }
      otps[name] += value
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
character.prototype.setArg = function(enemyTeam,fighting) {
	this.enemyTeam = enemyTeam
	this.fighting = fighting
}
//添加技能列表
character.prototype.addFightSkill = function(skill) {
	if(skill){
		this.fightSkills[skill.skillId] = skill
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
//被攻击
character.prototype.hit = function(attacker, damageInfo,source) {
  	this.reduceHp(damageInfo.damage)
  	console.log(this.fighting.curTime + " " + attacker.name + " 使用 "+source.name+" 攻击 "+this.name,"-"+damageInfo.damage," 剩余血量 : ",this.hp)
  	this.event.emit("hit",attacker, damageInfo,source)
}
//生命值减少
character.prototype.reduceHp = function(damageValue) {
  this.hp -= damageValue;
  if (this.hp <= 0) {
    this.died = true;
    this.afterDied(this.name + " is died");
  }
}
character.prototype.afterDied = function() {
	this.event.emit("died")
}
//获取总攻击值
character.prototype.getTotalAttack = function() {
	return this.atk
}
//获取总防御值
character.prototype.getTotalDefence = function() {
	return this.def
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
character.prototype.addBuff = function(attacker,skill,otps) {
	//判断是否命中
	if(!buffFactory.checkBuffRate(attacker,this,skill)){
		return
	}
    var buffId = otps.buffId
    if(this.buffs[buffId]){
        this.buffs[buffId].overlay(attacker,otps)
        console.log("刷新buff",this.buffs[buffId].name)
    }else{
        var buff = buffFactory.getBuff(attacker,this,otps)
        if(buff){
            buff.initialize()
            this.buffs[buffId] = buff
            console.log("新buff",buff.name)
        }else{
            console.log("buff 不存在")
        }
    }
}
character.prototype.removeBuff = function(buffId) {
    console.log("removeBuff ",buffId)
    if(this.buffs[buffId]){
        delete this.buffs[buffId]
    }
    console.log("removeBuff ",this.buffs)
}
module.exports = character