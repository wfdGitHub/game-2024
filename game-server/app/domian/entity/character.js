var EventEmitter = require('events').EventEmitter;     // 引入事件模块
var buffFactory = require("../fight/buffFactory.js")
var character = function(otps) {
	this.characterId = otps.characterId		//角色ID
	this.name =otps.name		//名称
	this.spriteType = otps.spriteType || 0 	//类型
	this.level = otps.level || 1			//等级
	//=========================================//
	this.b_arg = {}
	for(var i in otps){
		this.b_arg[i] = otps[i] || 0
	}
	//================战斗属性==================//
	//一级属性
	this.str = Math.floor(this.b_arg.str + this.level * this.b_arg.strA) || 0		//力量
	this.agi = Math.floor(this.b_arg.agi + this.level * this.b_arg.agiA) || 0 		//敏捷
	this.vit = Math.floor(this.b_arg.vit + this.level * this.b_arg.vitA) || 0 		//耐力
	this.phy = Math.floor(this.b_arg.phy + this.level * this.b_arg.phyA) || 0		//体力
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
	this.dizzyAtk = this.b_arg.dizzyAtk || 0						//眩晕命中
	this.dizzyDef = this.b_arg.dizzyDef || 0						//眩晕抗性
	this.burnAtk = this.b_arg.burnAtk || 0						//燃烧命中
	this.burnDef = this.b_arg.burnDef || 0						//燃烧抗性
	this.poisonAtk = this.b_arg.poisonAtk || 0					//毒素命中
	this.poisonDef = this.b_arg.poisonDef || 0					//毒素抗性
	this.chaosAtk = this.b_arg.chaosAtk || 0						//混乱命中
	this.chaosDef = this.b_arg.chaosDef || 0						//混乱抗性
	//=========================================//
	this.fightSkills = {} 					//技能列表
    this.buffs = {}                        	//buff列表
    this.defaultSkill = false             	//默认攻击
	this.target = false						//当前目标
	this.died = false 						//死亡标记
    this.frozen = false                    	//冰冻标识  冰冻时技能CD停止
    this.dizzy = false                    	//眩晕标识  眩晕时不能行动
    this.chaos = false      				//混乱标识
	this.event = new EventEmitter();
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
  	console.log(attacker.name + " 使用 "+source.name+" 攻击 "+this.name,"-"+damageInfo.damage," 剩余血量 : ",this.hp)
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
	if(!this.dizzy && !this.frozen){
		if(this.defaultSkill && this.defaultSkill.state){
			this.defaultSkill.useSkill()
		}
	}
}
//是否不可使用技能
character.prototype.banUse = function() {
    if(this.dizzy || this.frozen || this.chaos){
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