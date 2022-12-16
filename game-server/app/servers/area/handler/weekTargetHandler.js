var bearcat = require("bearcat")
var week_goods = require("../../../../config/gameCfg/week_goods.json")
var week_day = require("../../../../config/gameCfg/week_day.json")
var weekTargetHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取七日目标数据
weekTargetHandler.prototype.getWeekTargetData = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getWeekTargetData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取七天登陆礼包
weekTargetHandler.prototype.gainLoginAward = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  let day = msg.day
  this.areaManager.areaMap[areaId].gainLoginAward(uid,day,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取每日礼包
weekTargetHandler.prototype.gainDayAward = function(msg, session, next) {
  next(null,{flag : false,msg : "接口弃用"})
  return
  let uid = session.uid
  let areaId = session.get("areaId")
  let day = msg.day
  this.areaManager.areaMap[areaId].gainDayAward(uid,day,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取等级礼包
weekTargetHandler.prototype.gainLvAward = function(msg, session, next) {
  next(null,{flag : false,msg : "接口弃用"})
  return
  let uid = session.uid
  let areaId = session.get("areaId")
  let day = msg.day
  this.areaManager.areaMap[areaId].gainLvAward(uid,day,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取充值礼包
weekTargetHandler.prototype.gainRmbAward = function(msg, session, next) {
  next(null,{flag : false,msg : "接口弃用"})
  return
  let uid = session.uid
  let areaId = session.get("areaId")
  let day = msg.day
  this.areaManager.areaMap[areaId].gainRmbAward(uid,day,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//购买限购礼包
weekTargetHandler.prototype.buyWeekTargetGoods = function(msg, session, next) {
  next(null,{flag : false,msg : "接口弃用"})
  return
  let uid = session.uid
  let areaId = session.get("areaId")
  let day = msg.day
  let index = msg.index
  this.areaManager.areaMap[areaId].buyWeekTargetGoods(uid,day,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取七日目标宝箱
weekTargetHandler.prototype.gainWeekTargetBox = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  let boxId = msg.boxId
  this.areaManager.areaMap[areaId].gainWeekTargetBox(uid,boxId,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "weekTargetHandler",
  	func : weekTargetHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};