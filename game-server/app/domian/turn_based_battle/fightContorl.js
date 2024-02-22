'use strict';
//战斗控制器
const fightingEntity = require("./fighting.js")
const buffManager = require("./buff/buffManager.js")
const fightCfg = require("./fightCfg.js")
var model = function(){
	fightCfg.init()
	this.heros = fightCfg.getCfg("heros")
	this.fightVerifyInfo = false
	this.managers = {}
	this.managers["buffManager"] = new buffManager()
	const handlers = ["util","equip","fabao","hero","standard"]
	for(var i = 0;i < handlers.length;i++)
		require("./handler/"+handlers[i]+".js").call(this.managers,this)
}
//开始战斗
model.prototype.beginFight = function(atkTeam,defTeam,otps) {
	this.fightVerifyInfo = {}
	this.fightVerifyInfo.atkTeam = atkTeam
	this.fightVerifyInfo.defTeam = defTeam
	this.fightVerifyInfo.otps = otps
	this.fightVerifyInfo = JSON.stringify(this.fightVerifyInfo)
	var fighting = new fightingEntity(atkTeam,defTeam,otps,this.managers)
	fighting.fightBegin()
	this.fighting = fighting
	return fighting.getNormalWin()
}
//获取校验数据
model.prototype.getVerifyInfo = function() {
	return this.fightVerifyInfo
}
//获取团队数据
model.prototype.getTeamData = function(atkTeam,defTeam,otps) {
	var fighting = new fightingEntity(atkTeam,defTeam,otps,this.managers)
	return fighting.getTeamData()
}
module.exports = new model()