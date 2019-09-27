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