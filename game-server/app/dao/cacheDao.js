var daoConfig = require("../../config/daoConfig.json")
var redis = require("redis")
var RDS_PORT = daoConfig.cache.port
var RDS_HOST = daoConfig.cache.host
var RDS_PWD = daoConfig.cache.pwd
var RDS_OPTS = {auth_pass : RDS_PWD}
var cacheDao = function() {
	this.db = false
}
cacheDao.prototype.init = function(cb) {
	console.log("cacheDao init")
	this.db = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS)
	var self = this
	self.db.on("ready",function(res) {
		cb()
	})
}
cacheDao.prototype.saveCache = function(info) {
	this.db.rpush("message",JSON.stringify(info))
}
module.exports = {
	id : "cacheDao",
	func : cacheDao,
	init : "init",
	async : true,
	order : 0
}