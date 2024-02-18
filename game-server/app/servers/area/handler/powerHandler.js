var bearcat = require("bearcat")
var async = require("async")
var result_weight = {}
var powerHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取主动技能数据
powerHandler.prototype.getPowerData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getPowerData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升星
powerHandler.prototype.upPowerStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerStar(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升级
powerHandler.prototype.upPowerLv = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerLv(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升阶
powerHandler.prototype.upPowerAd = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerAd(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置上阵技能
powerHandler.prototype.setPowerFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var list = msg.list
  this.areaManager.areaMap[areaId].setPowerFight(uid,list,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能重生
powerHandler.prototype.resetPower = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].resetPower(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置释放偏好
powerHandler.prototype.setManualModel = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].setManualModel(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "powerHandler",
  	func : powerHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "redisDao",
      ref : "redisDao"
    }]
  })
};