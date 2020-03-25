
// var daoConfig = require("../../config/daoConfig.json")
// var redis = require("redis")
// var RDS_PORT = daoConfig.redis.port
// var RDS_HOST = daoConfig.redis.host
// var RDS_PWD = daoConfig.redis.pwd
// var RDS_OPTS = {auth_pass : RDS_PWD}
// var client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS)
// client.on("ready",function(res) {
// 	client.zrange(["cross:grading:rank",0,10,"WITHSCORES"],function(err,data) {
// 		if(data === null){
// 			console.log(true)
// 		}
// 		console.log(err,data)
// 	})
// })
