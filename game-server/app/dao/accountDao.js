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
	self.redisDao.db.incrby("acc:lastid",1,function(err,data) {
		if(!err && data){
			userInfo.uid = data
			self.redisDao.db.hmset("acc:user"+userInfo.uid,userInfo)
			//建立映射
			self.redisDao.db.hset("acc:uidMap:unionid",userInfo.unionid,userInfo.uid)
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
	self.redisDao.db.hget("acc:uidMap:unionid",unionid,function(err,data) {
		if(err || !data){
			cb(false)
		}else{
			self.redisDao.db.hgetall("acc:user"+data,function(err,data) {
				if(err || !data){
					cb(false)
				}else{
					cb(true,data)
				}
			})
		}
	})
}
//获取账号属性
accountDao.prototype.getAccountData = function(otps,cb) {
	var uid = otps.uid
	var name = otps.name
	var self = this
	self.redisDao.db.hget("acc:user"+uid,name,function(err,data) {
		if(err || !data){
			cb(false)
		}else{
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