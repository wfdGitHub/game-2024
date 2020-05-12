module.exports = function() {
  return new Filter();
}

var Filter = function() {}

Filter.prototype.before = function (msg, session, next) {
	if(!session.get("accId") || session.get("limit") < 10){
		next("权限不足")
	}else{
		next();
	}
}