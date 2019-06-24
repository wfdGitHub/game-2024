var bearcat = require("bearcat")
var fightContorlFun = require("../fight/fightContorl.js")
var areaManager = function() {
	this.name = "areaManager"
	this.areaMap = {}
	this.userMap = {}
	this.connectorMap = {}
	this.fightContorl = fightContorlFun()
}
//初始化
areaManager.prototype.init = function(app) {
	console.log("init")
	this.app = app
	var self = this
	self.areaDao.getAreaServerMap(function(data) {
		console.log("getAreaServerMap",data,self.app.serverId)
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
areaManager.prototype.closeArea = function() {

}
//玩家登录游戏服
areaManager.prototype.userLogin = function(uid,areaId,cid,cb) {
	var self = this
	if(!self.areaMap[areaId]){
		console.log(self.areaMap,areaId)
		cb(false)
		return
	}
	self.areaMap[areaId].userLogin(uid,cid,function(playerInfo) {
		if(playerInfo){
			self.connectorMap[uid] = cid
			self.userMap[uid] = areaId
		}
		cb(playerInfo)
	})
}
//玩家离开
areaManager.prototype.userLeave = function(uid) {
	var areaId = this.userMap[uid]
	delete this.userMap[uid]
	delete this.connectorMap[uid]
	if(areaId && this.areaMap[areaId]){
		this.areaMap[areaId].userLeave(uid)
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