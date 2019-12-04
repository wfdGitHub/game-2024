var skillManager = require("../skill/skillManager.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	//=========身份===========//
	this.name = otps.name		//角色名称
	this.id = otps.id 			//角色ID
	this.realm = 0				//国家
	this.career = 0				//角色职业   healer 治疗者
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
	this.healRate = otps["healRate"] || 0		//治疗暴击几率
	this.healAdd = otps["healAdd"] || 0			//被治疗加成
	this.needAnger = 4							//技能所需怒气值
	this.curAnger = otps["curAnger"] || 0		//当前怒气值
	//=========状态=======//
	this.died = false			//死亡状态
	if(!this.maxHP || !this.hp)
		this.died = true
	this.buffs = []					//buff列表
	this.dizzy = false				//眩晕
	this.silence = false			//沉默
	this.disarm = false				//麻痹
	this.forbidden = false			//禁疗
	this.poison = false				//中毒
	this.burn = false				//燃烧
	//=========技能=======//
	if(otps.defaultSkill)
		this.defaultSkill = skillManager.createSkill(otps.defaultSkill,this)				//普通技能
	if(otps.angerSkill)
		this.angerSkill = skillManager.createSkill(otps.angerSkill,this)		//怒气技能
}
//行动开始前刷新
model.prototype.before = function() {
	//伤害BUFF刷新
	for(var i in this.buffs)
		if(this.buffs[i].type == "dot")
			this.buffs[i].update()
}
//行动结束后刷新
model.prototype.after = function() {
	//状态BUFF刷新
	for(var i in this.buffs)
		if(this.buffs[i].type != "dot")
			this.buffs[i].update()
}
//受到伤害
model.prototype.onHit = function(attacker,info,source) {
	info.id = this.id
	info.value = Math.floor(info.value) || 1
	if(this.died){
		console.error("不能攻击已死亡的角色",this.name)
		info.realValue = 0
		return info
	}
	if(info.miss){
		info.realValue = 0
	}else{
		info.realValue = this.lessHP(info.value)
		info.curValue = this.hp
		info.maxHP = this.maxHP
		if(this.died){
			info.kill = true
			attacker.kill(this)
		}
	}
	return info
}
//受到治疗
model.prototype.onHeal = function(attacker,info,source) {
	info.id = this.id
	info.value = Math.floor(info.value) || 1
	if(this.forbidden){
		info.value = 0
		info.realValue = 0
	}else{
		info.value = Math.floor(info.value * (1 + this.healAdd / 10000))
		info.realValue = this.addHP(info.value)
	}
	info.curValue = this.hp
	info.maxHP = this.maxHP
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
	this.curAnger += value
	fightRecord.push({type : "addAnger",realValue : value,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id})
	return value
}
//减少怒气
model.prototype.lessAnger = function(value) {
	var realValue = value
	if((this.curAnger - value) < 0){
		realValue = this.curAnger
	}else{
		this.curAnger -= value
	}
	if(realValue)
		fightRecord.push({type : "lessAnger",realValue : realValue,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id})
	return realValue
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	return this[name] || 0
}
//获取信息
model.prototype.getInfo = function() {
	var info = {}
	info.id = this.id
	info.name = this.name
	info.nation = this.nation
	info.definition = this.definition
	info.index = this.index
	info.level = this.level
	info.maxHP = this.maxHP
	info.hp = this.hp
	info.atk = this.atk
	info.phyDef = this.phyDef
	info.magDef = this.magDef
	info.crit = this.crit
	info.critDef = this.critDef
	info.slay = this.slay
	info.slayDef = this.slayDef
	info.hitRate = this.hitRate
	info.dodgeRate = this.dodgeRate
	info.amplify = this.amplify
	info.reduction = this.reduction
	info.healRate = this.healRate
	info.healAdd = this.healAdd
	info.needAnger = this.needAnger
	info.curAnger = this.curAnger
	return info
}
model.prototype.getSimpleInfo = function() {
	var info = {}
	info.id = this.id
	info.name = this.name
	info.hp = this.hp
	return info
}
model.prototype.addBuff = function(releaser,buff) {
	this.buffs[buff.buffId] = buff
}
model.prototype.removeBuff = function(buffId) {
    if(this.buffs[buffId]){
        delete this.buffs[buffId]
    }
}
module.exports = model