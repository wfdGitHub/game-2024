var bearcat = require("bearcat")

var arenaHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取排行榜
arenaHandler.prototype.getRankList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getRankList(function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取目标列表
arenaHandler.prototype.getTargetList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getTargetList(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取我的竞技场数据
arenaHandler.prototype.getMyArenaInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getMyArenaInfo(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//挑战目标
arenaHandler.prototype.challengeArena = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var targetStr = msg.targetStr
  var targetRank = msg.targetRank
  this.areaManager.areaMap[areaId].challengeArena(uid,targetStr,targetRank,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "arenaHandler",
  	func : arenaHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};