module.exports = function() {
  return new Filter();
}

var Filter = function() {}

Filter.prototype.before = function (msg, session, next) {
	console.log("判断是否已登录")
	if(!session.get("uid")){
		next("未登录")
	}else{
		next();
	}
}