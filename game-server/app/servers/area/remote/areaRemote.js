var bearcat = require("bearcat")
var areaRemote = function(app) {
	this.app = app
	this.areaManager = this.app.get("areaManager")
	console.log(this.areaManager)
}
//创建新服务器
areaRemote.prototype.openArea = function(cb) {
	console.log("openArea")
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