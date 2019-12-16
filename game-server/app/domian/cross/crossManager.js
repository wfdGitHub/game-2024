//跨服服务器
var fightContorlFun = require("../turn_based_fight/fight/fightContorl.js")
var crossServers = ["escort"]
var crossManager = function(app) {
	this.app = app
	this.channelService = this.app.get("channelService")
	this.fightContorl = fightContorlFun()
}
//初始化
crossManager.prototype.init = function() {
	this.onlineNum = 0
	this.players = {}
	for(var i = 0;i < crossServers.length;i++){
		var fun = require("./crossServers/"+crossServers[i]+".js")
		fun.call(this)
	}
	setInterval(this.update.bind(this),1000)
}
crossManager.prototype.update = function() {
	var date = new Date()
	this.escortUpdate(date)
}
//玩家连入跨服服务器
crossManager.prototype.userLogin = function(uid,areaId,serverId,cid,playerInfo,cb) {
	var userInfo = {
		uid : uid,
		areaId : areaId,
		serverId : serverId,
		cid : cid,
		playerInfo : playerInfo
	}
	var crossUid = areaId+"|"+uid+"|"+serverId
	if(!this.players[crossUid])
		this.onlineNum++
	this.players[crossUid] = userInfo
	cb(true)
}
//玩家离线
crossManager.prototype.userLeave = function(crossUid) {
	if(this.players[crossUid]){
		delete this.players[crossUid]
		this.onlineNum--
	}
	this.unSubscribeCarMessage(crossUid)
}
//获取玩家简易信息
crossManager.prototype.getSimpleUser = function(crossUid) {
	if(!this.players[crossUid]){
		return false
	}
	var info = {
		name : this.players[crossUid]["playerInfo"]["name"],
		sex : this.players[crossUid]["playerInfo"]["sex"],
		areaId : this.players[crossUid]["playerInfo"]["areaId"]
	}
	return info
}
//获取玩家战斗阵容
crossManager.prototype.userTeam = function(crossUid) {
	if(!this.players[crossUid]){
		return false
	}
	var team = []
	for(var i in this.players[crossUid]["playerInfo"].characters){
		team.push(this.players[crossUid]["playerInfo"].characters[i])
	}
	var fightPet = this.players[crossUid]["playerInfo"].fightPet
	if(fightPet && this.players[crossUid]["playerInfo"].pets && this.players[crossUid]["playerInfo"].pets[fightPet]){
		team = team.concat(this.players[crossUid]["playerInfo"].pets[fightPet])
	}
	return team
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
crossManager.prototype.consumeItems = function(crossUid,str,rate,cb) {
	if(!this.players[crossUid]){
		cb(false)
		return
	}
	var areaId = this.players[crossUid]["areaId"]
	var serverId = this.players[crossUid]["serverId"]
	var uid = this.players[crossUid]["uid"]
	this.app.rpc.area.areaRemote.consumeItems.toServer(serverId,uid,areaId,str,rate,cb)
}
//物品奖励
crossManager.prototype.addItemStr = function(crossUid,str,rate,cb) {
	if(!this.players[crossUid]){
		cb(false)
		return
	}
	var areaId = this.players[crossUid]["areaId"]
	var serverId = this.players[crossUid]["serverId"]
	var uid = this.players[crossUid]["uid"]
	this.app.rpc.area.areaRemote.addItemStr.toServer(serverId,uid,areaId,str,rate,cb)
}
//发放邮件
crossManager.prototype.sendMail = function(crossUid,title,text,atts,cb) {
	var list = crossUid.split("|")
	var areaId = parseInt(list[0])
	var uid = parseInt(list[1])
	var serverId = list[2]
	this.app.rpc.area.areaRemote.sendMail.toServer(serverId,uid,areaId,title,text,atts,cb)
}
//发放奖励,若玩家不在线则发邮件
crossManager.prototype.sendAward = function(crossUid,title,text,str,cb) {
	if(this.players[crossUid]){
		this.addItemStr(crossUid,str,1,cb)
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
module.exports = {
	id : "crossManager",
	func : crossManager,
	scope : "prototype",
	init : "init",
	args : [{
		name : "app",
		type : "Object"
	}]
}