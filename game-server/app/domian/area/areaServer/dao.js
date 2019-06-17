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
}
