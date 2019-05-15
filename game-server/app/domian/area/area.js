var bearcat = require("bearcat")
var area = function(otps) {
	this.areaId = otps.areaId
	this.areaName = otps.areaName
	this.players = {}
}
//服务器初始化
area.prototype.init = function() {
	console.log("area init")
}
//玩家加入
area.prototype.userLogin = function(uid,cb) {
	console.log("userLogin : ",uid)
	var self = this
	self.playerDao.userLogin({areaId : self.areaId,uid : uid},function(playerInfo) {
		if(playerInfo){
			self.players[uid] = bearcat.getBean("player",playerInfo)
		}
		cb(playerInfo)
	})
}
//玩家退出
area.prototype.userLeave = function(uid) {
	console.log("userLeave : ",uid)
	delete this.players[uid]
}
module.exports = {
	id : "area",
	func : area,
	scope : "prototype",
	init : "init",
	args : [{
		name : "otps",
		type : "Object"
	}],
	props : [{
		name : "playerDao",
		ref : "playerDao"
	}]
}