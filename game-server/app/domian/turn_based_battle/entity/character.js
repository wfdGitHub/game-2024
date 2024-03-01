//英雄
const entity_base = require("./entity_base.js")
const fightCfg = require("../fightCfg.js")
const heros = fightCfg.getCfg("heros")
var model = function(fighting,otps,talents) {
	//继承父类属性
	otps = Object.assign(otps,heros[otps.id])
	entity_base.call(this,fighting,otps)
	if(this.isNaN)
		return
	//初始化天赋
	this.talents = talents
}
model.prototype = Object.create(entity_base.prototype) //继承父类方法
//战斗初始化
model.prototype.init = function() {
	//初始乱速
	this.changeTotalAtt("speed",this.fighting.random())
	//战斗属性
	this.hp_loss = 0 			//战斗中失去生命值比例
	//属性加成
	for(var i in this.attInfo){
		if(this.talents[i])
			this.attInfo[i] += Number(this.talents[i]) || 0
	}
	if(this.talents.self_maxHP)
		this.attInfo.maxHP += Math.floor(this.attInfo.maxHP * this.talents.self_maxHP)
	if(this.talents.self_atk)
		this.attInfo.atk += Math.floor(this.attInfo.atk * this.talents.self_atk)
	if(this.talents.self_armor)
		this.attInfo.armor += Math.floor(this.attInfo.armor * this.talents.self_armor)
	//========技能初始化
	this.attInfo.hp = this.attInfo.maxHP
}
model.prototype.begin = function() {}
//获得怒气
model.prototype.addAnger = function(value,show,later) {
	if(this.died)
		return 0
	value = Math.min(value,this.maxAnger - this.curAnger)
	this.curAnger += Math.floor(value) || 0
	if(show && value){
		if(later)
			this.fighting.nextRecord.push({type : "changeAnger",id : this.id,changeAnger : value,curAnger : this.curAnger})
		else
			this.fighting.fightRecord.push({type : "changeAnger",id : this.id,changeAnger : value,curAnger : this.curAnger})
	}
	return value
}
//减少怒气
model.prototype.lessAnger = function(value,show) {
	if(this.died)
		return 0
	value = Math.min(this.curAnger,value)
	this.curAnger -= Math.floor(value) || 0
	if(show && value)
		this.fighting.fightRecord.push({type : "changeAnger",id : this.id,changeAnger : -value,curAnger : this.curAnger})
	return value
}
//检查可被选中
model.prototype.checkAim = function() {
	if(this.isNaN || this.died)
		return false
	else
		return true
}
//获取战斗数据
model.prototype.getCombatData = function() {
	var info = {
		"id" : this.id,
		"curAnger" : this.curAnger,
		"maxAnger" : this.maxAnger,
		"needAnger" : this.needAnger
	}
	return info
}
//受到其他伤害
model.prototype.onOtherDamage = function(attacker,value) {
	var info = {"type":"other_damage","value":value}
	this.onHit(attacker,info,false)
	if(info.realValue)
		this.fighting.fightRecord.push(info)
	return info
}
//受到其他治疗
model.prototype.onOtherHeal = function(attacker,value) {
	var info = {"type":"other_heal","value":value}
	this.onHeal(attacker,info)
	if(info.realValue)
		this.fighting.fightRecord.push(info)
	return info
}
//免疫伤害
model.prototype.immuneDamage = function(info) {
	info.value = 0
	info.immune = true
}
//受到攻击
model.prototype.onHit = function(attacker,info,hitFlag) {
	this.lessHP(info,hitFlag)
	return info
}
//受到治疗
model.prototype.onHeal = function(attacker,info) {
	//受到治疗预处理
	this.addHP(info)
	attacker.totalHeal += info.realValue
	return info
}
//角色死亡
model.prototype.onDie = function(info) {
	if(this.died)
		return
	if(this.onWillDie(info))
		return
	info.value += this.attInfo.hp
	info.realValue += this.attInfo.hp
	this.attInfo.hp = 0
	this.hp_loss = 0
	this.curAnger = 0
	this.died = true
	info.curAnger = this.curAnger
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	info.died = true
	//清空BUFF
	for(var i in this.buffs)
		if(!this.buffs[i].buffCfg.save)
			this.buffs[i].destroy()
	this.fighting.fightInfo[this.belong]["survival"]--
	this.fighting.heroRemove(this)
}
//任意角色阵亡
model.prototype.anyDie = function(target) {
}
//濒死触发
model.prototype.onWillDie = function(info) {
}
//触发保命
model.prototype.saveLife = function(info) {
	this.attInfo.hp = 1
	info.realValue = this.attInfo.hp
	this.fighting.nextRecord.push({type:"tag",id:this.id,tag:"one_hp"})
}
//角色死亡结束后
model.prototype.onDieAfter = function(attacker,info,skill) {
}
//恢复血量
model.prototype.addHP = function(info) {
	info.id = this.id
	info.value = Math.floor(info.value) || 0
	info.realValue = 0
	if(this.died){
		return info
	}
	if(this.attInfo.hp + info.value > this.attInfo.maxHP){
		info.realValue = this.attInfo.maxHP - this.attInfo.hp
		this.attInfo.hp = this.attInfo.maxHP
	}else{
		info.realValue = info.value
		this.attInfo.hp += info.value
	}
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	return info
}
//扣除血量
model.prototype.lessHP = function(info,hitFlag) {
	info.id = this.id
	info.value = Math.floor(info.value) || 0
	info.realValue = 0
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	info.curAnger = this.curAnger
	if(this.died)
		return info
	if(this.attInfo.hp < info.value){
		this.onDie(info)
		info.curAnger = this.curAnger
		info.hp = this.attInfo.hp
		info.maxHP = this.attInfo.maxHP
		return info
	}
	this.attInfo.hp -= info.value
	info.realValue = info.value
	//秒杀判断
	if(this.buffs["chaodu"])
		if(this.getHPRate() < this.buffs["chaodu"].getBuffMul())
			return this.onSeckill(info)
	//受击回怒
	if(hitFlag){
		var tmpHPRate = info.realValue / this.attInfo.maxHP
		this.hp_loss += tmpHPRate
		this.addAnger(Math.floor(tmpHPRate * 80),false)
	}
	info.curAnger = this.curAnger
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	return info
}
//被秒杀
model.prototype.onSeckill = function(info) {
	info.id = this.id
	this.onDie(info)
	info.seckill = true
	return info
}
//触发累计血量损失
model.prototype.triggerLossHP = function() {
}
//复活
model.prototype.revive = function(value) {
	if(!this.died)
		return
	if(this.buffs["not_revived"])
		return
	this.attInfo.hp = value
	this.died = false
	this.fighting.fightRecord.push({type : "revive",id : this.id,hp : this.attInfo.hp,maxHP:this.attInfo.maxHP})
	if(this.buffs["turtle"])
		this.buffs["turtle"].close()
	this.fighting.heroAdd(this)
}
//添加BUFF
model.prototype.createBuff = function(buff) {
	if(!this.buffs[buff.buffId]){
		this.buffs[buff.buffId] = buff
		if(buff.attBuff)
			this.attBuffs[buff.buffId] = 1
	}
}
//添加1层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(this.buffs[buff.buffId])
		this.buffs[buff.buffId].addBuff(attacker,buff)
}
//移除BUFF
model.prototype.removeBuff = function(buffId) {
    if(this.buffs[buffId])
        delete this.buffs[buffId]
    if(this.attBuffs[buffId])
    	delete this.attBuffs[buffId]
}
//移除一层负面状态
model.prototype.dispelLessBuff = function() {
	this.fighting.nextRecord.push({type:"tag",id:this.id,tag:"dispelLess"})
	for(var i in this.buffs){
		if(this.buffs[i].buffCfg.dispel_less){
			this.buffs[i].delBuff()
			return
		}
	}
}
//移除所有负面状态
model.prototype.dispelAllLess = function() {
	this.fighting.nextRecord.push({type:"tag",id:this.id,tag:"dispelLess"})
	for(var i in this.buffs){
		if(this.buffs[i].buffCfg.dispel_less)
			this.buffs[i].delBuff()
	}
}
//驱散一层增益状态
model.prototype.dispelAddBuff = function() {
	this.fighting.nextRecord.push({type:"tag",id:this.id,tag:"dispelAdd"})
	for(var i in this.buffs){
		if(this.buffs[i].buffCfg.dispel_add){
			this.buffs[i].delBuff()
			return
		}
	}
}
//===============攻击触发
//触发击杀
model.prototype.onKill = function(target,skill,info) {
}
//触发闪避
model.prototype.onMiss = function(attacker,info) {
}
//触发格挡
model.prototype.onBlock = function(attacker,info) {
}
//触发暴击
model.prototype.onCrit = function(attacker,info) {
}
//===============获取信息
//简单信息
model.prototype.getSimpleInfo = function() {
	var info = {
		id : this.id,
		heroId : this.heroId,
		belong : this.belong,
		index : this.index,
		lv : this.lv,
		maxHP : this.attInfo.maxHP,
		hp : this.attInfo.hp
	}
	return info
}
//详细信息
model.prototype.getFullInfo = function() {
	var info = this.getSimpleInfo()
	info.attInfo = JSON.parse(JSON.stringify(this.attInfo))
	info.attInfo.speed = Math.floor(info.attInfo.speed)
	return info
}
//结算信息
model.prototype.getOverData = function() {
	var info = {
		id : this.id,
		maxHP : this.attInfo.maxHP,
		hp : this.attInfo.hp,
		totalDamage : this.totalDamage,
		totalHeal : this.totalHeal
	}
	return info
}
module.exports = model