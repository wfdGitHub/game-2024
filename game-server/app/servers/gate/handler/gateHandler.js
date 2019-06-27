var bearcat = require("bearcat")

var Handler = function(app) {
	this.app = app;
	this.index = 0
};

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
Handler.prototype.queryEntry = function(msg, session, next) {
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500
		});
		return;
	}
	this.index++;
	if(this.index >= connectors.length){
		this.index = 0
	}
	var res = connectors[this.index % connectors.length]
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort + 1000
	});
};
Handler.prototype.queryClientEntry = function(msg, session, next) {
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500
		});
		return;
	}
	this.index++;
	// console.log("index : ",this.index,connectors.length)
	if(this.index >= connectors.length){
		this.index = 0
	}
	var res = connectors[this.index % connectors.length]
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};

module.exports = function(app) {
	return bearcat.getBean({
		id : "gateHandler",
		func : Handler,
		args : [{
			name : "app",
			value : app
		}]
	})
}