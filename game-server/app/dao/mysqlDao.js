const stringRandom = require('string-random');
var mysql = require("./mysql/mysql.js")
var pageNum = 11
var mysqlDao = function() {}
mysqlDao.prototype.init  = function() {
	this.db = mysql.init()
}
//添加聊天记录
mysqlDao.prototype.addChatRecord  = function(uid,nickname,text,roomName) {
	sql = 'insert into chat_record SET ?'
	var info = {
		time : Date.now(),
		uid : uid,
		nickname : nickname,
		text : text,
		roomName : roomName
	}
	this.db.query(sql,info, function(err, res) {
		if (err) {
			console.error('addChatRecord! ' + err.stack);
		}
	})
}
//获取聊天记录总页数
mysqlDao.prototype.getChatRecordPage = function(cb) {
	var sql = "select count(*) from chat_record"
	var args = [];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			// console.error('getCDTypePage! ' + err.stack);
			cb(false,err)
			return
		}
		res =JSON.parse( JSON.stringify(res))
		cb(true,[res[0]["count(*)"],pageNum])
	})
}
//获取聊天记录一页数据
mysqlDao.prototype.getChatRecordList = function(dataNum,cb) {
	var sql = "select * from chat_record LIMIT ?,"+pageNum
	var args = [dataNum];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			// console.log('getCDTypeList! ' + err.stack);
			cb(false,err)
			return
		}
		res =JSON.parse( JSON.stringify(res))
		cb(true,res)
	})
}
module.exports = {
	id : "mysqlDao",
	func : mysqlDao,
	init : "init",
	props : []
}