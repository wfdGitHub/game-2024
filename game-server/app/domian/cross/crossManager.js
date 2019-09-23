//跨服服务器
var crossServers = ["escort"]
var crossManager = function(app) {
	this.app = app
	this.channelService = this.app.get("channelService")
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
		areaId : areaId,
		serverId : serverId,
		cid : cid,
		playerInfo : playerInfo
	}
	if(!this.players[uid])
		this.onlineNum++
	this.players[uid] = userInfo
	cb(true)
}
//玩家离线
crossManager.prototype.userLeave = function(uid) {
	if(this.players[uid]){
		delete this.players[uid]
		this.onlineNum--
	}
}
//获取玩家简易信息
crossManager.prototype.getSimpleUser = function(uid) {
	if(!this.players[uid]){
		return false
	}
	var info = {
		name : this.players[uid]["playerInfo"]["name"],
		sex : this.players[uid]["playerInfo"]["sex"],
		areaId : this.players[uid]["playerInfo"]["areaId"]
	}
	return info
}
//获取玩家战斗阵容
crossManager.prototype.userTeam = function(uid) {
	if(!this.players[uid]){
		return false
	}
	var team = []
	for(var i in this.players[uid]["playerInfo"].characters){
		team.push(this.players[uid]["playerInfo"].characters[i])
	}
	var fightPet = this.players[uid]["playerInfo"].fightPet
	if(fightPet && this.players[uid]["playerInfo"].pets && this.players[uid]["playerInfo"].pets[fightPet]){
		team = team.concat(this.players[uid]["playerInfo"].pets[fightPet])
	}
	return team
}
//发送消息给玩家
crossManager.prototype.sendToUser = function(uid,notify) {
	if(this.players[uid]){
		this.channelService.pushMessageByUids('onMessage', notify, [{
	      uid: uid,
	      sid: this.players[uid]["cid"]
	    }])
	}
}
//消耗道具
crossManager.prototype.consumeItems = function(uid,str,rate,cb) {
	if(!this.players[uid]){
		cb(false)
		return
	}
	var areaId = this.players[uid]["areaId"]
	var serverId = this.players[uid]["serverId"]
	this.app.rpc.area.areaRemote.consumeItems.toServer(serverId,uid,areaId,str,rate,cb)
}
//物品奖励
crossManager.prototype.addItemStr = function(uid,str,rate,cb) {
	if(!this.players[uid]){
		cb(false)
		return
	}
	var areaId = this.players[uid]["areaId"]
	var serverId = this.players[uid]["serverId"]
	this.app.rpc.area.areaRemote.addItemStr.toServer(serverId,uid,areaId,str,rate,cb)
}
//宝箱奖励
crossManager.prototype.openChestAward = function(uid,chestId,rate,cb) {
	if(!this.players[uid]){
		cb(false)
		return
	}
	var areaId = this.players[uid]["areaId"]
	var serverId = this.players[uid]["serverId"]
	this.app.rpc.area.areaRemote.openChestAward.toServer(serverId,uid,areaId,chestId,rate,cb)
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