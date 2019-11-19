var accountDao = function() {}
//创建新账号
accountDao.prototype.createAccount = function(otps,cb) {
	if(!otps.unionid){
		cb(false,"unionid error "+otps.unionid)
		return
	}
	var userInfo = {
		unionid : otps.unionid,
		head : otps.head || 0,
		nickname : otps.nickname || 0
	}
	var self = this
	self.redisDao.db.incrby("acc:lastid",1,function(err,accId) {
		if(!err && accId){
			userInfo.accId = accId
			self.redisDao.db.hmset("acc:user:"+userInfo.accId+":base",userInfo)
			//建立映射
			self.redisDao.db.hset("acc:accMap:unionid",userInfo.unionid,userInfo.accId)
			cb(true,userInfo)
		}else{
			cb(false,"createAccount error")
		}
	})
}
//获取账号信息
accountDao.prototype.getAccountInfo = function(otps,cb) {
	var unionid = otps.unionid
	var self = this
	self.redisDao.db.hget("acc:accMap:unionid",unionid,function(err,accId) {
		if(err || !accId){
			cb(false)
		}else{
			self.redisDao.db.hgetall("acc:user:"+accId+":base",function(err,userInfo) {
				if(err || !userInfo){
					cb(false)
				}else{
					cb(true,userInfo)
				}
			})
		}
	})
}
//获取账号属性
accountDao.prototype.getAccountData = function(otps,cb) {
	var accId = otps.accId
	var name = otps.name
	this.redisDao.db.hget("acc:user:"+accId+":base",name,function(err,data) {
		if(err || !data){
			cb(false)
		}else{
			cb(true,data)
		}
	})
}
//设置账号属性
accountDao.prototype.setAccountData = function(otps,cb) {
	var accId = otps.accId
	var name = otps.name
	var value = otps.value
	this.redisDao.db.hset("acc:user:"+accId+":base",name,value,function(err,data) {
		if(err || !data){
			if(cb)
				cb(false)
		}else{
			if(cb)
				cb(true,data)
		}
	})
}
module.exports = {
	id : "accountDao",
	func : accountDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}