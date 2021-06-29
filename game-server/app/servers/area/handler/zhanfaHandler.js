var bearcat = require("bearcat")
var zhanfaHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//战法列表
zhanfaHandler.prototype.getZhanfaList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getZhanfaList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获得随机战法
zhanfaHandler.prototype.gainRandZhanfa = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainRandZhanfa(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获得指定战法
zhanfaHandler.prototype.gainSpecialZhanfa = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var zId = msg.zId
  this.areaManager.areaMap[areaId].gainSpecialZhanfa(uid,zId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//穿戴战法
zhanfaHandler.prototype.wearZhanfa = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var zId = msg.zId
  var hId = msg.hId
  var index = msg.index
  this.areaManager.areaMap[areaId].wearZhanfa(uid,hId,index,zId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下战法
zhanfaHandler.prototype.unwearZhanfa = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var index = msg.index
  this.areaManager.areaMap[areaId].unwearZhanfa(uid,hId,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "zhanfaHandler",
  	func : zhanfaHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : []
  })
};