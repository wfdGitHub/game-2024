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
festivalHandler.prototype.gainFestivalDayAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainFestivalDayAward(uid,function(flag,data) {
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
//获取摇钱树奖励列表
festivalHandler.prototype.getFestivalTreeList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getFestivalTreeList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//结算摇钱树奖励
festivalHandler.prototype.gainFestivalTreeAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var count = msg.count
  if(!Number.isInteger(count)){
    next(null,{flag:false,data:"count error"})
    return
  }
  this.areaManager.areaMap[areaId].gainFestivalTreeAward(uid,count,function(flag,data) {
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