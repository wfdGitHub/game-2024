var bearcat = require("bearcat")
var connectorRemote = function(app) {
	this.app = app
	this.areaDeploy = this.app.get('areaDeploy')
}
//更新
connectorRemote.prototype.updateArea = function(areaInfo,serverId,cb) {
	this.areaDeploy.updateArea(areaInfo,serverId)
	console.log("updateArea  ",this.app.serverId,this.areaDeploy.getServerMap())
	cb()
}

module.exports = function(app) {
	return bearcat.getBean({
		id : "connectorRemote",
		func : connectorRemote,
		args : [{
			name : "app",
			value : app
		}]
	})
}