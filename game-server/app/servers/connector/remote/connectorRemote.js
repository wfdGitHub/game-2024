var bearcat = require("bearcat")
var connectorRemote = function(app) {
	this.app = app
	this.areaDeploy = this.app.get('areaDeploy')
	this.channelService = this.app.get('channelService')
}
//更新
connectorRemote.prototype.updateArea = function(areaInfo,serverId,cb) {
	this.areaDeploy.updateArea(areaInfo,serverId)
	cb()
}
connectorRemote.prototype.sendByUid = function(uid,notify,cb) {
	this.channelService.pushMessageByUids('onMessage', notify, [{
      uid: uid,
      sid: this.app.get('serverId')
    }],function() {
      if(cb){
        cb() 
      }
    });
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