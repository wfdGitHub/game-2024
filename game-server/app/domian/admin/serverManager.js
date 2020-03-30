var serverManager = function(app) {
	this.app = app
	this.areaDeploy = this.app.get("areaDeploy")
	this.plans = {}
}
//
serverManager.prototype.init = function() {
	var self = this
	self.redisDao.db.hgetall("serverManager:plans",function(err,data) {
		for(var i in data){
			self.plans[i] = Number(data[i])
		}
	})
	setInterval(self.update.bind(self),1000)
}
//update
serverManager.prototype.update = function() {
	let curTime = Date.now()
	for(var areaName in this.plans){
		if(curTime > this.plans[areaName]){
			delete this.plans[areaName]
			this.areaDeploy.openArea({areaName : areaName})
			return
		}
	}
}
//添加开服计划
serverManager.prototype.setOpenPlan = function(areaName,time,cb) {
	if(typeof(areaName) != "string" || !Number.isInteger(time) || time < Date.now()){
		cb(false,"参数错误")
		return
	}
	this.plans[areaName] = time
	this.redisDao.db.hset("serverManager:plans",areaName,time)
	cb(true)
}
//删除开服计划
serverManager.prototype.delOpenPlan = function(areaName,cb) {
	if(!this.plans[areaName]){
		cb(false,"不存在该服务器开服计划")
		return
	}
	delete this.plans[areaName]
	this.redisDao.db.hdel("serverManager:plans",areaName)
	cb(true)
}
//获取开服计划表
serverManager.prototype.getOpenPlan = function(cb) {
	cb(true,this.plans)
}
module.exports = {
	id : "serverManager",
	func : serverManager,
	scope : "prototype",
	init : "init",
	args : [{
		name : "app",
		type : "Object"
	}],
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}