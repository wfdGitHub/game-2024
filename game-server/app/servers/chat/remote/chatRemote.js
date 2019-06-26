var bearcat = require("bearcat")
var chatRemote = function(app) {
	this.app = app
	this.chat = this.app.get("chat")
}

chatRemote.prototype.userLeave = function(uid,sid,cb) {
	this.chat.userLeave(uid,sid)
	cb()
}

module.exports = function(app) {
	return bearcat.getBean({
		id : "chatRemote",
		func : chatRemote,
		args : [{
			name : "app",
			value : app
		}]
	})
}