var boyCfg = require("../../config/sysCfg/boy.json")
var girlCfg = require("../../config/sysCfg/girl.json")
var areaDao = function() {}
//创建新服务器
areaDao.prototype.createArea = function(cb) {
	console.log("开启新服务器")
	var areaInfo = {}
	var self = this
	self.redisDao.db.incrby("area:lastid",1,function(err,data) {
		if(!err && data){
			areaInfo.areaId = data
			areaInfo.lastRank = 4001
			self.redisDao.db.hmset("area:area"+areaInfo.areaId+":areaInfo",areaInfo)
			self.redisDao.db.rpush("area:list",areaInfo.areaId)
			//初始机器人
			var robots = {}
			for(var i = 1;i <= 4001;i++){
				var info = {
					"uid" : i
				}
				if(Math.random() > 0.5){
					info["name"] = boyCfg[Math.floor(Math.random() * boyCfg.length)]
				}else{
					info["name"] = girlCfg[Math.floor(Math.random() * girlCfg.length)]
				}
				robots[i] = JSON.stringify(info)
			}
			self.redisDao.db.hmset("area:area"+areaInfo.areaId+":robots",robots,function(err) {
				console.log("机器人数据初始化完成")
				if(err){
					console.error(err)
				}
				cb(areaInfo.areaId)
			})
		}else{
			cb(false)
		}
	})
}
//删除服务器
areaDao.prototype.destoryArea = function(areaId) {
	console.log("关闭服务器",areaId)
	this.redisDao.db.del("area:area"+areaId+":areaInfo")
	this.redisDao.db.lrem("area:list",0,areaId)
	this.redisDao.db.del("area:area"+areaId+":robots")
	this.redisDao.db.del("area:area"+areaId+":arena")
	this.redisDao.db.hdel("area:serverMap",areaId)
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
	this.redisDao.db.lrange("area:list",0,-1,function(err,data) {
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
	this.redisDao.db.hset("area:finalServerMap",areaId,areaId)
}

module.exports = {
	id : "areaDao",
	func : areaDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}