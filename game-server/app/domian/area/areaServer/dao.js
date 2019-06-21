module.exports = function() {
	//获取角色哈希数据
	this.getObj = function(uid,key,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":"+key,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//设置角色哈希数据
	this.setObj = function(uid,key,obj,cb) {
		this.redisDao.db.hmset("area:area"+this.areaId+":player:"+uid+":"+key,obj,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//哈希数据自增
	this.objinc = function(uid,key,name,cb) {
		this.redisDao.db.hincrby("area:area"+this.areaId+":player:"+uid+":"+key,name,1,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取角色字符串数据
	this.getString = function(uid,key,cb) {
		this.redisDao.db.get("area:area"+this.areaId+":player:"+uid+":"+key,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//设置角色字符串数据
	this.setString = function(uid,key,value,cb) {
		this.redisDao.db.set("area:area"+this.areaId+":player:"+uid+":"+key,value,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//字符串数据自增
	this.stringinc = function(uid,key,cb) {
		this.redisDao.db.incrby("area:area"+this.areaId+":player:"+uid+":"+key,1,function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//新增数据
	this.addPlayerData = function(uid,name,value,cb) {
		this.redisDao.db.hset("area:area"+this.areaId+":player:"+uid+":playerData",name,value,function(err,data) {
			if(err){
				console.log(err)
				if(cb)
					cb(false)
			}else{
				if(cb)
					cb(data)
			}
		})
	}
	//增减数据
	this.incrbyPlayerData = function(uid,name,value,cb) {
		this.redisDao.db.hincrby("area:area"+this.areaId+":player:"+uid+":playerData",name,value,function(err,data) {
			if(err){
				console.log(err)
				if(cb)
					cb(false)
			}else{
				if(cb)
					cb(data)
			}
		})
	}
	//获取数据
	this.getPlayerData = function(uid,name,cb) {
		this.redisDao.db.hget("area:area"+this.areaId+":player:"+uid+":playerData",name,function(err,data) {
			if(err){
				console.log(err)
				cb(false)
			}else{
				cb(data)
			}
		})
	}
	//获取全部用户数据
	this.getPlayerDataAll = function(uid,name,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":playerData",function(err,data) {
			if(err){
				console.log(err)
				cb(false)
			}else{
				cb(data)
			}
		})
	}
}
