var bearcat = require("bearcat")
var crossRemote = function(app) {
	this.app = app
	this.crossManager = this.app.get("crossManager")
}
//玩家加入
crossRemote.prototype.userLogin = function(uid,areaId,serverId,cid,playerInfo,cb) {
	this.crossManager.userLogin(uid,areaId,serverId,cid,playerInfo,cb)
}

//玩家离开
crossRemote.prototype.userLeave = function(uid,cb) {
	this.crossManager.userLeave(uid)
	if(cb)
		cb(true)
}
module.exports = function(app) {
	return bearcat.getBean({
		id : "crossRemote",
		func : crossRemote,
		args : [{
			name : "app",
			value : app
		}]
	})
}