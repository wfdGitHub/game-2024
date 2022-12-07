const bearcat = require("bearcat")
const MAX_COUNT = 50
module.exports = function() {
  return new Filter();
}
var Filter = function() {}
Filter.prototype.before = function (msg, session, next) {
		var last_route = session.get("last_route")
		var count_route = session.get("count_route") || 0
		if(!session.testCount)
			session.testCount = 0
		session.testCount++
		console.log("connectorFilter",msg,last_route,count_route,session.testCount)
		if(last_route == msg.__route__){
			count_route++
		}else{
			last_route = msg.__route__
			count_route = 0
		}
    session.set("last_route",last_route)
    session.set("count_route",count_route)
		session.handlerTime = Date.now()
		if(count_route >= MAX_COUNT){
			if(count_route == MAX_COUNT){
			  var redisDao = bearcat.getBean("redisDao")
			  var info = {
			  	uid : session.uid,
			  	last_route : last_route,
			  	count_route : count_route
			  }
			  redisDao.db.rpush("server:logs",JSON.stringify(info),function(err,num) {
			      if(num > 200){
			        redisDao.db.ltrim("server:logs",-200,-1)
			      }
			  })
			}
		  next("error")
		  return
		}
		next();
}
Filter.prototype.after = function (err, msg, session, resp, next) {
	var dt = Date.now() - session.handlerTime
	if(dt > 1000){
		console.error("handlerTime over ",dt,msg)
	}
	next(err);
}