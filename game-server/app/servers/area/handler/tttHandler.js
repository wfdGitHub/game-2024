var bearcat = require("bearcat")
var tttHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获取通天塔数据
tttHandler.prototype.getTTTInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getTTTInfo(uid,function(msg) {
    next(null,{flag : true,msg : msg})
  })
}
//挑战BOSS
tttHandler.prototype.challengeTTTBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].challengeTTTBoss(uid,msg,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//扫荡到最高等级
tttHandler.prototype.TTTmopup = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].TTTmopup(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取前期奖励
tttHandler.prototype.getTTTAwards = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getTTTAwards(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "tttHandler",
  	func : tttHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};