var bearcat = require("bearcat")
var hufuHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//护符列表
hufuHandler.prototype.getHufuList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getHufuList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机护符
hufuHandler.prototype.gainRandHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandHufu(uid,lv)
  next(null,{flag:true,data:data})
}
//生成指定护符  lv s1 s2
hufuHandler.prototype.gainHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var info = msg.info
  var data = this.areaManager.areaMap[areaId].gainHufu(uid,info)
  next(null,{flag:true,data:data})
}
//穿戴护符
hufuHandler.prototype.wearHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearHufu(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下护符
hufuHandler.prototype.unwearHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearHufu(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成护符
hufuHandler.prototype.compoundHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundHufu(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练护符
hufuHandler.prototype.resetHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].resetHufu(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "hufuHandler",
  	func : hufuHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};