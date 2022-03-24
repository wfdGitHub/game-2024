var bearcat = require("bearcat")
var manorHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取家园数据
manorHandler.prototype.manor_data = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manor_data(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//建设升级建筑
manorHandler.prototype.manor_build = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  var land = msg.land
  this.areaManager.areaMap[areaId].manor_build(uid,bId,land,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//建设升级建筑
manorHandler.prototype.manor_swap = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var land1 = msg.land1
  var land2 = msg.land2
  this.areaManager.areaMap[areaId].manor_swap(uid,land1,land2,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取收益
manorHandler.prototype.manor_reap = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  this.areaManager.areaMap[areaId].manor_reap(uid,bId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "manorHandler",
  	func : manorHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : []
  })
};