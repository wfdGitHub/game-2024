//跨服押镖
var bearcat = require("bearcat")
var escortHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//获取我的押镖信息
escortHandler.prototype.getEscortInfo = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getEscortInfo(crossUid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取镖车列表
escortHandler.prototype.getEscortList = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getEscortList(crossUid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//镖车刷新
escortHandler.prototype.updateEscortCar = function(msg, session, next) {
	var crossUid = session.get("crossUid")
	this.crossManager.updateEscortCar(crossUid,function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//开始押镖
escortHandler.prototype.beginEscort = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.beginEscort(crossUid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//劫镖
escortHandler.prototype.robEscort = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var target = msg.target
  this.crossManager.robEscort(crossUid,target,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
// //订阅镖车信息
// escortHandler.prototype.subscribeCarMessage = function(msg, session, next) {
//   var crossUid = session.get("crossUid")
//   this.crossManager.subscribeCarMessage(crossUid,function(flag,data) {
//     next(null,{flag : flag,data : data})
//   })
// }
// //取消订阅
// escortHandler.prototype.unSubscribeCarMessage = function(msg, session, next) {
//   var crossUid = session.get("crossUid")
//   this.crossManager.unSubscribeCarMessage(crossUid,function(flag,data) {
//     next(null,{flag : flag,data : data})
//   })
// }
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