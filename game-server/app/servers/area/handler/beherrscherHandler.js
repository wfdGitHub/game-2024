//无双争霸玩法
var bearcat = require("bearcat")
var beherrscherHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取数据
beherrscherHandler.prototype.getBeherrscherInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getBeherrscherInfo(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//挑战
beherrscherHandler.prototype.challengeBeherrscher = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].challengeBeherrscher(uid,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取挑战记录
beherrscherHandler.prototype.getBeherrscherRecord = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].getBeherrscherRecord(index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//清除CD
beherrscherHandler.prototype.clearBeherrscherCD = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].clearBeherrscherCD(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "beherrscherHandler",
  	func : beherrscherHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};