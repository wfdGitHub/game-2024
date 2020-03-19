//游历任务
var bearcat = require("bearcat")

var tourHandler = function(app) {
    this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取游历任务数据
tourHandler.prototype.getTourData = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    this.areaManager.areaMap[areaId].getTourData(uid,function(flag,data) {
	    next(null,{flag : flag,data : data})
    })
}
//刷新游历任务
tourHandler.prototype.refreshTour = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    this.areaManager.areaMap[areaId].refreshTour(uid,function(flag,data) {
	    next(null,{flag : flag,data : data})
    })
}
//进行游历任务
tourHandler.prototype.runTour = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
	//参数判断
	var hIds = msg.hIds
	if(!hIds instanceof Array){
		next(null,{flag : false,data : "必须传数组"})
		return
	}
	//判断重复
	for(var i = 0;i < hIds.length;i++){
		if(!hIds[i]){
			next(null,{flag : false,data : "hIds error"})
			return
		}
		for(var j = i + 1;j < hIds.length;j++){
			if(!hIds[j] || hIds[i] == hIds[j]){
				next(null,{flag : false,data : "hIds error"})
				return
			}
		}
	}
    this.areaManager.areaMap[areaId].runTour(uid,msg.index,hIds,function(flag,data) {
	    next(null,{flag : flag,data : data})
    })
}
//领取游历任务奖励
tourHandler.prototype.gainTourAward = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    this.areaManager.areaMap[areaId].gainTourAward(uid,msg.id,function(flag,data) {
	    next(null,{flag : flag,data : data})
    })
}
//加速完成游历任务
tourHandler.prototype.speedUpTour = function(msg, session, next) {
    var uid = session.uid
    var areaId = session.get("areaId")
    this.areaManager.areaMap[areaId].speedUpTour(uid,msg.id,function(flag,data) {
	    next(null,{flag : flag,data : data})
    })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "tourHandler",
  	func : tourHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};