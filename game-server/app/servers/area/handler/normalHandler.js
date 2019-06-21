var bearcat = require("bearcat")
var normalHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};

//使用物品
normalHandler.prototype.useItem = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  msg.uid = uid
  this.areaManager.areaMap[areaId].useItem(msg,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//在线领取挂机奖励
normalHandler.prototype.getOnhookAward = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getOnhookAward(uid,1.2,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}

//增加物品  测试功能
normalHandler.prototype.addItem = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var itemId = msg.itemId
  var value = msg.value
  this.areaManager.areaMap[areaId].addItem(uid,itemId,value,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//测试
normalHandler.prototype.test = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var items = msg.items
  this.areaManager.areaMap[areaId].getBagItemList(uid,items,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "normalHandler",
  	func : normalHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};