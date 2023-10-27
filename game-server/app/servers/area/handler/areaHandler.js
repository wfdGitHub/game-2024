var bearcat = require("bearcat")

var areaHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
areaHandler.prototype.say = function(msg, session, next) {
	next(null)
}
//通用接口
areaHandler.prototype.commonMethod = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var method = msg.method
  if(!this.areaManager.areaMap[areaId].methods[method]){
    next(null,{flag : false,data : "method error"})
    return
  }
  this.areaManager.areaMap[areaId].methods[method](uid,msg,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取新服限购数据
areaHandler.prototype.getAreaGiftData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getAreaGiftData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//领取新服限购奖励
areaHandler.prototype.gainAreaGiftAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  var type = msg.type
  this.areaManager.areaMap[areaId].gainAreaGiftAward(uid,index,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "areaHandler",
  	func : areaHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};