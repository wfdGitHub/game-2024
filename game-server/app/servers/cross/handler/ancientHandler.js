//远古战场
var bearcat = require("bearcat")
var ancientHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//获取排行榜
ancientHandler.prototype.getAncientRank = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var theatreId = msg.theatreId
  this.crossManager.getAncientRank(theatreId,crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取历史挑战记录
ancientHandler.prototype.getAncientRecord = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getAncientRecord(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取目标列表
ancientHandler.prototype.ancientGetTargetList = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.ancientGetTargetList(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取我的数据
ancientHandler.prototype.getAncientData = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getAncientData(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//领取宝箱
ancientHandler.prototype.gainAncientBox = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var index = msg.index
  this.crossManager.gainAncientBox(crossUid,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置阵容
ancientHandler.prototype.ancientSetFightTeams = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var hIds = msg.hIds
  this.crossManager.ancientSetFightTeams(crossUid,hIds,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//开始挑战
ancientHandler.prototype.ancientChallenge = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var targetUid = msg.targetUid
  var targetInfo = msg.targetInfo
  if(!targetUid || !targetInfo){
  	next(null,{flag:false,data:"参数错误"})
  	return
  }
  if(crossUid == targetUid){
  	next(null,{flag:false,data:"不能挑战自己"})
  	return
  }
  this.crossManager.ancientChallenge(crossUid,targetUid,targetInfo,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "ancientHandler",
  	func : ancientHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};