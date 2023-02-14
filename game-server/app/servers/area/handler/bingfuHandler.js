//兵符系统
var bearcat = require("bearcat")
var bingfuHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取兵符数据
bingfuHandler.prototype.getBingfuData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getBingfuData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获得兵符
bingfuHandler.prototype.gainBingfu = function(msg, session, next) {
  // var uid = session.uid
  // var areaId = session.get("areaId")
  // var bfInfo = JSON.stringify(msg.bfInfo)
  // this.areaManager.areaMap[areaId].gainBingfu(uid,bfInfo,function(flag,data) {})
  next(null,{flag : false})
}
//洗练兵符
bingfuHandler.prototype.washBingfu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  this.areaManager.areaMap[areaId].washBingfu(uid,bId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//精炼兵符
bingfuHandler.prototype.refineBingfu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  this.areaManager.areaMap[areaId].refineBingfu(uid,bId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//保存洗练属性
bingfuHandler.prototype.replaceBingfu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  this.areaManager.areaMap[areaId].replaceBingfu(uid,bId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//洗练已穿戴兵符
bingfuHandler.prototype.washBingfuForWear = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].washBingfuForWear(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//精炼已穿戴兵符
bingfuHandler.prototype.refineBingfuForWear = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].refineBingfuForWear(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//保存已穿戴洗练属性
bingfuHandler.prototype.replaceBingfuForWear = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].replaceBingfuForWear(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//兵符分解
bingfuHandler.prototype.resolveBingfu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bIds = msg.bIds
  this.areaManager.areaMap[areaId].resolveBingfu(uid,bIds,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//兵符合成
bingfuHandler.prototype.compoundBingfu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bIds = msg.bIds
  this.areaManager.areaMap[areaId].compoundBingfu(uid,bIds,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//兵符穿戴
bingfuHandler.prototype.wearBingfu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  this.areaManager.areaMap[areaId].wearBingfu(uid,bId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//兵符卸下
bingfuHandler.prototype.unwearBingfu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].unwearBingfu(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "bingfuHandler",
  	func : bingfuHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};