//服务器
var bearcat = require("bearcat")
var fightContorlFun = require("../turn_based_fight/fight/fightContorl.js")
var async = require("async")
const standard_dl = require("../../../config/gameCfg/standard_dl.json")
const heros = require("../../../config/gameCfg/heros.json")
const standard_ce_cfg = require("../../../config/gameCfg/standard_ce.json")
const areaServers = ["tour","zhulu","worldBoss","bazzar","combatEffectiveness","arena","bag","dao","checkpoints","mail","fb","ttttower","lord","daily_fb","task"]
const oneDayTime = 86400000
var standard_ce = {}
for(var i in standard_ce_cfg){
	standard_ce[i] = JSON.parse(standard_ce_cfg[i]["base"])
}
var area = function(otps,app) {
	this.areaId = otps.areaId
	this.areaName = otps.areaName
	this.app = app
	this.channelService = this.app.get('channelService')
	this.players = {}
	this.connectorMap = {}
	this.oriIds = {}
	this.onlineNum = 0
	this.fightInfos = {}
	this.fightContorl = fightContorlFun
	this.heroId = 10001
	this.dayStr = ""
	this.crossUids = {}
	this.timer = 0
	for(var i = 0;i < areaServers.length;i++){
		var fun = require("./areaServer/"+areaServers[i]+".js")
		fun.call(this)
	}
}
//服务器初始化
area.prototype.init = function() {
	console.log("area init",this.areaId)
	var self = this
	this.redisDao.db.hgetall("area:area"+this.areaId+":robots",function(err,robots) {
		self.robots = {}
		for(let i in robots){
			self.robots[i] = JSON.parse(robots[i])
		}
	})
	this.redisDao.db.hgetall("area:area"+this.areaId+":oriIds",function(err,oriIds) {
		for(let i in oriIds){
			self.oriIds[i] = Number(oriIds[i])
		}
	})
	this.worldBossCheck()
	this.timer = setInterval(this.update.bind(this),1000)
}
//服务器关闭
area.prototype.destory = function() {
	console.log("area destory",this.areaId)
	clearInterval(this.timer)
	this.worldBossDestory()
	this.removeAllUser()
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
	console.log("服务器每日刷新")
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
				self.oriIds[playerInfo.uid] = otps.oriId
				self.redisDao.db.hset("area:area"+self.areaId+":oriIds",playerInfo.uid,otps.oriId)
				self.taskInit(playerInfo.uid)
				self.setPlayerData(playerInfo.uid,"onhookLastTime",Date.now())
				//TODO test
				self.addItem({uid : playerInfo.uid,itemId : 101,value : 1000000})
				cb(true,playerInfo)
			})
		}
	})
}
//玩家加入
area.prototype.userLogin = function(uid,oriId,cid,cb) {
	console.log("userLogin",uid,oriId,cid)
	var self = this
	var playerInfo = {}
	async.waterfall([
		function(next) {
			self.playerDao.getPlayerInfo({areaId : oriId,uid : uid},function(info) {
				if(info){
					playerInfo = info
					next()
				}else{
					next("未注册角色")
				}
			})
		},
		function(next) {
			self.lordLoad(uid,next)
		},
		function(next) {
			self.checkpointsLoad(uid,next)
		},
		function(next) {
			self.taskLoad(uid,next)
		},
		function(next) {
			self.CELoad(uid,function(flag) {
				if(flag){
					playerInfo.CE = self.getCE(uid)
					next()
				}else{
					cb(false,"获取战力出错")
				}
			})
		},
		function(next) {
			self.zhuluLoad(uid,next)
		},
		function() {
			if(!self.players[uid])
				self.onlineNum++
			self.players[uid] = playerInfo
			self.connectorMap[uid] = cid
			playerInfo.areaId = self.areaId
			if(playerInfo.dayStr != self.dayStr){
				self.dayFirstLogin(uid)
			}
			cb(true,playerInfo)
		}
	],function(err) {
		cb(false,err)
	})
}
//玩家首次登录
area.prototype.dayFirstLogin = function(uid) {
	console.log("玩家 "+uid+" 今日首次登录")
	this.setObj(uid,"playerInfo","dayStr",this.dayStr)
	this.setPlayerData(uid,"quick",0)
	this.TTTdayUpdate(uid)
	this.arenadayUpdate(uid)
	this.dailyfbUpdate(uid)
	this.dayTaskRefresh(uid)
	this.bazaarDayRefresh(uid)
	this.shopRefresh(uid)
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	if(this.players[uid]){
		delete this.players[uid]
		delete this.connectorMap[uid]
		this.onlineNum--
		this.taskUnload(uid)
		this.CEUnload(uid)
		this.lordUnload(uid)
		this.checkpointsUnload(uid)
		this.zhuluUnload(uid)
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
//移除服务器所有玩家
area.prototype.removeAllUser = function(){
	for(var uid in this.connectorMap){
		this.app.rpc.connector.connectorRemote.kickUser.toServer(this.connectorMap[uid],uid,null)
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
area.prototype.readyFight = function(uid,cb) {
	let team = this.getUserTeam(uid)
	if(team){
		this.fightInfos[uid] = {team : team,seededNum : Date.now()}
		cb(true,this.fightInfos[uid])
	}else{
		cb(false,"无战斗数据")
	}
}
//获取玩家防御阵容配置(被攻击阵容)
area.prototype.getDefendTeam = function(uid,cb) {
	var self = this
	self.heroDao.getFightTeam(self.areaId,uid,function(flag,data) {
		if(flag){
			cb(data)
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
    self.app.rpc.cross.crossRemote.userLogin(null,uid,self.areaId,self.oriIds[uid],self.app.serverId,self.connectorMap[uid],self.players[uid],function(flag,data) {
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
		uid : uid,
		name : this.players[uid]["name"]
	}
	return info
}
//基准战力阵容
area.prototype.standardTeam = function(uid,team,dl) {
	let lv = this.getLordLv(uid)
	let standardInfo = standard_ce[lv]
	let dlInfo = standard_dl[dl]
	let info = Object.assign({},standardInfo)
	if(dlInfo.lv){
		info.lv += dlInfo.lv
		delete dlInfo.lv
	}
	info = Object.assign(info,dlInfo)
	for(var i = 0;i < team.length;i++){
		if(team[i]){
			team[i] = Object.assign({id : team[i]},info)
			if(team[i].star < heros[team[i]["id"]]["min_star"])
				team[i].star = heros[team[i]["id"]]["min_star"]
		}
	}
	return team
}
//批量获取玩家基本数据
area.prototype.getPlayerInfoByUids = function(uids,cb) {
	var self = this
	var multiList = []
	for(var i = 0;i < uids.length;i++){
		multiList.push(["hmget","area:area"+self.oriIds[uids[i]]+":player:"+uids[i]+":playerInfo",["name","head"]])
	}
	self.redisDao.multi(multiList,function(err,list) {
		var userInfos = []
		for(var i = 0;i < uids.length;i++){
			let info = {}
			if(uids[i] < 10000){
				info = self.robots[uids[i]]
			}else{
				info = {
					uid : uids[i],
					name : list[i][0],
					head : list[i][1]
				}
			}
			userInfos.push(info)
		}
		cb(userInfos)
	})
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
		name : "heroDao",
		ref : "heroDao"
	}]
}