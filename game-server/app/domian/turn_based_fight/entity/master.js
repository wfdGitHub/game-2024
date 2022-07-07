var fightRecord = require("../fight/fightRecord.js")
var power = require("../skill/powerSkill.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
var skillManager = require("../skill/skillManager.js")
//主角
var master = function(otps) {
	//=========基础属性=======//
	this.belong = otps.belong   //所属阵容
	this.id = this.belong+"master"
	this.index = 0				//所在位置
	this.attInfo = {}
	this.attInfo.maxHP = otps["maxHP"] || 0				//最大生命值
	this.attInfo.atk = otps["atk"] || 0					//攻击力
	this.attInfo.phyDef = otps["phyDef"] || 0			//物理防御力
	this.attInfo.magDef = otps["magDef"] || 0			//法术防御力
	this.BP = 0 										//当前行动值
	this.powers = [] 									//技能列表
	this.totalDamage = 0								//累计伤害
	this.totalHeal = 0									//累计治疗
	this.buffs = {}
	this.addPower()
}
//初始化
master.prototype.init = function(team,enemy,locator,seeded) {
	this.team = team
	this.enemy = enemy
	this.locator = locator
	this.seeded = seeded
	for(var i = 0;i < this.team.length;i++){
		this.team[i].master = this
	}
}
//初始化技能
master.prototype.addPower = function() {
	this.powers.push(new power({"type":"heal","mul":0.1,"NEED_BP":1,"key1":"buff1","value1":"{\"buffId\":\"cold\",\"buff_tg\":\"skill_targets\",\"buffArg\":0,\"duration\":2,\"buffRate\":1}"},this))
}
//获取属性
master.prototype.getTotalAtt = function(name) {
	var value = this.attInfo[name] || 0
	return value
}
master.prototype.onHit = function() {
}
master.prototype.kill = function() {
}
//每个英雄行动后
master.prototype.heroAfter = function() {
	this.changeBP(1)
}
//整体回合结束后
master.prototype.endRound = function() {
	for(var i = 0;i < this.powers.length;i++){
		this.powers[i].updateCD()
	}
}
//使用技能
master.prototype.masterPower = function(index) {
	if(this.powers[index]){
		if(this.BP < this.powers[index].NEED_BP){
			console.error("BP不足,不能使用")
			return false
		}
		if(this.powers[index].CUR_CD !== 0){
			console.error("冷却中,不能使用 "+this.powers[index].CUR_CD+"/"+this.powers[index].NEED_CD)
			return false
		}
		this.changeBP(-this.powers[index].NEED_BP)
		skillManager.useSkill(this.powers[index])
		return true
	}else{
		console.error("主角技能不存在")
		return false
	}
}
master.prototype.changeBP = function(change) {
	this.BP = this.BP + change
	var info =  {}
	info.type = "bp_update"
	info.belong = this.belong
	info.change = change
	info.BP = this.BP
	fightRecord.push(info)
}
module.exports = master