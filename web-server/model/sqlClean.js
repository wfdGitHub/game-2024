//数据库清理
const fs = require('fs');
var model = function(){}
//初始化
model.prototype.init = function (server,mysqlDao,redisDao) {
	this.mysqlDao = mysqlDao
	this.redisDao = redisDao
	this.server = server
}
//数据清档
model.prototype.dataClean = function(cb) {
	var self = this
	fs.readFile("cleanState.txt", (err, data) => {
		if(!err || data){
			console.error("该版本已清档，请手动处理")
			cb(false,"该版本已清档，请手动处理")
		}else{
			console.log("未清档 开始清档")
			fs.writeFile("cleanState.txt","清档时间 "+(new Date()).toLocaleDateString(),function(err) {
			   if (err) {
			       console.error(err);
			   }
			   self.redisDaoClean()
			   self.mysqlClean()
			   cb(true)
			})
		}
	})
}
//redis清档
model.prototype.redisDaoClean = function() {
	this.redisDao.db.flushdb()
}

//mysql清档
model.prototype.mysqlClean = function() {
	this.mysqlDao.db.query("delete from chat_record",[],function(err) {})
	this.mysqlDao.db.query("delete from daily_table",[],function(err) {})
	this.mysqlDao.db.query("delete from game_order",[],function(err) {})
	this.mysqlDao.db.query("delete from item_log",[],function(err) {})
	this.mysqlDao.db.query("delete from login_log",[],function(err) {})
	this.mysqlDao.db.query("delete from LTV_table",[],function(err) {})
	this.mysqlDao.db.query("delete from mail_log",[],function(err) {})
	this.mysqlDao.db.query("delete from retention_table",[],function(err) {})
	this.mysqlDao.db.query("delete from user_list",[],function(err) {})
}

module.exports = new model()