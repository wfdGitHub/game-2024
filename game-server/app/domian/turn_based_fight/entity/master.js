var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
//主角
var master = function(otps) {
	//=========基础属性=======//
	this.belong = otps.belong   //所属阵容
	this.attInfo = {}
	this.attInfo.maxHP = otps["maxHP"] || 0				//最大生命值
	this.attInfo.atk = otps["atk"] || 0					//攻击力
	this.attInfo.phyDef = otps["phyDef"] || 0			//物理防御力
	this.attInfo.magDef = otps["magDef"] || 0			//法术防御力

}
//初始化
master.prototype.init = function(team,enemy,locator,seeded) {
	this.team = team
	this.enemy = enemy
	this.locator = locator
	this.seeded = seeded
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
//使用技能
master.prototype.useSkill = function() {
	var target = this.locator.getTargets(this.team[0],"enemy_1")
	if(target.length){
		var recordInfo = {type : "master",belong:this.belong,targets:[]}
		var value = Math.floor((this.attInfo.atk - target[0].getTotalAtt("phyDef")) * 1)
		if(value < 1)
			value = 1
		var info = target[0].onHit(this,{value:value,d_type:"phy"})
		recordInfo.targets.push(info)
		fightRecord.push(recordInfo)
	}
}
module.exports = master