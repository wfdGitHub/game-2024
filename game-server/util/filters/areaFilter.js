module.exports = function() {
  return new Filter();
}

var Filter = function() {}

Filter.prototype.before = function (msg, session, next) {
	console.log("msg",msg,msg.route,msg.__route__)
	if(!session.get("uid") || !session.get("areaId")){
		next("未登录")
	}else{
		next();
	}
}