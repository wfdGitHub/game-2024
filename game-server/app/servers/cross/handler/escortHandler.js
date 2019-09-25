//跨服押镖
var bearcat = require("bearcat")
var escortHandler = function(app) {
  	this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//获取我的押镖信息
escortHandler.prototype.getEscortInfo = function(msg, session, next) {
  var uid = session.uid
  this.crossManager.getEscortInfo(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取镖车列表

//镖车刷新
escortHandler.prototype.updateEscortCar = function(msg, session, next) {
	var uid = session.uid
	this.crossManager.updateEscortCar(uid,function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//开始押镖
escortHandler.prototype.beginEscort = function(msg, session, next) {
  var uid = session.uid
  this.crossManager.beginEscort(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//劫镖
escortHandler.prototype.robEscort = function(msg, session, next) {
  var uid = session.uid
  var target = msg.target
  this.crossManager.robEscort(uid,target,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//订阅镖车信息
escortHandler.prototype.subscribeCarMessage = function(msg, session, next) {
  var uid = session.uid
  this.crossManager.subscribeCarMessage(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//取消订阅
escortHandler.prototype.unSubscribeCarMessage = function(msg, session, next) {
  var uid = session.uid
  this.crossManager.unSubscribeCarMessage(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "escortHandler",
  	func : escortHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};