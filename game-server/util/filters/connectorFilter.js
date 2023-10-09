const bearcat = require("bearcat")
module.exports = function() {
  return new Filter();
}
var Filter = function() {
	this.redisDao = bearcat.getBean("redisDao")
}
Filter.prototype.before = function (msg, session, next) {
	session.handlerTime = Date.now()
	next();
}
Filter.prototype.after = function (err, msg, session, resp, next) {
	var dt = (Date.now() - session.handlerTime) || 0
	this.redisDao.db.hincrby("logs:callPort:count",msg.__route__,1)
	this.redisDao.db.hincrby("logs:callPort:dt",msg.__route__,dt)
	if(session.uid){
		this.redisDao.db.hincrby("logs:callUid:count",session.uid,1)
		this.redisDao.db.hincrby("logs:callUid:dt",session.uid,dt)
	}
	next(err);
}