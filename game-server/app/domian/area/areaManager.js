var areaManager = function() {
	this.name = "areaManager"
}
//初始化
areaManager.prototype.init = function(app) {
	this.app = app
	console.log("areaManager init : ",this.app.serverId)
}
//开启新服务器
areaManager.prototype.openArea = function() {

}
//关闭服务器
areaManager.prototype.closeArea = function() {

}


module.exports = {
	id : "areaManager",
	func : areaManager,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}