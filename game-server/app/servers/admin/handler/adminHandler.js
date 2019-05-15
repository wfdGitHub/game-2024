var bearcat = require("bearcat")
var adminHanlder = function(app) {
	this.app = app
	this.areaDeploy = this.app.get("areaDeploy")
}
//创建新服务器
adminHanlder.prototype.openArea = function(msg, session, next) {
	console.log("openArea")
	this.areaDeploy.openArea({areaName : "服务器"})
	next(null)
}

module.exports = function(app) {
	return bearcat.getBean({
		id : "adminHanlder",
		func : adminHanlder,
		args : [{
			name : "app",
			value : app
		}]
	})
}