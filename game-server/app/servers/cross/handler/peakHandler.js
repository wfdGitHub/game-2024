var bearcat = require("bearcat")
//跨服巅峰赛
var peakHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//开始新赛程
peakHandler.prototype.peakBegin = function(msg, session, next) {
  this.crossManager.peakBegin()
  next(null)
}
//下一阶段
peakHandler.prototype.peakNextState = function(msg, session, next) {
  this.crossManager.peakNextState()
  next(null)
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "peakHandler",
  	func : peakHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};