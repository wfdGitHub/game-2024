//服务器调配器,开服管理器
var areaDeploy = function() {
	this.name = "areaDeploy"
	this.areaList = []
	this.serverMap = {}
	this.finalServerMap = {}
}
var rankTypes = ["ce_rank","checkpoint_rank","lv_rank","seas_rank","ttt_rank","ttt_realm1","ttt_realm2","ttt_realm3","ttt_realm4","trial_rank"]
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
	self.redisDao.db.hgetall("area:serverMap",function(err,data) {
		if(data)
			self.serverMap = data
	})
	self.redisDao.db.hgetall("area:finalServerMap",function(err,data) {
		if(data)
			self.finalServerMap = data
	})
}
//开启游戏新服务器
areaDeploy.prototype.openArea = function(cb) {
	var self = this
	self.areaDao.createArea(function(areaId) {
		if(areaId){
			var serverId = self.deploy(areaId)
			//通知所有的connector，更新服务器配置
			self.app.rpc.connector.connectorRemote.updateArea.toServer("*",areaId,serverId,null)
			//通知area服务器加载
			self.app.rpc.area.areaRemote.loadArea.toServer(serverId,areaId,null)
			if(cb)
				cb(areaId)
		}
	})
}
//合服
areaDeploy.prototype.mergeArea = function(areaList) {
	console.log("areaList",areaList)
	var self = this
	self.openArea(function(areaId) {
		if(areaId){
			self.redisDao.db.hset("area:area"+areaId+":areaInfo","oldArea",1)
			for(let i = 0;i < areaList.length;i++){
				self.areaDao.destoryArea(areaList[i])
				self.pauseArea(areaList[i])
				for(let j in self.finalServerMap){
					if(self.finalServerMap[j] == areaList[i]){
						self.redisDao.db.hset("area:finalServerMap",j,areaId)
						self.mergeAreaName(j,areaId)
					}
				}
				self.changeFinalServerMap(areaList[i],areaId)
				self.app.rpc.connector.connectorRemote.changeFinalServerMap.toServer("*",areaList[i],areaId,null)
				self.mergeRank(areaList[i],areaId)
			}
		}
	})
}
//排行榜合并
areaDeploy.prototype.mergeRank = function(oriId,areaId) {
	var self = this
	for(let i = 0;i < rankTypes.length;i++){
		self.redisDao.db.zrange("area:area"+oriId+":zset:"+rankTypes[i],0,-1,"WITHSCORES",function(err,data) {
			if(data){
				for(var j = 0;j < data.length;j+=2){
					self.redisDao.db.zadd("area:area"+areaId+":zset:"+rankTypes[i],data[j+1],data[j],function(err){})
				}
			}
		})
	}
}
//合并名称
areaDeploy.prototype.mergeAreaName = function(oriId,areaId) {
	var self = this
	self.redisDao.db.hgetall("game:nameMap",function(err,data) {
		if(data){
			for(var i in data){
				var uid = data[i]
				self.redisDao.db.hset("player:user:"+uid+":bag",1000500,1)
			}
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
areaDeploy.prototype.deploy = function(areaId) {
	var areaServers = this.app.getServersByType('area');
	if(!areaServers){
		return false
	}
	var areaServersMap = {}
	for(var i = 0;i < areaServers.length;i++){
		areaServersMap[areaServers[i].id] = 0
	}
	for(var i in this.serverMap){
		areaServersMap[this.serverMap[i]]++
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
	this.areaDao.setAreaServer(areaId,serverId)
	this.updateArea(areaId,serverId)
	return serverId
}
//同步更新游戏服务器
areaDeploy.prototype.updateArea = function(areaId,serverId) {
	areaId = Number(areaId)
	this.serverMap[areaId] = serverId
	this.finalServerMap[areaId] = areaId
	this.areaList.push(areaId)
}
//关闭游戏服务器
areaDeploy.prototype.removeArea = function(areaId) {
	areaId = Number(areaId)
	// console.log("removeArea",areaId)
	delete this.serverMap[areaId]
	this.areaList.remove(areaId)
	// console.log(this.serverMap,this.areaList)
}
//改变最终服务器指向
areaDeploy.prototype.changeFinalServerMap = function(areaId,finalId) {
	for(var i in this.finalServerMap){
		if(this.finalServerMap[i] == areaId){
			this.finalServerMap[i] = finalId
		}
	}
}
//获取最终服务器
areaDeploy.prototype.getFinalServer = function(areaId) {
	return this.finalServerMap[areaId]
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