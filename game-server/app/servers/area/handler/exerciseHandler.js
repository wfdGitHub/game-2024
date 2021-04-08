var bearcat = require("bearcat")
var exerciseHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取演武数据
exerciseHandler.prototype.getExerciseData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getExerciseData(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//选择难度
exerciseHandler.prototype.exerciseChooseLevel = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var level = msg.level
  this.areaManager.areaMap[areaId].exerciseChooseLevel(uid,level,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//开始挑战
exerciseHandler.prototype.exerciseChallenge = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var team = msg.team
  var index = msg.index
  this.areaManager.areaMap[areaId].exerciseChallenge(uid,team,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//领取宝箱
exerciseHandler.prototype.exerciseAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].exerciseAward(uid,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//复活
exerciseHandler.prototype.exerciseResurgence = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].exerciseResurgence(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "exerciseHandler",
  	func : exerciseHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : []
  })
};