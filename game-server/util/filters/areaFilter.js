const bearcat = require("bearcat")
const MAX_COUNT = 50
module.exports = function() {
  return new Filter();
}
var Filter = function() {}
Filter.prototype.before = function (msg, session, next) {
	if(!session.uid || !session.get("areaId") || !session.get("oriId")){
		next("未登录服务器")
	}else{
		session.handlerTime = Date.now()
		next();
	}
}
Filter.prototype.after = function (err, msg, session, resp, next) {
	var dt = Date.now() - session.handlerTime
	if(dt > 1000){
		console.error("handlerTime over ",dt,msg)
	}
	next(err);
}