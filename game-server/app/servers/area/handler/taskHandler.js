var bearcat = require("bearcat")

var taskHandler = function(app) {
    this.app = app;
	this.areaManager = this.app.get("areaManager")
};
taskHandler.prototype.getCTaskInfo = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    this.areaManager.areaMap[areaId].getCTaskInfo(uid,function(flag,data) {
	    next(null,{flag : flag,data : data})
    })
}
taskHandler.prototype.getCTaskAward = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    var taskId = msg.taskId
    this.areaManager.areaMap[areaId].getCTaskAward(uid,taskId,function(flag,data) {
	    next(null,{flag : flag,data : data})
    })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "taskHandler",
  	func : taskHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};