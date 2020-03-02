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
//获取任务列表
taskHandler.prototype.getTaskList = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    this.areaManager.areaMap[areaId].getTaskList(uid,function(flag,data) {
      next(null,{flag : flag,data : data})
    })
}
//领取任务奖励
taskHandler.prototype.finishTask = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    var taskId = msg.taskId
    this.areaManager.areaMap[areaId].finishTask(uid,taskId,function(flag,data) {
      next(null,{flag : flag,data : data})
    })
}
//更新任务进度
taskHandler.prototype.taskUpdate = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    var type = msg.type
    this.areaManager.areaMap[areaId].taskUpdate(uid,type,1)
    next()
}
//获取活跃度数据
taskHandler.prototype.getLivenessData = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    this.areaManager.areaMap[areaId].getLivenessData(uid,function(flag,data) {
      next(null,{flag : flag,data : data})
    })
}
//领取活跃度奖励
taskHandler.prototype.gainLivenessAward = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    var index = msg.index
    this.areaManager.areaMap[areaId].gainLivenessAward(uid,index,function(flag,data) {
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