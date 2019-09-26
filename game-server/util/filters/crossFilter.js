module.exports = function() {
  return new Filter();
}

var Filter = function() {}

Filter.prototype.before = function (msg, session, next) {
	if(!session.uid || !session.get("crossUid")){
		next("未登录")
	}else{
		next();
	}
}