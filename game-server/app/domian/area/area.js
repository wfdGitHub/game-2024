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
	this.offLinePlayers = {}
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
	setInterval(this.update.bind(this),1000)
}
//update
area.prototype.update = function() {
	var curTime = Date.now()
	for(var uid in this.offLinePlayers){
		if(curTime > this.offLinePlayers[uid] + 60000){
			console.log("离线过长，删除玩家 ",uid)
			delete this.players[uid]
			delete this.connectorMap[uid]
			delete this.offLinePlayers[uid]
		}
	}
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
	if(this.connectorMap[uid] && this.players[uid] && this.connectorMap[uid]){
		console.log("已缓存无需重新获取",uid)
		this.connectorMap[uid] = cid
		delete this.offLinePlayers[uid]
		cb(this.players[uid])
	}else{
		var self = this
		self.playerDao.getPlayerInfo({areaId : self.areaId,uid : uid},function(playerInfo) {
			if(playerInfo){
				delete self.offLinePlayers[uid]
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
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	if(this.players[uid]){
		this.offLinePlayers[uid] = Date.now()
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
//获取玩家上阵配置(出战阵容)
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