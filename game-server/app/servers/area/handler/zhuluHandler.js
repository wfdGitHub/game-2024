var bearcat = require("bearcat")
//逐鹿之战
var zhuluHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获取逐鹿之战数据
zhuluHandler.prototype.getZhuluData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getZhuluData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//选择格子
zhuluHandler.prototype.chooseGrid = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var choose = msg.choose
  this.areaManager.areaMap[areaId].chooseGrid(uid,choose,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//执行格子
zhuluHandler.prototype.executeGrid = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var arg = msg.arg
  this.areaManager.areaMap[areaId].executeGrid(uid,arg,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "zhuluHandler",
  	func : zhuluHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};