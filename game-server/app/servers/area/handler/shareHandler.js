//分享
var bearcat = require("bearcat")
var shareHandler = function(app) {
  	this.app = app;
	  this.areaManager = this.app.get("areaManager")
};
//保存分享数据
shareHandler.prototype.saveShareData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var data = msg.data
  this.areaManager.areaMap[areaId].saveShareData(data,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取分享数据
shareHandler.prototype.getShareData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var shareId = msg.shareId
  this.areaManager.areaMap[areaId].getShareData(shareId,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "shareHandler",
  	func : shareHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};