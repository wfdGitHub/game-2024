var bearcat = require("bearcat")
var areaRemote = function(app) {
	this.app = app
	this.areaManager = this.app.get("areaManager")
}
//创建新服务器
areaRemote.prototype.loadArea = function(areaId,cb) {
	this.areaManager.loadArea(areaId)
	cb()
}
//玩家加入
areaRemote.prototype.userLogin = function(uid,areaId,cb) {
	this.areaManager.userLogin(uid,areaId,cb)
}

//玩家离开
areaRemote.prototype.userLeave = function(uid,cb) {
	this.areaManager.userLeave(uid)
	cb()
}


module.exports = function(app) {
	return bearcat.getBean({
		id : "areaRemote",
		func : areaRemote,
		args : [{
			name : "app",
			value : app
		}]
	})
}