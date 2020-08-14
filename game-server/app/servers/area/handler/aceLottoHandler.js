var bearcat = require("bearcat")
var aceLottoHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取元神抽奖数据
aceLottoHandler.prototype.getaceLottoData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getaceLottoData(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//免费元神抽奖
aceLottoHandler.prototype.aceLottoFree = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].aceLottoFree(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//单次元神抽奖
aceLottoHandler.prototype.aceLottoOnce = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].aceLottoOnce(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//十连元神抽奖
aceLottoHandler.prototype.aceLottoMultiple = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].aceLottoMultiple(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "aceLottoHandler",
  	func : aceLottoHandler,
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