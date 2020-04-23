var bearcat = require("bearcat")
//逐鹿之战
var activityHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获得活动数据
activityHandler.prototype.getActivityData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getActivityData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//签到
activityHandler.prototype.gainSignInAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainSignInAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取签到宝箱
activityHandler.prototype.gainSignInBox = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainSignInBox(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//在线奖励
activityHandler.prototype.gainOnlineTimeAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainOnlineTimeAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//模拟充值
activityHandler.prototype.test_recharge = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var rmb = msg.rmb
  this.areaManager.areaMap[areaId].test_recharge(uid,rmb,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取VIP免费礼包
activityHandler.prototype.gainVipAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var vip = msg.vip
  this.areaManager.areaMap[areaId].gainVipAward(uid,vip,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//购买VIP付费礼包
activityHandler.prototype.buyVipAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var vip = msg.vip
  this.areaManager.areaMap[areaId].buyVipAward(uid,vip,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "activityHandler",
  	func : activityHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};