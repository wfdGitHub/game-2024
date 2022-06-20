var bearcat = require("bearcat")
var festivalHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取活动数据
festivalHandler.prototype.getFestivalData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getFestivalData(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//每日奖励
festivalHandler.prototype.festivalSignIn = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].festivalSignIn(uid,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//挑战boss
festivalHandler.prototype.challengeFestivalBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].challengeFestivalBoss(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//兑换物品
festivalHandler.prototype.festivalShop = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].festivalShop(uid,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "festivalHandler",
  	func : festivalHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "heroDao",
      ref : "heroDao"
    }]
  })
};