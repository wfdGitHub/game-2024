const bearcat = require("bearcat")
module.exports = function() {
  return new Filter();
}
var Filter = function() {
	this.redisDao = bearcat.getBean("redisDao")
}
Filter.prototype.before = function (msg, session, next) {
	if(!session.uid || !session.get("areaId") || !session.get("oriId")){
		next("未登录服务器")
		return
	}
	session.handlerTime = Date.now()
	next();
}
Filter.prototype.after = function (err, msg, session, resp, next) {
	var dt = Date.now() - session.handlerTime
	this.redisDao.db.zincrby("logs:callPort:count",1,msg.__route__)
	this.redisDao.db.zincrby("logs:callPort:dt",dt,msg.__route__)
	if(session.uid){
		this.redisDao.db.zincrby("logs:callUid:count",1,session.uid)
		this.redisDao.db.zincrby("logs:callUid:dt",dt,session.uid)
	}
	next(err);
}