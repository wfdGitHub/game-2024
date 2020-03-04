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
//刷新集市
bazaarHandler.prototype.bazaarRefresh = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  var data = this.areaManager.areaMap[areaId].bazaarRefresh(uid,type)
  next(null,{flag : true,data : data})
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