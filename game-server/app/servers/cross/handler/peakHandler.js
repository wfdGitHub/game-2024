var bearcat = require("bearcat")
//跨服巅峰赛
var peakHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//开始新赛程
peakHandler.prototype.peakBegin = function(msg, session, next) {
  this.crossManager.peakBegin()
  next(null)
}
//下一阶段
peakHandler.prototype.peakNextState = function(msg, session, next) {
  this.crossManager.peakNextState()
  next(null)
}
//获取巅峰赛数据
peakHandler.prototype.getPeakData = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getPeakData(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//同步阵容
peakHandler.prototype.peakSyncFightTeam = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var uid = session.uid
  this.crossManager.peakSyncFightTeam(crossUid,uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取对阵选手信息
peakHandler.prototype.getPeakParticipantsInfo = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var uid = session.uid
  this.crossManager.getPeakParticipantsInfo(crossUid,uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//下注
peakHandler.prototype.peakUserBetting = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var target = msg.target
  var bet = msg.bet
  this.crossManager.peakUserBetting(crossUid,target,bet,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取当前下注信息
peakHandler.prototype.getPeakBetInfo = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getPeakBetInfo(crossUid,target,bet,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//查询历史下注信息
peakHandler.prototype.getPeakBetHistory = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getPeakBetHistory(crossUid,target,bet,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//查看指定比赛记录
peakHandler.prototype.getPeakMatchHistory = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var round = msg.round
  var target = msg.target
  this.crossManager.getPeakMatchHistory(crossUid,round,target,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "peakHandler",
  	func : peakHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};