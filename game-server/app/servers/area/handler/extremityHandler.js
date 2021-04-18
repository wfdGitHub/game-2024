var bearcat = require("bearcat")
var extremityHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取极限挑战数据
extremityHandler.prototype.getExtremityData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getExtremityData(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取挑战战斗数据
extremityHandler.prototype.getExtremityFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getExtremityFight(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//挑战BOSS
extremityHandler.prototype.extremityChallenge = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].extremityChallenge(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取排行榜
extremityHandler.prototype.getExtremityRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getExtremityRank(function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "extremityHandler",
  	func : extremityHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : []
  })
};