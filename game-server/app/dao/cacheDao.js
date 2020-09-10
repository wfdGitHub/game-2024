var daoConfig = require("../../config/daoConfig.json")
var redis = require("redis")
var RDS_PORT = daoConfig.cache.port
var RDS_HOST = daoConfig.cache.host
var RDS_PWD = daoConfig.cache.pwd
var RDS_OPTS = {auth_pass : RDS_PWD}
var publish = "jianwan"
var cacheDao = function() {
	this.db = false
}
cacheDao.prototype.init = function(cb) {
	console.log("cacheDao init")
	this.db = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS)
	var self = this
	self.db.on("ready",function(res) {
		self.db.select("15",function(err) {
		})
	})
	cb()
}
cacheDao.prototype.saveCache = function(info) {
	info.time = Date.now()
	this.db.rpush("message_"+publish,JSON.stringify(info))
}
cacheDao.prototype.saveChat = function(info) {
	info.time = Date.now()
	this.db.rpush("message_"+publish+"_chat",JSON.stringify(info))
}
cacheDao.prototype.saveItemChange = function(info) {
	info.time = Date.now()
	this.db.rpush("message_"+publish+"_item",JSON.stringify(info))
}
module.exports = {
	id : "cacheDao",
	func : cacheDao,
	init : "init",
	async : true,
	order : 0
}