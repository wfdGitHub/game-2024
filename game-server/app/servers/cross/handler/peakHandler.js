var bearcat = require("bearcat")
//跨服巅峰赛
var peakHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//开始新赛程
// peakHandler.prototype.peakBegin = function(msg, session, next) {
//   this.crossManager.peakBegin()
//   next(null)
// }
// //下一阶段
// peakHandler.prototype.peakNextState = function(msg, session, next) {
//   this.crossManager.peakNextState()
//   next(null)
// }
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
  this.crossManager.getPeakParticipantsInfo(crossUid,function(flag,data) {
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
  this.crossManager.getPeakBetInfo(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//查询历史下注信息
peakHandler.prototype.getPeakBetHistory = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getPeakBetHistory(crossUid,function(flag,data) {
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
//获取我的比赛记录
peakHandler.prototype.getPeakMyMatch = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getPeakMyMatch(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取本赛季八强记录
peakHandler.prototype.getPeakBetterHistory = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getPeakBetterHistory(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//点赞
peakHandler.prototype.peakLike = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var index = msg.index
  this.crossManager.peakLike(crossUid,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取上一赛季比赛记录
peakHandler.prototype.getHonorMathch = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getHonorMathch(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//查看历史指定比赛记录
peakHandler.prototype.getPeakHonorHistory = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var round = msg.round
  var target = msg.target
  this.crossManager.getPeakHonorHistory(crossUid,round,target,function(flag,data) {
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