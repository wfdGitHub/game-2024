var bearcat = require("bearcat")

var bazaarHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取集市数据
bazaarHandler.prototype.getBazaarData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getBazaarData(uid,function(data) {
    next(null,{flag : true,data : data})
  })
}
//购买物品
bazaarHandler.prototype.buyBazzarGoods = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  var index = msg.index
  this.areaManager.areaMap[areaId].buyBazzarGoods(uid,type,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//免费刷新
bazaarHandler.prototype.bazaarRefreshFree = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].bazaarRefreshFree(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//付费刷新
bazaarHandler.prototype.bazaarRefreshBuy = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].bazaarRefreshBuy(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "bazaarHandler",
  	func : bazaarHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};