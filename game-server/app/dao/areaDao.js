var areaDao = function() {}

//创建新服务器
areaDao.prototype.createArea = function(otps,cb) {
	var areaInfo = {
		areaName : otps.areaName
	}
	var self = this
	self.redisDao.db.incrby("area:lastid",1,function(err,data) {
		if(!err && data){
			areaInfo.areaId = data
			self.redisDao.db.hmset("area:area"+areaInfo.areaId+":areaInfo",areaInfo)
			//保存数组
			self.redisDao.db.rpush("area:list",JSON.stringify(areaInfo))
			cb(areaInfo)
		}else{
			cb(false)
		}
	})
}
//获取服务器最后ID
areaDao.prototype.getAreaLastId = function(cb) {
	this.redisDao.db.get("area:lastid",function(err,data) {
		cb(data)
	})
}
//获取服务器信息
areaDao.prototype.getAreaInfo = function(areaId,cb) {
	this.redisDao.db.hgetall("area:area"+areaId+":areaInfo",function(err,data) {
		cb(data)
	})
}
//获取服务器列表
areaDao.prototype.getAreaList = function(cb) {
	this.redisDao.db.lrange("area:list",-10,-1,function(err,data) {
		cb(data)
	})
}
//获取游戏服映射表
areaDao.prototype.getAreaServerMap = function(cb) {
	this.redisDao.db.hgetall("area:serverMap",function(err,data) {
		cb(data)
	})
}
//设置游戏服对应服务器
areaDao.prototype.setAreaServer = function(areaId,serverId) {
	this.redisDao.db.hset("area:serverMap",areaId,serverId)
}

module.exports = {
	id : "areaDao",
	func : areaDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}