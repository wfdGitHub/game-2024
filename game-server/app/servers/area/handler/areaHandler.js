var bearcat = require("bearcat")

var areaHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
areaHandler.prototype.say = function(msg, session, next) {
	console.log("areaHandler say")
	next(null)
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