var bearcat = require("bearcat")
var connectorRemote = function(app) {
	this.app = app
	this.areaDeploy = this.app.get('areaDeploy')
	this.sessionService = this.app.get('sessionService')
	this.connectorManager = this.app.get('connectorManager')
}
//更新
connectorRemote.prototype.updateArea = function(areaId,serverId,cb) {
	this.areaDeploy.updateArea(areaId,serverId)
	if(cb)
		cb()
}
//更新
connectorRemote.prototype.removeArea = function(areaId,cb) {
	this.areaDeploy.removeArea(areaId)
	if(cb)
		cb()
}
connectorRemote.prototype.kickUser = function(uid,cb) {
	this.connectorManager.sendByUid(uid,{type : "kick"})
	var uids = this.sessionService.getByUid(uid)
	if(uids) {
		for(var i = 0;i < uids.length;i++){
			this.sessionService.kickBySessionId(uids[i].id)
		}
	}
	if(cb){
		cb()
	}
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