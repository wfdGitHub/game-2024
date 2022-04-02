var bearcat = require("bearcat")
var manorHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取家园数据
manorHandler.prototype.manorData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorData(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//建设升级建筑
manorHandler.prototype.manorBuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  var land = msg.land
  this.areaManager.areaMap[areaId].manorBuild(uid,bId,land,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//建设升级建筑
manorHandler.prototype.manorSwap = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var land1 = msg.land1
  var land2 = msg.land2
  this.areaManager.areaMap[areaId].manorSwap(uid,land1,land2,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取收益
manorHandler.prototype.manorReap = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  this.areaManager.areaMap[areaId].manorReap(uid,bId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//驯养马匹
manorHandler.prototype.manorStartHorse = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorStartHorse(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//收取马匹
manorHandler.prototype.manorGainHorse = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorGainHorse(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//打造护符
manorHandler.prototype.manorStartHufu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorStartHufu(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//收取护符
manorHandler.prototype.manorGainHufu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorGainHufu(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//购买军令
manorHandler.prototype.manorBuyAction = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorBuyAction(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//挑战首领
manorHandler.prototype.manorBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorBoss(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//挑战山贼
manorHandler.prototype.manorMon = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var monId = msg.monId
  this.areaManager.areaMap[areaId].manorMon(uid,monId,function(flag,data) {
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