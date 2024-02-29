var fightRecord = require("../fight/fightRecord.js")
var powerSkill = require("../skill/powerSkill.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
var power_lv = require("../../../../config/gameCfg/power_lv.json")
var skillManager = require("../skill/skillManager.js")
var power_base = require("../../../../config/gameCfg/power_base.json")
var skillsCfg = require("../../../../config/gameCfg/skills.json")
//主角
var master = function(otps) {
	//=========基础属性=======//
	this.belong = otps.belong   //所属阵容
	this.characterType = "master"  //角色类型
	this.id = this.belong+"Master"
	this.index = 1				//所在位置
	this.peerMaster = {}        //对方主角
	this.attInfo = {}
	this.attInfo.maxHP = 0								//最大生命值
	this.attInfo.atk = 0								//攻击力
	this.attInfo.phyDef = 0								//物理防御力
	this.attInfo.magDef = 0								//法术防御力
	this.lord_power = otps.lord_power || 0 				//主公威力加成值
	this.lord_power += Math.floor(Math.pow(otps.maxLv,1.2) * 60)
	this.ws_power = otps.ws_power || 0  				//无双威力加成百分比
	this.power_up = 0 									//技能系数增强
	this.manualModel = otps.manualModel || 0    		//技能释放模式
	this.manualIndex = 0 								//当前执行技能下标
	this.BP = 0 										//当前行动值
	this.powers = [] 									//技能列表
	this.totalDamage = 0								//累计伤害
	this.totalHeal = 0									//累计治疗
	this.TMP_CURBP = 0 									//本回合BP改变值
	this.ONCE_CURBP = 0 								//下一个技能BP改变值
	this.buffs = {}
	this.otps = otps
}
//初始化
master.prototype.init = function(fighting,list,team,enemy,locator,seeded,peerMaster) {
	this.fighting = fighting
	this.team = team
	this.enemy = enemy
	this.locator = locator
	this.seeded = seeded
	this.peerMaster = peerMaster
	for(var i = 0;i < list.length;i++){
		list[i].master = this
	}
}
//技能释放判断
master.prototype.checkManualModel = function() {
	var index = this.fighting.round / 2
	if(Number.isInteger(index))
		this.masterPower(index - 1)
}
//添加主动技能
master.prototype.addPower = function(info) {
	var skillId = power_base[info.id]["star"+info.star]
	if(skillsCfg[skillId]){
		var powerInfo = skillsCfg[skillId]
		powerInfo.CUR_CD = power_base[info.id].CUR_CD
		powerInfo.NEED_BP = power_base[info.id].NEED_BP
		powerInfo.NEED_CD = power_base[info.id].NEED_CD
		powerInfo.name = power_base[info.id].name
		powerInfo.skillId = info.id
		powerInfo.basic = Math.floor(info.basic * (1 + this.ws_power))
		this.powers.push(new powerSkill(powerInfo,this))
	}
}
//获取属性
master.prototype.getTotalAtt = function(name) {
	if(name == "atk")
		return this.lord_power
	else
		return this.attInfo[name] || 0
}
//每个英雄行动后
master.prototype.heroAfter = function() {
	// this.changeBP(1)
}
//整体回合结束后
master.prototype.endRound = function() {
	// this.TMP_CURBP = 0
	// for(var i = 0;i < this.powers.length;i++){
	// 	this.powers[i].endRound()
	// }
}
master.prototype.updateCD = function(value) {
	// for(var i = 0;i < this.powers.length;i++){
	// 	this.powers[i].updateCD(value)
	// }
}
//使用技能
master.prototype.masterPower = function(index) {
	// if(index == -1)
	// 	index = this.powers.length - 1
	if(!this.powers[index]){
		return false	
	}
	// var needBp = this.TMP_CURBP + this.powers[index].NEED_BP
	// if(this.ONCE_CURBP)
	// 	needBp += this.ONCE_CURBP
	if(this.powers[index]){
		// if(this.BP < needBp){
		// 	console.error("BP不足,不能使用 "+this.BP+"/"+needBp)
		// 	return false
		// }
		// if(this.powers[index].CUR_CD !== 0){
		// 	console.error("冷却中,不能使用 "+this.powers[index].CUR_CD+"/"+this.powers[index].NEED_CD)
		// 	return false
		// }
		// this.powers[index].updateCD(this.powers[index].NEED_CD)
		// this.changeBP(-needBp)
		// this.ONCE_CURBP = 0
		skillManager.useSkill(this.powers[index])
		return true
	}else{
		console.error("主角技能不存在")
		return false 
	}
}
master.prototype.changeBP = function(change) {
	// if(this.BP > 12 && change > 0)
	// 	return
	// if(this.BP <= 0 && change  < 0)
	// 	return
	// this.BP = this.BP + change
	// if(this.BP < 0)
	// 	this.BP = 0
	// if(this.BP > 12)
	// 	this.BP = 12
	// var info =  {}
	// info.type = "bp_update"
	// info.belong = this.belong
	// info.change = change
	// info.BP = this.BP
	// fightRecord.push(info)
}
//获取显示数据
master.prototype.getShowData = function() {
	var info = {
		BP : this.BP
	}
	for(var i = 0;i < this.powers.length;i++){
		info["power"+i] = this.powers[i].getShowData()
	}
	return info
}
//移除控制状态
master.prototype.removeControlBuff = function() {}
//移除非控制类负面状态
master.prototype.removeDeBuffNotControl = function() {}
//解除一个减益状态
master.prototype.removeOneLower = function() {}
//驱散增益状态
master.prototype.removeIntensifyBuff = function() {}
//驱散一个增益状态
master.prototype.removeOneIntensify = function() {}
//驱散负面状态
master.prototype.removeDeBuff = function() {}
//获得负面状态数量
master.prototype.getDebuffNum = function() {}
//获得增益状态数量
master.prototype.getIntensifyNum = function() {}
//清除指定角色buff
master.prototype.clearReleaserBuff = function(releaser) {}
//清除所有buff
master.prototype.diedClear = function() {}
master.prototype.addKillBuff = function(buffStr) {}
master.prototype.addActionBuff = function(buffStr) {}
master.prototype.addDiedBuff = function(buffStr) {}
//闪避
master.prototype.onMiss = function() {}
//受到伤害
master.prototype.onHit = function(attacker,info,callbacks) {}
//生命流失
master.prototype.onHPLoss = function() {}
//受到治疗
master.prototype.onHeal = function(releaser,info) {}
//永久增加属性
master.prototype.addAtt = function(name,value) {}
//角色死亡
master.prototype.onDie = function() {}
//队友死亡
master.prototype.friendDied = function(friend){}
//击杀目标
master.prototype.kill = function(target) {}
//复活
master.prototype.resurgence = function(rate,releaser) {}
//恢复血量
master.prototype.addHP = function(value) {}
//扣除血量
master.prototype.lessHP = function(info,callbacks) {}
//恢复怒气
master.prototype.addAnger = function(value,hide) {}
//减少怒气
master.prototype.lessAnger = function(value,hide,use) {}
master.prototype.checkChaseSkill = function() {}
//获取属性
//获取信息
master.prototype.getInfo = function() {}
master.prototype.getSimpleInfo = function() {}
master.prototype.addBuff = function(releaser,buff) {}
master.prototype.removeBuff = function(buffId) {}
//判断被动技能是否生效
master.prototype.isPassive = function(id,callbacks) {
	return false
}
//获取被动技能参数
master.prototype.getPassiveArg = function(id) {
	return 0
}
module.exports = master