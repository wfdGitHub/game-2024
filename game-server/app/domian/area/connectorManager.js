var bearcat = require("bearcat")
var connectorManager = function() {}

connectorManager.prototype.init = function(app) {
	this.app = app
	this.channelService = this.app.get('channelService')
	this.app.event.on("remove_servers", this.removeServers.bind(this));
}
//服务器实体机器移除
connectorManager.prototype.removeServers = function(ids) {
	var self = this
	self.app.get('sessionService').forEachBindedSession(function(session) {
		ids.forEach(function(serverId) {
			if(serverId === session.get("serverId")){
				self.app.get('sessionService').kickBySessionId(session.id)
			}
		})
	})
}
connectorManager.prototype.sendByUid = function(uid,notify,cb) {
	this.channelService.pushMessageByUids('onMessage', notify, [{
      uid: uid,
      sid: this.app.get('serverId')
    }],function() {
      if(cb){
        cb() 
      }
    });
}
module.exports = {
	id : "connectorManager",
	func : connectorManager
}