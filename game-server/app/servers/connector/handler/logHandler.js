var bearcat = require("bearcat")
//日志模块
var logHandler = function(app) {
  this.app = app;
};
//接收日志
logHandler.prototype.addLogs = function(msg, session, next) {
  var accId = session.get("accId")
  var uid = session.uid
  var areaId = session.get("areaId")
  var info = {
    accId : accId,
    uid : uid,
    areaId : areaId,
    message : msg.message,
    source : msg.source,
    lineno : msg.lineno,
    colno : msg.colno,
    stack : msg.stack,
    time : (new Date()).toLocaleString()
  }
  this.redisDao.db.rpush("client:logs",JSON.stringify(info))
  next(null)
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "logHandler",
  	func : logHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "redisDao",
      ref : "redisDao"
    }]
  })
};