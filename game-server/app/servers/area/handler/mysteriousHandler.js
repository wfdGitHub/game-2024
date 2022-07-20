var bearcat = require("bearcat")

var mysteriousHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取关卡数据
mysteriousHandler.prototype.getMysteriousData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getMysteriousData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//挑战关卡
mysteriousHandler.prototype.challengeMysterious = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var lv = msg.lv
  var verify = msg.verify
  var masterSkills = msg.masterSkills
  this.areaManager.areaMap[areaId].challengeMysterious(uid,lv,verify,masterSkills,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//扫荡关卡
mysteriousHandler.prototype.mopupMysterious = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var lv = msg.lv
  this.areaManager.areaMap[areaId].mopupMysterious(uid,lv,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//购买次数
mysteriousHandler.prototype.buyMysteriousCount = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].buyMysteriousCount(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//领取章节宝箱
mysteriousHandler.prototype.gaintMysteriousBox = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var chapter = msg.chapter
  var index = msg.index
  this.areaManager.areaMap[areaId].gaintMysteriousBox(uid,chapter,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取排行榜
mysteriousHandler.prototype.getMysteriousRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getMysteriousRank(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "mysteriousHandler",
  	func : mysteriousHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};