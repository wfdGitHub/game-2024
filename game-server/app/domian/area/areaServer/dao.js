module.exports = function() {
	var self = this
	//获取角色hash自定义数据
	this.getObj = function(uid,objName,key,cb) {
		this.redisDao.db.hget("player:user:"+uid+":"+objName,key,function(err,data) {
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
		this.redisDao.db.hmget("player:user:"+uid+":"+objName,arr,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取hash数据键数量
	this.getObjLen = function(uid,objName,cb) {
		this.redisDao.db.hlen("player:user:"+uid+":"+objName,function(err,data) {
			if(cb){
				cb(data || 0)
			}
		})
	}
	//设置角色hash自定义数据
	this.setObj = function(uid,objName,key,value,cb) {
		this.redisDao.db.hset("player:user:"+uid+":"+objName,key,value,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//批量设置角色hash数据
	this.setHMObj = function(uid,objName,obj,cb) {
		this.redisDao.db.hmset("player:user:"+uid+":"+objName,obj,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//删除角色hash自定义数据
	this.delObj = function(uid,objName,key,cb) {
		this.redisDao.db.hdel("player:user:"+uid+":"+objName,key,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//删除全部数据
	this.delObjAll = function(uid,objName,cb) {
		this.redisDao.db.del("player:user:"+uid+":"+objName,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//角色hash自定义数据自增
	this.incrbyObj = function(uid,objName,key,value,cb) {
		this.redisDao.db.hincrby("player:user:"+uid+":"+objName,key,value,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取角色hash自定义数据整个对象
	this.getObjAll = function(uid,objName,cb) {
		this.redisDao.db.hgetall("player:user:"+uid+":"+objName,function(err,data) {
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
	//删除数据
	this.delPlayerData = function(uid,key,cb) {
		self.delObj(uid,"playerData",key,cb)
	}
	//获取全部用户数据
	this.getPlayerDataAll = function(uid,cb) {
		self.getObjAll(uid,"playerData",cb)
	}
	//设置有序列表数据
	this.addZset = function(zname,key,score,cb) {
		this.redisDao.db.zadd("area:area"+this.areaId+":zset:"+zname,score,key,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//增长有序列表数据
	this.incrbyZset = function(zname,key,score,cb) {
		this.redisDao.db.zincrby("area:area"+this.areaId+":zset:"+zname,score,key,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//删除有序列表
	this.delZset = function(zname,cb) {
		this.redisDao.db.del("area:area"+this.areaId+":zset:"+zname,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取有序列表不带分数
	this.zrange = function(zname,begin,end,cb) {
		this.redisDao.db.zrange("area:area"+this.areaId+":zset:"+zname,begin,end,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取有序列表带分数
	this.zrangewithscore = function(zname,begin,end,cb) {
		this.redisDao.db.zrange("area:area"+this.areaId+":zset:"+zname,begin,end,"WITHSCORES",function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取服务器hash自定义数据
	this.getAreaObj = function(objName,key,cb) {
		this.redisDao.db.hget("area:area"+this.areaId+":"+objName,key,function(err,data) {
			if(err){
				console.log(err)
				cb(false)
			}else{
				cb(data)
			}
		})
	}
	//批量获取服务器hash数据
	this.getAreaHMObj = function(objName,arr,cb) {
		this.redisDao.db.hmget("area:area"+this.areaId+":"+objName,arr,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//设置服务器hash自定义数据
	this.setAreaObj = function(objName,key,value,cb) {
		this.redisDao.db.hset("area:area"+this.areaId+":"+objName,key,value,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//批量设置服务器hash数据
	this.setAreaHMObj = function(objName,obj,cb) {
		this.redisDao.db.hmset("area:area"+this.areaId+":"+objName,obj,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//删除服务器hash自定义数据
	this.delAreaObj = function(objName,key,cb) {
		this.redisDao.db.hdel("area:area"+this.areaId+":"+objName,key,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//删除服务器hash字段全部数据
	this.delAreaObjAll = function(objName,cb) {
		this.redisDao.db.del("area:area"+this.areaId+":"+objName,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//服务器hash自定义数据自增
	this.incrbyAreaObj = function(objName,key,value,cb) {
		this.redisDao.db.hincrby("area:area"+this.areaId+":"+objName,key,value,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取服务器hash自定义数据整个对象
	this.getAreaObjAll = function(objName,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":"+objName,function(err,data) {
			if(err){
				console.log(err)
				cb(false)
			}else{
				cb(data)
			}
		})
	}
}
