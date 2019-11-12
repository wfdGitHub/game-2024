//服务器
var bearcat = require("bearcat")
var fightContorlFun = require("../fight/fightContorl.js")
var charactersCfg = require("../../../config/gameCfg/characters.json")
var areaServers = ["arena","exp","partner","bag","dao","checkpoints","advance","pet","character","equip","gem","mail","artifact","fb","ttttower"]
const oneDayTime = 86400000
var area = function(otps,app) {
	this.areaId = otps.areaId
	this.areaName = otps.areaName
	this.app = app
	this.channelService = this.app.get('channelService')
	this.players = {}
	this.connectorMap = {}
	this.onlineNum = 0
	this.fightInfos = {}
	this.fightContorl = fightContorlFun()
	this.heroId = 10001
	this.dayStr = (new Date()).toDateString()
	this.crossUids = {}
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
	self.playerDao.checkPlayerInfo(otps,function(flag,err) {
		if(!flag){
			cb(flag,err)
		}else{
			self.playerDao.createPlayer(otps,function(playerInfo) {
				if(!playerInfo){
					cb(false,playerInfo)
					return
				}
				self.initArenaRank(otps.uid,otps.name,otps.sex)
				self.setPlayerData(otps.uid,"onhookLastTime",Date.now())
				//TODO test
				self.addItem({uid : otps.uid,itemId : 101,value : 1000000})
				self.petDao.obtainPet(otps.areaId,otps.uid,12101)
				for(var i = 1;i <= 10;i++){
					self.addEquip(otps.uid,"e"+i,0,1)
				}
				cb(true,playerInfo)
			})
		}
	})
}
//玩家加入
area.prototype.userLogin = function(uid,cid,cb) {
	var self = this
	self.playerDao.getPlayerInfo({areaId : self.areaId,uid : uid},function(playerInfo) {
		if(playerInfo){
			if(!self.players[uid])
				self.onlineNum++
			self.players[uid] = playerInfo
			self.connectorMap[uid] = cid
			self.getOnhookAward(uid,1,function(flag,awardTime) {
				if(flag){
					if(awardTime >= 1800){
						var notify = {
							type : "offlineOnhookAward",
							data : awardTime
						}
						self.sendToUser(uid,notify)
					}
				}
			})
			if(playerInfo.dayStr != self.dayStr){
				self.dayFirstLogin(uid)
			}
		}
		cb(playerInfo)
	})
}
//玩家首次登录
area.prototype.dayFirstLogin = function(uid) {
	console.log("玩家 "+uid+" 今日首次登录")
	this.setObj(uid,"playerInfo","dayStr",this.dayStr)
	this.TTTdayUpdate(uid)
	this.arenadayUpdate(uid)
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	if(this.players[uid]){
		delete this.players[uid]
		delete this.connectorMap[uid]
		this.onlineNum--
	}
	if(this.crossUids[uid]){
		this.app.rpc.cross.crossRemote.userLeave(null,this.crossUids[uid],null)
	}
}
//发送消息给玩家
area.prototype.sendToUser = function(uid,notify) {
	this.channelService.pushMessageByUids('onMessage', notify, [{
      uid: uid,
      sid: this.connectorMap[uid]
    }])
}
//发送给服务器内全部玩家
area.prototype.sendAllUser = function(notify) {
	for(var uid in this.connectorMap){
		this.channelService.pushMessageByUids('onMessage', notify, [{
	      uid: uid,
	      sid: this.connectorMap[uid]
	    }])
	}
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
//预备战斗
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
//获取玩家防御阵容配置(被攻击阵容)
area.prototype.getDefendTeam = function(uid,cb) {
	var self = this
	self.playerDao.getPlayerInfo({areaId : self.areaId,uid : uid},function(playerInfo) {
		if(playerInfo){
			var team = []
			for(var i in playerInfo.characters){
				team.push(playerInfo.characters[i])
			}
			var fightPet = playerInfo.fightPet
			if(fightPet && playerInfo.pets && playerInfo.pets[fightPet]){
				team = team.concat(playerInfo.pets[fightPet])
			}
			cb(team)
		}else{
			cb(false)
		}
	})
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
		atkTeam : JSON.stringify(atkTeam) || "null",
		defTeam : JSON.stringify(defTeam) || "null",
		seededNum : seededNum || "null",
		readList : JSON.stringify(readList) || "null"
	}
	 this.redisDao.db.hmset("test:fight",obj)
}
//连入跨服服务器
area.prototype.loginCross = function(uid,crossUid,cb) {
	if(!this.players[uid]){
		cb(false,"没有该玩家数据")
		return
	}
	var self = this
    self.app.rpc.cross.crossRemote.userLogin(null,uid,self.areaId,self.app.serverId,self.connectorMap[uid],self.players[uid],function(flag,data) {
    	if(flag){
    		self.crossUids[uid] = crossUid
    	}
		cb(flag,data)
	})
}
area.prototype.getSimpleUser = function(uid) {
	if(!this.players[uid]){
		return false
	}
	var info = {
		name : this.players[uid]["name"],
		sex : this.players[uid]["sex"]
	}
	return info
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