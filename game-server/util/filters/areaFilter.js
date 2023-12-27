const bearcat = require("bearcat")
module.exports = function() {
  return new Filter();
}
var Filter = function() {
	this.redisDao = bearcat.getBean("redisDao")
}
Filter.prototype.before = function (msg, session, next) {
	this.redisDao.db.hincrby("logs:callPort:count",msg.__route__,1)
	session.handlerTime = Date.now()
	if(!session.uid || !session.get("areaId") || !session.get("oriId")){
		next("未登录服务器")
		return
	}
	this.redisDao.db.hincrby("logs:callUid:count",session.uid,1)
	next();
}
Filter.prototype.after = function (err, msg, session, resp, next) {
	next(err);
}