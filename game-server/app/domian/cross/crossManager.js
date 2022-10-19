//跨服服务器
var fightContorlFun = require("../turn_based_fight/fight/fightContorl.js")
const standard_dl = require("../../../config/gameCfg/standard_dl.json")
const heros = require("../../../config/gameCfg/heros.json")
const standard_ce = require("../../../config/gameCfg/standard_ce.json")
const mailText = require("../../../config/gameCfg/mailText.json")
var uuid = require("uuid")
var crossServers = ["grading","escort","peakCompetition","muye","guild_pk","ancient","manorCross","theatre"]
var crossManager = function(app) {
	this.app = app
	this.channelService = this.app.get("channelService")
	this.fightContorl = fightContorlFun
}
//初始化
crossManager.prototype.init = function() {
	this.onlineNum = 0
	this.players = {}
	this.uidMap = {}
	this.oriIds = {}
	this.dayStr = ""
	for(var i = 0;i < crossServers.length;i++){
		var fun = require("./crossServers/"+crossServers[i]+".js")
		fun.call(this)
	}
	var dao = require("../area/areaServer/dao.js")
	dao.call(this)
	this.theatreInit()
	setInterval(this.update.bind(this),3000)
	var self = this
	setTimeout(function() {
		self.accountDao.getAccountInfo({unionid : "visitor_wgl"},function(flag,data) {
			if(!flag){
				console.log("创建初始账号")
				self.accountDao.createAccount({unionid:"visitor_wgl"},function(flag,userInfo) {
					self.accountDao.setAccountData({accId:userInfo.accId,name:"limit",value:20})
				})
			}
		})
	},10000)
}
//每日定时器
crossManager.prototype.dayUpdate = function(curDayStr) {
	console.log("跨服服务器每日刷新")
	var self = this
	this.dayStr = curDayStr
	self.mysqlDao.createDayTable()
	this.gradingDayUpdate()
	this.peakDayUpdate()
	this.muyeDayUpdate()
	this.guildPKDayUpdate()
	this.redisDao.db.hget("crossServers","dayStr",function(err,data) {
		if(data !== self.dayStr){
			self.redisDao.db.hset("crossServers","dayStr",self.dayStr)
			self.firstDayUpdate()
		}
	})
}
//每日首次定时器
crossManager.prototype.firstDayUpdate = function() {
	console.log("跨服每日首次刷新")
	this.theatreDayUpdate()
	this.ancientDayUpdate()
}
crossManager.prototype.update = function() {
	var self = this
	setTimeout(function() {
		var date = new Date()
		self.escortUpdate(date)
		self.peakUpdate(date)
		self.manorCrossUpdate(date)
		var curDayStr = (new Date()).toDateString()
		if(self.dayStr !== curDayStr){
			self.dayUpdate(curDayStr)
		}
	},1)
}
//玩家连入跨服服务器
crossManager.prototype.userLogin = function(uid,areaId,oriId,serverId,cid,playerInfo,cb) {
	var self = this
	self.heroDao.getFightTeam(uid,function(flag,fightTeam) {
		if(flag){
			var theatreLen = self.theatreList.length || 1
			var theatreId = self.theatreMap[areaId] === undefined ?  (theatreLen - 1) : self.theatreMap[areaId]
			var userInfo = {
				uid : uid,
				areaId : areaId,
				oriId : oriId,
				serverId : serverId,
				cid : cid,
				playerInfo : playerInfo,
				fightTeam : fightTeam,
				theatreId : theatreId
			}
			var crossUid = oriId+"|"+uid
			if(!self.players[crossUid])
				self.onlineNum++
			self.uidMap[uid] = crossUid
			self.players[crossUid] = userInfo
			self.oriIds[crossUid] = oriId
			cb(true,crossUid,theatreId,theatreLen)
		}else{
			cb(false,"获取玩家战斗阵容失败")
		}
	})
}
//玩家离线
crossManager.prototype.userLeave = function(crossUid) {
	if(this.players[crossUid]){
		delete this.uidMap[this.players[crossUid].uid]
		delete this.players[crossUid]
		delete this.oriIds[crossUid]
		this.onlineNum--
	}
	// this.unSubscribeCarMessage(crossUid)
}
//获取玩家简易信息
crossManager.prototype.getSimpleUser = function(crossUid) {
	if(!this.players[crossUid]){
		if(Number.isInteger(crossUid)){
			var info = {
				name : this.namespace.getNameByIndex(crossUid),
				areaId : Math.floor(Math.random() * 3) + 1
			}
			info.oriId = info.areaId
			return info
		}else{
			return false
		}
	}else{
		var info = {
			name : this.players[crossUid]["playerInfo"]["name"],
			areaId : this.players[crossUid]["playerInfo"]["areaId"],
			head : this.players[crossUid]["playerInfo"]["head"],
			figure : this.players[crossUid]["playerInfo"]["figure"],
			oriId : this.oriIds[crossUid]
		}
		return info
	}
}
//获取玩家战斗阵容
crossManager.prototype.userTeam = function(crossUid) {
	if(!this.players[crossUid]){
		return false
	}
	return this.players[crossUid]["fightTeam"]
}
//获取玩家防守阵容配置
crossManager.prototype.getDefendTeam = function(uid,cb) {
	this.heroDao.getFightTeam(uid,function(flag,data) {
		if(flag){
			cb(data)
		}else{
			cb(false)
		}
	})
}
//发送消息给玩家
crossManager.prototype.sendToUser = function(type,crossUid,notify) {
	if(!this.players[crossUid])
		return
	this.channelService.pushMessageByUids(type, notify,[{
	      uid: this.players[crossUid]["uid"],
	      sid: this.players[crossUid]["cid"]
	}])
}
//发送指定路由的消息给玩家
crossManager.prototype.sendByTypeToUser = function(type,uids,notify) {
	this.channelService.pushMessageByUids(type, notify,uids)
}
//消耗道具
crossManager.prototype.consumeItems = function(crossUid,str,rate,reason,cb) {
	if(!this.players[crossUid]){
		cb(false)
		return
	}
	var areaId = this.players[crossUid]["areaId"]
	var serverId = this.players[crossUid]["serverId"]
	var uid = this.players[crossUid]["uid"]
	this.app.rpc.area.areaRemote.consumeItems.toServer(serverId,uid,areaId,str,rate,reason,cb)
}
//物品奖励
crossManager.prototype.addItemStr = function(crossUid,str,rate,reason,cb) {
	if(!this.players[crossUid]){
		cb(false)
		return
	}
	var areaId = this.players[crossUid]["areaId"]
	var serverId = this.players[crossUid]["serverId"]
	var uid = this.players[crossUid]["uid"]
	this.app.rpc.area.areaRemote.addItemStr.toServer(serverId,uid,areaId,str,rate,reason,cb)
}
//通过文本模板发送邮件
crossManager.prototype.sendTextToMail = function(crossUid,key,atts,arg,cb) {
	var title = mailText[key]["title"]
	var text = mailText[key]["text"]
	if(arg)
		text = text.replace("xxx",arg)
	this.sendMail(crossUid,title,text,atts,cb)
}
//发放邮件
crossManager.prototype.sendMail = function(crossUid,title,text,atts,cb) {
	if(this.players[crossUid]){
		var areaId = this.players[crossUid]["areaId"]
		var uid = this.players[crossUid]["uid"]
		var serverId = this.players[crossUid]["serverId"]
		this.app.rpc.area.areaRemote.sendMail.toServer(serverId,uid,areaId,title,text,atts,cb)
	}else{
		var list = crossUid.split("|")
		var uid = parseInt(list[1])
		this.sendMailByUid(uid,title,text,atts,cb)
	}
}
//通过文本模板发送邮件
crossManager.prototype.sendTextToMailById = function(uid,key,atts,arg,cb) {
	var title = mailText[key]["title"]
	var text = mailText[key]["text"]
	if(arg)
		text.replace("xxx",arg)
	this.sendMailByUid(uid,title,text,atts,cb)
}
//直接发放离线邮件
crossManager.prototype.sendMailByUid = function(uid,title,text,atts,cb) {
	var crossUid = this.uidMap[uid]
	if(crossUid && this.players[crossUid]){
		var areaId = this.players[crossUid]["areaId"]
		var serverId = this.players[crossUid]["serverId"]
		this.app.rpc.area.areaRemote.sendMail.toServer(serverId,uid,areaId,title,text,atts,cb)
	}else{
		var mailInfo = {
			title : title,
			text : text,
			id : Date.now(),
			time : Date.now()
		}
		if(atts){
			mailInfo.atts = atts
		}
		mailInfo = JSON.stringify(mailInfo)
		this.redisDao.db.rpush("player:user:"+uid+":mail",mailInfo)
		if(cb)
			cb(true)
	}
}
//发放奖励,若玩家不在线则发邮件
crossManager.prototype.sendAward = function(crossUid,title,text,str,reason,cb) {
	if(this.players[crossUid]){
		this.addItemStr(crossUid,str,1,reason,cb)
	}else{
		this.sendMail(crossUid,title,text,str,cb)
	}
}
//宝箱奖励
crossManager.prototype.openChestStr = function(crossUid,chestId,rate,cb) {
	if(!this.players[crossUid]){
		cb(false)
		return
	}
	var areaId = this.players[crossUid]["areaId"]
	var serverId = this.players[crossUid]["serverId"]
	var uid = this.players[crossUid]["uid"]
	this.app.rpc.area.areaRemote.openChestStr.toServer(serverId,uid,areaId,chestId,rate,cb)
}
//获取玩家基本数据
crossManager.prototype.getPlayerInfoByUid = function(uid,cb) {
	this.redisDao.db.hmget("player:user:"+uid+":playerInfo",["name","head","figure"],function(err,data) {
		let info = {
			uid :uid,
			name : data[0],
			head : data[1],
			figure : data[2]
		}
		cb(info)
	})
}
//批量获取玩家基本数据
crossManager.prototype.getPlayerInfoByUids = function(areaIds,uids,cb) {
	var multiList = []
	for(var i = 0;i < uids.length;i++){
		multiList.push(["hmget","player:user:"+uids[i]+":playerInfo",["name","head","figure"]])
	}
	var self = this
	self.redisDao.multi(multiList,function(err,list) {
		var userInfos = []
		for(var i = 0;i < uids.length;i++){
			let info = {}
			if(uids[i] < 10000){
				info = {
					uid : uids[i],
					name : self.namespace.getName(),
					head : "",
					figure : ""
				}
			}else{
				info = {
					uid : uids[i],
					name : list[i][0],
					head : list[i][1],
					figure : list[i][2]
				}
				if(areaIds)
					info.areaId = areaIds[i]
			}
			userInfos.push(info)
		}
		cb(userInfos)
	})
}
crossManager.prototype.standardTeam = function(list,dl,lv) {
	team = list.concat()
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
crossManager.prototype.taskUpdate  = function(crossUid,type,value,arg) {
	if(!this.players[crossUid]){
		cb(false)
		return
	}
	var areaId = this.players[crossUid]["areaId"]
	var serverId = this.players[crossUid]["serverId"]
	var uid = this.players[crossUid]["uid"]
	this.app.rpc.area.areaRemote.taskUpdate.toServer(serverId,areaId,uid,type,value,arg,function(){})
}
//发放公会邮件
crossManager.prototype.sendMailByGuildId  = function(guildId,key,atts) {
	var self = this
	self.redisDao.db.hgetall("guild:contributions:"+guildId,function(err,data) {
		if(!data)
			data = {}
		for(uid in data){
			self.sendTextToMailById(uid,key,atts)
		}
	})
}
//重新分配战区
crossManager.prototype.theatreDeploy = function() {
	this.theatreDeploy()
}
module.exports = {
	id : "crossManager",
	func : crossManager,
	scope : "prototype",
	init : "init",
	args : [{
		name : "app",
		type : "Object"
	}],
	props : [{
		name : "accountDao",
		ref : "accountDao"
	},{
		name : "playerDao",
		ref : "playerDao"
	},{
		name : "heroDao",
		ref : "heroDao"
	},{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "mysqlDao",
		ref : "mysqlDao"
	},{
		name : "namespace",
		ref : "namespace"
	}]
}