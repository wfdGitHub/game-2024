//英雄
var entity_base = require("./entity_base.js")
var skill_base = require("../skill/skill_base.js")
var model = function(fighting,otps,talentList) {
	//继承父类属性
	entity_base.call(this,fighting,otps,talentList)
	//初始化技能
	this.defaultSkill = new skill_base(this,{"atk_aim" : 1,"atk_mul":1})
	this.angerSkill = new skill_base(this,{"atk_aim" : 1,"atk_mul":3})
	//初始化天赋
}
//继承父类方法
model.prototype = Object.create(entity_base.prototype) //继承父类方法
//获得怒气
model.prototype.addAnger = function(value,show) {
	this.curAnger += Number(value) || 0
	this.curAnger = Math.min(this.curAnger,this.maxAnger)
	if(show)
		this.fighting.fightRecord.push({type : "addAnger",realValue : value,curAnger : this.curAnger})
	return value
}
//减少怒气
model.prototype.lessAnger = function(value,show) {
	this.curAnger -= Number(value) || 0
	this.curAnger = Math.max(this.curAnger,0)
	if(show)
		this.fighting.fightRecord.push({type : "lessAnger",realValue : value,curAnger : this.curAnger})
	return value
}
//选择技能
model.prototype.chooseSkill = function() {
	if(this.checkControl())
		return false
	if(this.curAnger >= this.needAnger)
		return this.userAngerSkill()
	else
		return this.userNormalSkill()
}
//使用怒气技能消耗怒气
model.prototype.userAngerSkill = function() {
	if(this.checkControl())
		return false
	var needAnger = this.needAnger
	var needValue = 0
	var info = {}
	info.skill = false
	//怒气足够
	if(this.curAnger >= this.needAnger){
		info.skill = this.angerSkill
		needValue = this.needAnger
	}
	if(info.skill){
		if(needValue)
			info.changeAnger = -this.lessAnger(needValue)
		info.curAnger = this.curAnger
	}
	return info
}
//使用普攻技能获得怒气
model.prototype.userNormalSkill = function() {
	var info = {}
	info.skill = this.defaultSkill
	info.changeAnger = this.addAnger(20)
	info.curAnger = this.curAnger
	return info
}
//检查可行动
model.prototype.checkAction = function() {
	if(this.died || this.isAction)
		return false
	else
		return true
}
//检查被控制
model.prototype.checkControl = function() {
	if(this.died)
		return true
	else
		return false
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
//受到攻击
model.prototype.onHit = function(attacker,info) {
	//受到攻击预处理
	info.id = this.id
	return this.lessHP(info)
}
//受到攻击结束后
model.prototype.onHitAfter = function(attacker,info) {}
//受到治疗
model.prototype.onHeal = function(attacker,info) {
	//受到治疗预处理
	info.id = this.id
	return this.addHP(info)
}
//受到治疗结束后
model.prototype.onHealAfter = function(attacker,info) {}
//角色死亡
model.prototype.onDie = function(info) {
	if(this.died)
		return
	this.attInfo.hp = 0
	this.died = true
	info.died = true
	this.fighting.fightInfo[this.belong]["survival"]--
}
//角色死亡结束后
model.prototype.onDieAfter = function(attacker,info) {}
//恢复血量
model.prototype.addHP = function(info) {
	if(this.died){
		info.realValue = 0
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
model.prototype.lessHP = function(info) {
	if(this.died){
		info.realValue = 0
		return info
	}
	if(this.attInfo.hp < info.value){
		info.realValue = info.value
		this.attInfo.hp = 0
		this.onDie(info)
	}else{
		this.attInfo.hp -= info.value
		info.realValue = info.value
	}
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	return info
}
//复活
model.prototype.resurgence = function(attacker,info) {
	if(!this.died)
		return
	this.fighting.fightInfo[this.belong]["survival"]++
}
//======触发
//触发击杀
model.prototype.onKill = function(target,info) {}
//触发闪避
model.prototype.onDodge = function(attacker,info) {}
//触发格挡
model.prototype.onBlock = function(attacker,info) {}
//触发暴击
model.prototype.onCrit = function(attacker,info) {}
module.exports = model