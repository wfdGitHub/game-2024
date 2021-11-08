// var redis = require("redis")
// var host = "127.0.0.1"
// var port = "6379"
// var pwd = "MyRedis2018"
// var db = redis.createClient(port,host,{auth_pass : pwd})
// db.on("ready",function(res) {
// 	console.log("ready")
// 	// for(var i = 1;i <= 100;i++){
// 	// 	db.zadd("testherorank",i,i)
// 	// }
// 	db.zrem("testherorank",99)
// })