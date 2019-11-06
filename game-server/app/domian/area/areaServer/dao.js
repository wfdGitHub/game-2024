module.exports = function() {
	var self = this
	//获取角色hash自定义数据
	this.getObj = function(uid,objName,key,cb) {
		this.redisDao.db.hget("area:area"+this.areaId+":player:"+uid+":"+objName,key,function(err,data) {
			if(err){
				console.log(err)
				cb(false)
			}else{
				cb(data)
			}
		})
	}
	//批量获取角色hash数据
	this.getHMObj = function(uid,objName,arr,cb) {
		this.redisDao.db.hmget("area:area"+this.areaId+":player:"+uid+":"+objName,arr,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//批量设置角色hash数据
	this.setHMObj = function(uid,objName,obj,cb) {
		this.redisDao.db.hmset("area:area"+this.areaId+":player:"+uid+":"+objName,obj,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//设置角色hash自定义数据
	this.setObj = function(uid,objName,key,value,cb) {
		this.redisDao.db.hset("area:area"+this.areaId+":player:"+uid+":"+objName,key,value,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//批量设置角色hash自定义数据
	this.setHMObj = function(uid,objName,obj,cb) {
		this.redisDao.db.hmset("area:area"+this.areaId+":player:"+uid+":"+objName,obj,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//删除角色hash自定义数据
	this.delObj = function(uid,objName,key,cb) {
		this.redisDao.db.hdel("area:area"+this.areaId+":player:"+uid+":"+objName,key,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//角色hash自定义数据自增
	this.incrbyObj = function(uid,objName,key,value,cb) {
		this.redisDao.db.hincrby("area:area"+this.areaId+":player:"+uid+":"+objName,key,value,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取角色hash自定义数据整个对象
	this.getObjAll = function(uid,objName,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":"+objName,function(err,data) {
			if(err){
				console.log(err)
				cb(false)
			}else{
				cb(data)
			}
		})
	}
	//新增数据
	this.setPlayerData = function(uid,key,value,cb) {
		self.setObj(uid,"playerData",key,value,cb)
	}
	//增减数据
	this.incrbyPlayerData = function(uid,key,value,cb) {
		self.incrbyObj(uid,"playerData",key,value,cb)
	}
	//获取数据
	this.getPlayerData = function(uid,key,cb) {
		self.getObj(uid,"playerData",key,cb)
	}
	//获取全部用户数据
	this.getPlayerDataAll = function(uid,cb) {
		self.getObjAll(uid,"playerData",cb)
	}
}
