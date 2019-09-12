//服务器
var bearcat = require("bearcat")
var fightContorlFun = require("../fight/fightContorl.js")
var charactersCfg = require("../../../config/gameCfg/characters.json")
var areaServers = ["exp","partner","bag","dao","checkpoints","advance","pet","character","equip","gem","mail","artifact","fb","ttttower"]
const oneDayTime = 86400000
var area = function(otps,app) {
	this.areaId = otps.areaId
	this.areaName = otps.areaName
	this.app = app
	this.channelService = this.app.get('channelService')
	this.players = {}
	this.offLinePlayers = {}
	this.connectorMap = {}
	this.onlineNum = 0
	this.fightInfos = {}
	this.fightContorl = fightContorlFun()
	this.heroId = 10001
	this.dayStr = (new Date()).toDateString()
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
	// var curTime = Date.now()
	// for(var uid in this.offLinePlayers){
	// 	if(curTime > this.offLinePlayers[uid] + 30000){
	// 		delete this.offLinePlayers[uid]
	// 		delete this.players[uid]
	// 		delete this.connectorMap[uid]
	// 		this.onlineNum--
	// 	}
	// }
	var curDayStr = (new Date()).toDateString()
	if(this.dayStr !== curDayStr){
		this.dayUpdate(curDayStr)
	}
}
//每日定时器
area.prototype.dayUpdate = function(curDayStr) {
	console.log("每日刷新")
	this.dayStr = curDayStr
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
				self.addItem({uid : otps.uid,itemId : 101,value : 1000000})
				self.setPlayerData(otps.uid,"onhookLastTime",Date.now())
				cb(true,playerInfo)
			})
		}
	})
}
//玩家加入
area.prototype.userLogin = function(uid,cid,cb) {
	// console.log("userLogin : ",uid)
	// if(this.players[uid] && this.offLinePlayers[uid]){
	// 	console.log("已缓存无需重新获取",uid)
	// 	this.connectorMap[uid] = cid
	// 	delete this.offLinePlayers[uid]
	// 	cb(this.players[uid])
	// }else{
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
			if(playerInfo.dayStr != self.dayStr){
				self.dayFirstLogin(uid)
			}
		}
		cb(playerInfo)
	})
	// }
}
area.prototype.dayFirstLogin = function(uid) {
	console.log("玩家 "+uid+" 今日首次登录")
	this.setObj(uid,"playerInfo","dayStr",this.dayStr)
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	if(this.players[uid]){
		this.offLinePlayers[uid] = Date.now()
		self.onlineNum--
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
area.prototype.readyFight = function(uid) {
	if(!this.players[uid]){
		return false
	}
	var team = []
	for(var i in this.players[uid].characters){
		team.push(this.players[uid].characters[i])
	}
	var fightPet = this.players[uid].fightPet
	if(fightPet && this.players[uid].pets && this.players[uid].pets[fightPet]){
		team = team.concat(this.players[uid].pets[fightPet])
	}
	this.fightInfos[uid] = {team : team,seededNum : Date.now()}
	return this.fightInfos[uid]
}
//获取玩家上阵配置(出战阵容)
area.prototype.getFightInfo = function(uid) {
	if(this.fightInfos[uid]){
		var fightInfo = this.fightInfos[uid]
		delete this.fightInfos[uid]
		return fightInfo
	}else{
		return false
	}
}
//战斗记录
area.prototype.recordFight = function(atkTeam,defTeam,seededNum,readList) {
	var obj = {
		atkTeam : JSON.stringify(atkTeam),
		defTeam : JSON.stringify(defTeam),
		seededNum : seededNum,
		readList : JSON.stringify(readList)
	}
	 this.redisDao.db.hmset("test:fight",obj)
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