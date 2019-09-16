var bearcat = require("bearcat")
var gemHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取宝石列表
gemHandler.prototype.getGemList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getGemList(uid,function(data) {
    next(null,{flag : true,data : data || {}})
  })
}
//镶嵌宝石
gemHandler.prototype.inlayGem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  var slot = msg.slot
  var gstr = msg.gstr
  this.areaManager.areaMap[areaId].inlayGem(uid,eId,slot,gstr,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//卸下宝石
gemHandler.prototype.takeofGem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  var slot = msg.slot
  this.areaManager.areaMap[areaId].takeofGem(uid,eId,slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//购买宝石
gemHandler.prototype.buyGem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var gId = msg.gId
  var level = msg.level
  var count = msg.count
  this.areaManager.areaMap[areaId].buyGem(uid,gId,level,count,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//出售宝石
gemHandler.prototype.sellGem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var glist = msg.glist
  this.areaManager.areaMap[areaId].sellGem(uid,glist,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//合成宝石
gemHandler.prototype.compoundGem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var gId = msg.gId
  var level = msg.level
  var glist = msg.glist
  this.areaManager.areaMap[areaId].compoundGem(uid,gId,level,glist,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "gemHandler",
  	func : gemHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
}