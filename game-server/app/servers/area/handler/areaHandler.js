var bearcat = require("bearcat")

var areaHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
	console.log("areaManager",this.areaManager,this.app.serverId)
};
areaHandler.prototype.say = function(msg, session, next) {
	console.log("areaHandler say")
  this.areaManager.count++
  console.log(this.areaManager)
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