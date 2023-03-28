//英雄
const entity_base = require("./entity_base.js")
const skill_base = require("../skill/skill_base.js")
const fightCfg = require("../fightCfg.js")
var model = function(fighting,otps,talentList) {
	//继承父类属性
	entity_base.call(this,fighting,otps,talentList)
	if(this.isNaN)
		return
	//初始化技能
	this.defaultSkill = this.packageDefaultSkill()
	this.angerSkill = this.packageAngerSkill()
	//初始化天赋
}
//继承父类方法
model.prototype = Object.create(entity_base.prototype) //继承父类方法
//战斗初始化
model.prototype.init = function() {
	//主属性增益
	this.changeTotalAtt("hit",this.getTotalAtt("main_hit") * 0.005)
	this.changeTotalAtt("hitDef",this.getTotalAtt("main_hit") * 0.005)
	this.changeTotalAtt("magAmp",this.getTotalAtt("main_mag") * 0.01)
	this.changeTotalAtt("magDef",this.getTotalAtt("main_mag") * 0.01)
	this.changeTotalAtt("phyAmp",this.getTotalAtt("main_phy") * 0.01)
	this.changeTotalAtt("phyDef",this.getTotalAtt("main_phy") * 0.01)
	this.changeTotalAtt("block",this.getTotalAtt("main_slay") * 0.005)
	this.changeTotalAtt("blockDef",this.getTotalAtt("main_slay") * 0.005)
	this.changeTotalAtt("slay",(this.getTotalAtt("main_slay") - 60) * 0.006)
	this.changeTotalAtt("ampDefMain",(this.getTotalAtt("main_dr") - 60) * 0.006)
	this.changeTotalAtt("speed",this.fighting.random())
}
//===================生命周期
//个人回合开始
model.prototype.before = function() {
	this.isAction = true
	this.onAction = true
}
//个人回合结束
model.prototype.after = function() {
	this.onAction = false
}
//整体回合开始
model.prototype.roundBegin = function() {
	this.isAction = false
}
//整体回合结束
model.prototype.roundEnd = function() {
	for(var i in this.buffs)
		this.buffs[i].update()
}
//获得怒气
model.prototype.addAnger = function(value,show) {
	this.curAnger += Number(value) || 0
	this.curAnger = Math.min(this.curAnger,this.maxAnger)
	if(show)
		this.fighting.fightRecord.push({type : "changeAnger",id : this.id,changeAnger : value,curAnger : this.curAnger})
	return this.curAnger
}
//减少怒气
model.prototype.lessAnger = function(value,show) {
	this.curAnger -= Number(value) || 0
	this.curAnger = Math.max(this.curAnger,0)
	if(show)
		this.fighting.fightRecord.push({type : "changeAnger",id : this.id,changeAnger : -value,curAnger : this.curAnger})
	return this.curAnger
}
//选择技能
model.prototype.chooseSkill = function() {
	if(this.checkControl())
		return false
	if(!this.fighting.locator.existsTarget(this))
		return false
	if(this.curAnger >= this.needAnger)
		return this.useAngerSkill()
	else
		return this.useNormalSkill()
}
//使用怒气技能消耗怒气
model.prototype.useAngerSkill = function() {
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
	info.mul = 1
	return info
}
//消耗全部怒气再次使用普攻，基础伤害50%
model.prototype.useAllAangerSkill = function() {
	if(this.checkControl())
		return false
	var needAnger = this.needAnger
	var needValue = 0
	var info = {}
	info.skill = this.angerSkill
	info.mul = 0.5
	info.changeAnger = -this.lessAnger(this.curAnger)
	info.curAnger = this.curAnger
	info.no_combo = true  			//不可连击
	if(info.skill.talents.kill_repet)
		info.mul += Math.floor(info.changeAnger * info.skill.talents.kill_repet)
	return info
}
//使用普攻技能获得怒气
model.prototype.useNormalSkill = function() {
	var info = {}
	info.skill = this.defaultSkill
	info.changeAnger = this.addAnger(20)
	info.curAnger = this.curAnger
	info.mul = 1
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
//受到攻击开始前
model.prototype.onHitBefore = function(attacker) {
	//受到攻击预处理
}
//受到其他伤害
model.prototype.onOtherDamage = function(attacker,value) {
	var info = {"type":"other_damage","value":value}
	this.onHit(attacker,info)
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
//受到攻击
model.prototype.onHit = function(attacker,info) {
	//受到攻击
	this.lessHP(info)
	attacker.totalDamage += info.realValue
	return info
}
//受到治疗
model.prototype.onHeal = function(attacker,info) {
	//受到治疗预处理
	this.addHP(info)
	attacker.totalHeal += info.realValue
	return info
}
//受到治疗结束后
model.prototype.onHealAfter = function(attacker,info) {}
//角色死亡
model.prototype.onDie = function(info) {
	if(this.died)
		return
	this.attInfo.hp = 0
	this.curAnger = 0
	this.died = true
	info.died = true
	//清空BUFF
	this.buffs = {}
	this.fighting.fightInfo[this.belong]["survival"]--
}
//角色死亡结束后
model.prototype.onDieAfter = function(attacker,info) {}
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
model.prototype.lessHP = function(info) {
	info.id = this.id
	info.value = Math.floor(info.value) || 0
	info.realValue = 0
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	if(this.died){
		return info
	}
	if(this.attInfo.hp < info.value){
		info.realValue = this.attInfo.hp
		this.attInfo.hp = 0
		this.onDie(info)
	}else{
		this.attInfo.hp -= info.value
		info.realValue = info.value
		//受击回怒
		info.curAnger = this.addAnger(Math.floor((info.realValue / this.attInfo.maxHP) * 80),false)
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
//添加BUFF
model.prototype.createBuff = function(buff) {
	if(!this.buffs[buff.buffId]){
		this.buffs[buff.buffId] = buff
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
}
//===============攻击触发
//触发击杀
model.prototype.onKill = function(target,info) {}
//触发闪避
model.prototype.onDodge = function(attacker,info) {}
//触发格挡
model.prototype.onBlock = function(attacker,info) {}
//触发暴击
model.prototype.onCrit = function(attacker,info) {}
//受到攻击结束后
model.prototype.onHitAfter = function(attacker,info) {}
//===============获取信息
//简单信息
model.prototype.getSimpleInfo = function() {
	var info = {
		id : this.id,
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
//组装普攻技能
model.prototype.packageDefaultSkill = function() {
	var sid = fightCfg.getCfg("heros")[this.heroId]["defult"]
	return this.packageSkill(sid,1,0,false)
}
//组装怒气技能
model.prototype.packageAngerSkill = function() {
	var sid = fightCfg.getCfg("heros")[this.heroId]["skill"]
	var star = Number(this.otps.s1_star) || 1
	var lv = Number(this.otps.s1_lv) || 0
	if(star > 5)
		star = 5
	return this.packageSkill(sid,star,lv,true,this.otps.skillTalents)
}
//组装技能
model.prototype.packageSkill = function(baseSid,star,lv,isAnger,talents) {
	var sid = baseSid + star
	var skillCfg = fightCfg.getCfg("skills")[sid]
	if(!skillCfg){
		console.log("技能ID错误 "+baseSid+" "+sid+" star "+star)
		return
	}
	var otps = {sid : baseSid,isAnger : isAnger}
	Object.assign(otps,skillCfg)
	if(otps.atk_basic)
		otps.atk_value = otps.atk_basic * lv
	if(otps.heal_basic)
		otps.heal_value = otps.heal_basic * lv
	talents = talents || {}
	for(var i = 1;i <= star;i++){
		baseSid++
		skillCfg = fightCfg.getCfg("skills")[baseSid]
		if(skillCfg["talentId"]){
			var talentInfo = fightCfg.getCfg("skill_talents")[skillCfg["talentId"]]
			for(var j = 1;j <= 4;j++){
				var key = talentInfo["key"+j]
				if(key){
					if(talents[key] && Number.isFinite(talents[key]))
						talents[key] += talentInfo["value"+j]
					else
						talents[key] = talentInfo["value"+j]
				}
			}
		}
	}
	return new skill_base(this,otps,talents)
}
module.exports = model