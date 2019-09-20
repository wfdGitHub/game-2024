var bearcat = require("bearcat")
var crossRemote = function(app) {
	this.app = app
	this.crossManager = this.app.get("crossManager")
}
//玩家加入
crossRemote.prototype.userLogin = function(uid,areaId,cid,playerInfo,cb) {
	this.crossManager.userLogin(uid,areaId,cid,playerInfo,cb)
}

//玩家离开
crossRemote.prototype.userLeave = function(uid) {
	this.crossManager.userLeave(uid)
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