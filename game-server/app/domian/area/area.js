//服务器
var bearcat = require("bearcat")
var fightContorlFun = require("../fight/fightContorl.js")
var charactersCfg = require("../../../config/gameCfg/characters.json")
var areaServers = ["exp","partner","bag","dao","checkpoints","advance","pet","character"]
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
//玩家注册
area.prototype.register = function(otps,cb) {
	var self = this
	self.playerDao.getPlayerInfo(otps,function(playerInfo) {
		if(playerInfo){
			cb(false,"账号已存在")
		}else{
			self.playerDao.createPlayer(otps,function(playerInfo) {
				if(!playerInfo){
					cb(false,playerInfo)
					return
				}
				self.addPlayerData(otps.uid,"onhookLastTime",Date.now())
				cb(true,playerInfo)
			})
		}
	})
}
//玩家加入
area.prototype.userLogin = function(uid,cid,cb) {
	console.log("userLogin : ",uid)
	var self = this
	self.playerDao.getPlayerInfo({areaId : self.areaId,uid : uid},function(playerInfo) {
		if(playerInfo){
			self.onlineNum++
			self.players[uid] = playerInfo
			self.connectorMap[uid] = cid
			self.getOnhookAward(uid,1,function(flag,data) {
				if(flag){
					var notify = {
						type : "offlineOnhookAward",
						data : data
					}
					self.sendToUser(uid,notify)
				}
			})
		}
		cb(playerInfo)
	})
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	if(this.players[uid]){
		// delete this.players[uid]
		// delete this.connectorMap[uid]
		this.onlineNum--
	}
}
//发送消息给玩家
area.prototype.sendToUser = function(uid,notify) {
	this.channelService.pushMessageByUids('onMessage', notify, [{
      uid: uid,
      sid: this.connectorMap[uid]
    }])
}
//获取服务器信息
area.prototype.getAreaServerInfo = function(){
	var info = {
		areaId : this.areaId,
		name : this.areaName,
		onlineNum : this.onlineNum
	}
	return info
}
//获取服务器内玩家信息
area.prototype.getAreaPlayers = function(){
	return this.players
}
//获取玩家上阵配置
area.prototype.getFightTeam = function(uid) {
	if(!this.players[uid]){
		return false
	}
	var team = this.players[uid].characters.concat()
	var fightPet = this.players[uid].fightPet
	if(fightPet && this.players[uid].pets && this.players[uid].pets[fightPet]){
		team = team.concat(this.players[uid].pets[fightPet])
	}
	console.log(team)
	return team
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
	},{
		name : "petDao",
		ref : "petDao"
	}]
}