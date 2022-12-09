const bearcat = require("bearcat")
const MAX_COUNT = 50
module.exports = function() {
  return new Filter();
}
var Filter = function() {}
Filter.prototype.before = function (msg, session, next) {
		next();
}
Filter.prototype.after = function (err, msg, session, resp, next) {
	var dt = Date.now() - session.handlerTime
	if(dt > 1000){
		console.error("handlerTime over ",dt,msg)
	}
	next(err);
}