var bearcat = require("bearcat")
var fightContorlFun = require("../turn_based_fight/fight/fightContorl.js")
var areaManager = function() {
	this.name = "areaManager"
	this.areaMap = {}
	this.userMap = {}
	this.connectorMap = {}
	this.fightContorl = fightContorlFun
}
//初始化
areaManager.prototype.init = function(app) {
	console.log("init")
	this.app = app
	this.channelService = this.app.get('channelService')
	var self = this
	self.areaDao.getAreaServerMap(function(data) {
		if(data){
			for(var areaId in data){
				if(data[areaId] == self.app.serverId){
					self.loadArea(areaId)
				}
			}
		}
	})
	this.app.event.on("remove_servers", this.removeServers.bind(this));
}
//加载游戏服务器
areaManager.prototype.loadArea = function(areaId) {
	console.log("loadArea ",areaId)
	var self = this
	self.areaDao.getAreaInfo(areaId,function(areaInfo) {
		if(areaInfo){
			self.areaMap[areaId] = bearcat.getBean("area",areaInfo,self.app)
		}
	})
}
//关闭游戏服务器
areaManager.prototype.removeArea = function(areaId) {
	if(this.areaMap[areaId]){
		this.areaMap[areaId].destory()
		delete this.areaMap[areaId]
	}
}
//玩家登录游戏服
areaManager.prototype.userLogin = function(uid,areaId,cid,cb) {
	var self = this
	if(!self.areaMap[areaId]){
		console.log(self.areaMap,areaId)
		cb(false)
		return
	}
	if(this.connectorMap[uid] && this.connectorMap[uid] != cid){
		this.app.rpc.connector.connectorRemote.kickUser.toServer(this.connectorMap[uid],uid,null)
	}
	self.areaMap[areaId].userLogin(uid,cid,function(flag,playerInfo) {
		if(flag){
			self.connectorMap[uid] = cid
			self.userMap[uid] = areaId
		}
		cb(flag,playerInfo)
	})
}
//玩家离开
areaManager.prototype.userLeave = function(uid,cid) {
	if(this.connectorMap[uid] == cid){
		var areaId = this.userMap[uid]
		delete this.userMap[uid]
		delete this.connectorMap[uid]
		if(areaId && this.areaMap[areaId]){
			this.areaMap[areaId].userLeave(uid)
		}
	}
}
//服务器实体机器移除
areaManager.prototype.removeServers = function(ids) {
	console.log("removeServers")
	console.log(ids)
	var self = this
	ids.forEach(function(serverId) {
		for(var uid in self.connectorMap){
			if(self.connectorMap[uid] == serverId){
				self.userLeave(uid)
			}
		}
	})
}
//获取服务器状态
areaManager.prototype.getAreaServerInfos = function() {
	var list = {}
	for(var i in this.areaMap){
		list[i] = this.areaMap[i].getAreaServerInfo()
	}
	return list
}
//发送消息给玩家
areaManager.prototype.sendToUser = function(uid,notify) {
	this.channelService.pushMessageByUids('onMessage', notify, [{
      uid: uid,
      sid: this.connectorMap[uid]
    }])
}
module.exports = {
	id : "areaManager",
	func : areaManager,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "areaDao",
		ref : "areaDao"
	}]
}