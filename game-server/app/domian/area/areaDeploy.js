//服务器调配器,开服管理器
var areaDeploy = function() {
	this.name = "areaDeploy"
	this.areaList = []
	this.serverMap = {}
}
//初始化
areaDeploy.prototype.init = function(app) {
	this.app = app
	var self = this
	self.areaDao.getAreaList(function(data) {
		if(data){
			for(var i = 0;i < data.length;i++){
				self.areaList.push(Number(data[i]))
			}
		}
	})
	self.areaDao.getAreaServerMap(function(data) {
		if(data){
			self.serverMap = data
		}
	})
}
//开启游戏新服务器
areaDeploy.prototype.openArea = function(otps) {
	var self = this
	self.areaDao.createArea(otps,function(areaInfo) {
		if(areaInfo){
			var serverId = self.deploy(areaInfo)
			//通知所有的connector，更新服务器配置
			self.app.rpc.connector.connectorRemote.updateArea.toServer("*",areaInfo.areaId,serverId,null)
			//通知area服务器加载
			self.app.rpc.area.areaRemote.loadArea.toServer(serverId,areaInfo.areaId,null)
		}
	})
}
//暂停游戏服务器
areaDeploy.prototype.pauseArea = function(areaId,cb) {
	if(!this.serverMap[areaId]){
		cb(false,"服务器不存在")
		return
	}
	//通知所有的connector，更新服务器配置
	this.app.rpc.connector.connectorRemote.removeArea.toServer("*",areaId,null)
	//通知area服务器加载
	this.app.rpc.area.areaRemote.removeArea.toServer(this.serverMap[areaId],areaId,null)
	this.removeArea(areaId)
	if(cb)
		cb(true)
}
//恢复游戏服务器
areaDeploy.prototype.resumeArea = function(areaId,cb) {
	if(this.serverMap[areaId]){
		cb(false,"服务器已存在")
		return
	}
	var self = this
	self.redisDao.db.hget("area:serverMap",areaId,function(err,serverId) {
		if(serverId){
			//通知所有的connector，更新服务器配置
			self.app.rpc.connector.connectorRemote.updateArea.toServer("*",areaId,serverId,null)
			//通知area服务器加载
			self.app.rpc.area.areaRemote.loadArea.toServer(serverId,areaId,null)
			self.updateArea(areaId,serverId)
			cb(true)
		}else{
			cb(false)
		}
	})
}

//获取游戏服对应服务器映射表
areaDeploy.prototype.getServerMap = function() {
	return this.serverMap
}
//获取游戏服对应服务器
areaDeploy.prototype.getServer = function(areaId) {
	return this.serverMap[areaId]
}
//获取游戏服列表
areaDeploy.prototype.getServerList = function() {
	return this.areaList.concat()
}
//为新建的游戏服分配服务器
areaDeploy.prototype.deploy = function(areaInfo) {
	var areaServers = this.app.getServersByType('area');
	if(!areaServers){
		return false
	}
	var areaServersMap = {}
	for(var i = 0;i < areaServers.length;i++){
		areaServersMap[areaServers[i].id] = 0
	}
	for(var areaId in this.serverMap){
		areaServersMap[this.serverMap[areaId]]++
	}
	// console.log("areaServersMap",areaServersMap)
	var serverId = false
	for(var i in areaServersMap){
		if(serverId === false || areaServersMap[serverId] > areaServersMap[i]){
			serverId = i
		}
	}
	// console.log("serverId ",serverId)
	if(serverId === false)
		return false
	this.areaDao.setAreaServer(areaInfo.areaId,serverId)
	this.updateArea(areaInfo.areaId,serverId)
	return serverId
}
//同步更新游戏服务器
areaDeploy.prototype.updateArea = function(areaId,serverId) {
	areaId = Number(areaId)
	this.serverMap[areaId] = serverId
	this.areaList.push(areaId)
}
//关闭游戏服务器
areaDeploy.prototype.removeArea = function(areaId) {
	areaId = Number(areaId)
	console.log("removeArea",areaId)
	delete this.serverMap[areaId]
	this.areaList.remove(areaId)
	console.log(this.serverMap,this.areaList)
}
module.exports = {
	id : "areaDeploy",
	func : areaDeploy,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "areaDao",
		ref : "areaDao"
	}]
}