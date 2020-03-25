var bearcat = require("bearcat")
//日志模块
var gradingHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//匹配战斗
gradingHandler.prototype.matchGrading = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.matchGrading(crossUid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取跨服段位赛数据
gradingHandler.prototype.getGradingData = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getGradingData(crossUid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//使用挑战券
gradingHandler.prototype.useGradingItem = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.useGradingItem(crossUid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//领取段位奖励
gradingHandler.prototype.gainGradingAward = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var glv = msg.glv
  this.crossManager.gainGradingAward(crossUid,glv,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "gradingHandler",
  	func : gradingHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};