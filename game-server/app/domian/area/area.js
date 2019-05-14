var area = function(otps) {
	this.areaId = otps.areaId
	this.areaName = otps.areaName
}
//服务器初始化
area.prototype.init = function() {
	console.log("area init")
}
//玩家加入
area.prototype.userJoin = function() {
	// body...
}
//玩家退出
area.prototype.userLeave = function() {
	// body...
}
module.exports = {
	id : "area",
	func : area,
	scope : "prototype",
	init : "init"
}