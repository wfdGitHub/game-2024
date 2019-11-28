var skillManager = require("../skill/skillManager.js")
var model = function(otps) {
	//=========身份===========//
	this.name = otps.name		//角色名称
	this.nation = 0				//国家
	this.isPlayer = true		//玩家或NPC
	this.definition = 0			//角色定位   healer 治疗者
	this.index = 0				//所在位置
	this.camp = ""				//攻方或守方
	this.team = []				//所在阵容
	this.enemy = []				//敌对阵容
	//=========基础属性=======//
	this.level = otps["level"] || 0				//等级
	this.maxHP = otps["maxHP"] || 0				//最大生命值
	this.hp = this.maxHP						//当前生命值
	this.atk = otps["atk"] || 0					//攻击力
	this.phyDef = otps["phyDef"] || 0			//物理防御力
	this.magDef = otps["magDef"] || 0			//法术防御力
	this.crit = otps["crit"] || 0				//暴击几率
	this.critDef = otps["critDef"] || 0			//抗暴几率
	this.slay = otps["slay"] || 0				//爆伤加成
	this.slayDef = otps["slayDef"] || 0			//爆伤减免
	this.hitRate = otps["hitRate"] || 0			//命中率
	this.dodgeRate = otps["dodgeRate"] || 0		//闪避率
	this.amplify = otps["amplify"] || 0			//伤害加深
	this.reduction = otps["reduction"] || 0		//伤害减免
	this.healRate = otps["healRate"] || 0		//治疗几率
	this.healAdd = otps["healAdd"] || 0			//被治疗加成
	this.maxAnger = 4							//最大怒气值
	this.curAnger = otps["curAnger"] || 0		//当前怒气值
	//=========状态=======//
	this.died = false			//死亡状态
	if(!this.maxHP || !this.hp)
		this.died = true
	//=========技能=======//
	if(otps.defaultSkill)
		this.defaultSkill = skillManager.createSkill(otps.defaultSkill,this)				//普通技能
	if(otps.angerSkill)
		this.angerSkill = skillManager.createSkill(otps.angerSkill,this)		//怒气技能
}
//受到伤害
model.prototype.onHit = function(attacker,info,source) {
	if(this.died){
		console.error("不能攻击已死亡的角色",this.name)
		info.realValue = 0
		return info
	}
	info.realValue = this.lessHP(info.value)
	if(this.died){
		info.kill = true
		attacker.kill(this)
	}
	return info
}
//受到治疗
model.prototype.onHeal = function(attacker,info,source) {
	info.realValue = this.addHP(info.value)
	return info
}
//角色死亡
model.prototype.onDie = function() {
	// console.log(this.name+"死亡")
	this.hp = 0
	this.died = true
}
//击杀目标
model.prototype.kill = function(target) {
	// console.log(this.name+"击杀"+target.name)
}

//恢复血量
model.prototype.addHP = function(value) {
	var realValue = value
	if((this.hp + value) > this.maxHP){
		realValue = this.maxHP - this.hp
		this.hp = this.maxHP
	}else{
		this.hp += value
	}
	// console.log(this.name + "addHP" , value,realValue,"curHP : ",this.hp+"/"+this.maxHP)
	return realValue
}
//扣除血量
model.prototype.lessHP = function(value) {
	var realValue = value
	if((this.hp - value) <= 0){
		realValue = this.hp
		this.onDie()
	}else{
		this.hp -= value
	}
	return realValue
}
//恢复怒气
model.prototype.addAnger = function(value) {
	var realValue = value
	if((this.curAnger + value) > this.maxAnger){
		realValue = this.maxAnger - this.curAnger
		this.curAnger = this.maxAnger
	}else{
		this.curAnger += value
	}
	// console.log(this.name + "addAnger" , value,realValue,"curAnger : ",this.curAnger+"/"+this.maxAnger)
	return realValue
}
//减少怒气
model.prototype.lessAnger = function(value) {
	var realValue = value
	if((this.curAnger - value) < 0){
		realValue = this.curAnger
	}else{
		this.curAnger -= value
	}
	return realValue
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	return this[name] || 0
}
module.exports = model