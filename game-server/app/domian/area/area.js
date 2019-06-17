//服务器
var bearcat = require("bearcat")
var dao = require("./areaServer/dao.js")
var checkpoints = require("./areaServer/checkpoints.js")
var fightContorlFun = require("../fight/fightContorl.js")
var charactersCfg = require("../../../config/gameCfg/characters.json")
var area = function(otps) {
	this.areaId = otps.areaId
	this.areaName = otps.areaName
	this.players = {}
	this.onlineNum = 0
	this.fightContorl = fightContorlFun()
	dao.call(this)
	checkpoints.call(this)
}
//服务器初始化
area.prototype.init = function() {
	console.log("area init")
}
//玩家加入
area.prototype.userLogin = function(uid,cb) {
	console.log("userLogin : ",uid)
	var self = this
	self.playerDao.getPlayerInfo({areaId : self.areaId,uid : uid},function(playerInfo) {
		if(playerInfo){
			this.onlineNum++
			self.players[uid] = playerInfo
		}
		cb(playerInfo)
	})
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	if(this.players[uid]){
		delete this.players[uid]
		this.onlineNum--
	}
}
//根据配置表获取角色数据
area.prototype.characterDeploy = function(info) {
	var newInfo = {}
	var characterId = info.characterId
	if(!charactersCfg[info.characterId]){
		return false
	}
	for(var i in charactersCfg[characterId]){
		newInfo[i] = charactersCfg[characterId][i]
	}
	newInfo.level = info.level
	return newInfo
}

module.exports = {
	id : "area",
	func : area,
	scope : "prototype",
	init : "init",
	args : [{
		name : "otps",
		type : "Object"
	}],
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "playerDao",
		ref : "playerDao"
	}]
}