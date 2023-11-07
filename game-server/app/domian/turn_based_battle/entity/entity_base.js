const fightCfg = require("../fightCfg.js")
//战斗角色基类
var model = function(fighting,otps) {
	this.died = false  					//死亡状态
	var herosCfg = fightCfg.getCfg("heros")[otps.id]
	if(!otps || !otps.id || !herosCfg){
		this.isNaN = true
		this.died = true
		return
	}
	this.otps = otps || {}
	this.fighting = fighting
	this.index = -1
	this.heroId = Math.floor(this.otps.id) || 0
	this.id = 0
	this.lv = 1
	this.star = 1
	this.ad = 1
	this.realm = herosCfg.realm 		//阵营
	this.career = 1 					//职业
	this.sex = herosCfg.sex || 1 		//性别 1男 2女
	this.talents = {}
	this.buffs = {} 					//全部BUFF
	this.attBuffs = {} 					//属性增益BUFF
	this.totalDamage = 0				//累计伤害
	this.totalHeal = 0					//累计治疗
	if(!this.isNaN)
		this.attInit()
}
//属性初始化
model.prototype.attInit = function() {
	var heroInfo = fightCfg.getCfg("heros")[this.heroId]
	//基础战斗属性
	this.index = -1 					//战斗位置
	this.belong = "" 					//所属阵营
	this.isAction = false 				//回合行动过标识
	this.onAction = false  				//回合行动中标识
	//基础属性
	this.curAnger = 100 				//初始怒气
	this.maxAnger = 100 				//最大怒气
	this.needAnger = 100  				//释放技能所需怒气
	//一级属性
	this.attInfo = {}
	this.attInfo.main_dr = heroInfo.main_dr 			//体质  影响伤免、最大生命值
	this.attInfo.main_mag = heroInfo.main_mag 			//内力  影响内功伤害、内功减免
	this.attInfo.main_phy = heroInfo.main_phy 			//筋骨  影响外功伤害、外功减免
	this.attInfo.main_hit = heroInfo.main_hit 			//身法  影响出手速度、命中、闪避
	this.attInfo.main_slay = heroInfo.main_slay 		//悟性  影响暴击伤害、格挡、破格
	//二级属性
	this.attInfo.hp = 0 				//当前生命值
	this.attInfo.maxHP = 0 				//最大生命值
	this.attInfo.atk = 0 				//攻击力
	this.attInfo.armor = 0 				//护甲
	this.attInfo.speed = 0 				//速度
	//三级属性
	this.attInfo.hit = 0 				//命中率
	this.attInfo.hitDef = 0 			//闪避率
	this.attInfo.block = 0 				//格挡率
	this.attInfo.blockDef = 0 			//破格率
	this.attInfo.crit = 0 				//暴击率
	this.attInfo.critDef = 0 			//抗暴率
	this.attInfo.slay = 0 				//暴伤加成
	this.attInfo.slayDef = 0 			//暴伤减免
	//四级属性
	this.attInfo.control = 0 			//控制率
	this.attInfo.controlDef = 0 		//免控率
	this.attInfo.amp = 0 				//伤害加成
	this.attInfo.ampDef = 0 			//伤害减免
	this.attInfo.angerAmp = 0 			//技攻增伤
	this.attInfo.angerDef = 0 			//技攻减伤
	this.attInfo.normalAmp = 0 			//普攻增伤
	this.attInfo.normalDef = 0 			//普攻减伤
	this.attInfo.healAmp = 0 			//治疗加成
	this.attInfo.healAdd = 0 			//受疗加成
	this.attInfo.phyAmp = 0 			//外功增伤
	this.attInfo.phyDef = 0 			//外功减伤
	this.attInfo.magAmp = 0 			//内功增伤
	this.attInfo.magDef = 0 			//内功减伤
	this.attInfo.poisonAmp = 0 			//中毒增伤
	this.attInfo.poisonDef = 0 			//中毒减伤
	this.attInfo.ign_armor = 0 			//忽视护甲
	this.attInfo.roundAnger = 20 		//回合回怒
	this.attInfo.maxHP = 30000
	this.attInfo.atk = 2000
	this.attInfo.armor = 500
	//属性初始化
	this.attInfo.speed += this.attInfo.main_hit
	this.attTmpInfo = {} 	//临时属性增益
}
//战斗初始化
model.prototype.init = function() {}
model.prototype.begin = function() {}
//获得怒气
model.prototype.addAnger = function(value,show) {}
//减少怒气
model.prototype.lessAnger = function(value,show) {}
//获取生命值比例
model.prototype.getHPRate = function() {
	return this.attInfo.hp / this.attInfo.maxHP
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	var value = this.attInfo[name] || 0
	value += this.attTmpInfo[name] || 0
	for(var i in this.attBuffs)
		value += this.buffs[i].getAttInfo(name)
	return value
}
//改变属性
model.prototype.changeTotalAtt = function(name,value) {
	if(this.attInfo[name] !== undefined){
		this.attInfo[name] += Number(value) || 0
		if(name == "maxHP")
			this.attInfo["hp"] += Number(value) || 0
	}
}
//重置临时属性
model.prototype.clearTmpInfo = function() {
	this.attTmpInfo = {}
}
//改变临时属性
model.prototype.changeTotalTmp = function(name,value) {
	if(!this.attTmpInfo[name])
		this.attTmpInfo[name] = 0
	this.attTmpInfo[name] += Number(value) || 0
}
//攻击者触发
model.prototype.onAttackAfter = function() {}
//受到攻击
model.prototype.onHit = function(attacker,info) {}
//受到治疗
model.prototype.onHeal = function(attacker,info) {}
//角色死亡
model.prototype.onDie = function() {}
//恢复血量
model.prototype.addHP = function() {}
//扣除血量
model.prototype.lessHP = function() {}
//复活
model.prototype.resurgence = function(attacker,info) {}
//驱散控制
model.prototype.dispelControl = function() {
	for(var i in this.buffs)
		if(this.buffs[i]["buffCfg"]["control"])
			this.buffs[i].destroy()
}
//驱散增益
model.prototype.dispelAdd = function() {
	for(var i in this.buffs)
		if(this.buffs[i]["buffCfg"]["dispel_add"])
			this.buffs[i].destroy()
}
//驱散减益
model.prototype.dispelLess = function() {
	for(var i in this.buffs)
		if(this.buffs[i]["buffCfg"]["dispel_less"])
			this.buffs[i].destroy()
}
//============================状态触发
//触发击杀
model.prototype.onKill = function() {}
//触发闪避
model.prototype.onMiss = function() {}
//触发格挡
model.prototype.onBlock = function() {}
//触发暴击
model.prototype.onCrit = function() {}
//============================外部操作
//获取战斗数据
model.prototype.getCombatData = function() {}
module.exports = model