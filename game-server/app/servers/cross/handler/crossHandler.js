var bearcat = require("bearcat")
//日志模块
var crossHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//接收日志
crossHandler.prototype.test = function(msg, session, next) {
  next(null,{flag : true})
}
// //公会匹配
// crossHandler.prototype.matchGuildPKRival = function(msg, session, next) {
//   var crossUid = session.get("crossUid")
//   this.crossManager.matchGuildPKRival()
//   next(null,{flag : true})
// }
// //公会战斗
// crossHandler.prototype.beginGuildPKTable = function(msg, session, next) {
//   var crossUid = session.get("crossUid")
//   this.crossManager.beginGuildPKTable()
//   next(null,{flag : true})
// }
//重新分配战区
crossHandler.prototype.theatreDeploy = function(msg, session, next) {
  this.crossManager.theatreDeploy()
  next(null,{flag : true})
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "crossHandler",
  	func : crossHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};