var daoConfig = require("../../config/daoConfig.json")
var redis = require("redis")
var RDS_PORT = daoConfig.redis.port
var RDS_HOST = daoConfig.redis.host
var RDS_PWD = daoConfig.redis.pwd
var RDS_OPTS = {auth_pass : RDS_PWD}
var redisDao = function() {
	this.db = false
}
redisDao.prototype.init = function(cb) {
	console.log("redisDao init")
	this.db = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS)
	this.db.on("ready",function(res) {
		cb()
	})
}
redisDao.prototype.multi = function(list,cb) {
 	multi = this.db.multi(list).exec(function (err, replies) {
 		cb(err,replies)
 	})
}
module.exports = {
	id : "redisDao",
	func : redisDao,
	init : "init",
	async : true,
	order : 0
}