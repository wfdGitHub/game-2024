var bearcat = require("bearcat")
var fbHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//开启副本
fbHandler.prototype.openFB = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].openFB(uid,type,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//挑战副本BOSS
fbHandler.prototype.challengeFBBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].challengeFBBoss(uid,msg.type,msg.verify,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取副本信息
fbHandler.prototype.getFBInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getFBInfo(uid,function(msg) {
    next(null,{flag : true,msg : msg})
  })
}
//获取日常副本数据
fbHandler.prototype.getDailyfbInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getDailyfbInfo(uid,function(msg) {
    next(null,{flag : true,msg : msg})
  })
}
//挑战日常副本
fbHandler.prototype.challengeDailyfb = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var fbId = msg.fbId
  var verify = msg.verify
  this.areaManager.areaMap[areaId].challengeDailyfb(uid,fbId,verify,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "fbHandler",
  	func : fbHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};