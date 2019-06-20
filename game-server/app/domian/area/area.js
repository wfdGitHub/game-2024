//服务器
var bearcat = require("bearcat")
var fightContorlFun = require("../fight/fightContorl.js")
var charactersCfg = require("../../../config/gameCfg/characters.json")
var areaServers = ["item","exp","partner","bag","dao","checkpoints"]
var charactersMap = {
	10001 : 0,
	10002 : 1,
	10003 : 2
}
var area = function(otps,app) {
	this.areaId = otps.areaId
	this.areaName = otps.areaName
	this.app = app
	this.channelService = this.app.get('channelService')
	this.players = {}
	this.connectorMap = {}
	this.onlineNum = 0
	this.fightContorl = fightContorlFun()
	for(var i = 0;i < areaServers.length;i++){
		var fun = require("./areaServer/"+areaServers[i]+".js")
		fun.call(this)
	}
}
//服务器初始化
area.prototype.init = function() {
	console.log("area init")
}
//玩家加入
area.prototype.userLogin = function(uid,cid,cb) {
	console.log("userLogin : ",uid)
	var self = this
	self.playerDao.getPlayerInfo({areaId : self.areaId,uid : uid},function(playerInfo) {
		if(playerInfo){
			this.onlineNum++
			self.players[uid] = playerInfo
			self.connectorMap[uid] = cid
		}
		cb(playerInfo)
	})
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	if(this.players[uid]){
		delete this.players[uid]
		delete this.connectorMap[uid]
		this.onlineNum--
	}
}
//增减角色属性
area.prototype.incrbyCharacterInfo = function(otps,cb) {
	var info = Object.assign({},otps)
	info.areaId = this.areaId
	var index = charactersMap[otps.characterId]
	var self = this
	self.characterDao.incrbyCharacterInfo(info,function(flag,data) {
		if(flag){
			if(self.players[info.uid] && self.players[info.uid].characters && self.players[info.uid].characters[index]){
				self.players[info.uid].characters[index][info.name] += info.value
			}
		}
		if(cb)
			cb(flag,data)
	})
}
//增加角色
area.prototype.createCharacter = function(otps) {
	console.log("createCharacter",otps)
	var characterInfo = this.characterDao.createCharacter(otps)
	this.players[otps.uid].characters[charactersMap[characterInfo.characterId]] = characterInfo
	console.log(this.players[otps.uid])
}
//根据配置表获取角色数据
area.prototype.characterDeploy = function(info) {
	var newInfo = {}
	var characterId = info.characterId
	if(!charactersCfg[info.characterId]){
		console.log("characterDeploy error ",info,charactersCfg[info.characterId])
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
	},{
		name : "app",
		type : "Object"
	}],
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "playerDao",
		ref : "playerDao"
	},{
		name : "characterDao",
		ref : "characterDao"
	}]
}