const stringRandom = require('string-random');
var mysql = require("./mysql/mysql.js")
const util = require("../../util/util.js")
var pageNum = 11
var mysqlDao = function() {}
mysqlDao.prototype.init  = function() {
	this.db = mysql.init()

}
var retention_days = [1,2,3,4,5,6,7,15,30,45,60]
var ltv_days = [1,2,3,4,5,7,15,30,45,60]
//添加聊天记录
mysqlDao.prototype.addChatRecord  = function(uid,nickname,text,roomName) {
	var sql = 'insert into chat_record SET ?'
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
//创建今日报表
mysqlDao.prototype.createDayTable = function() {
	var sql = "select * from daily_table where date=?"
	var date = (new Date()).toLocaleDateString()
	var args = [date]
	var self = this
	self.db.query(sql,args, function(err, res) {
		if (err) {
			console.error('createDayTable! ' + err.stack);
			return
		}
		res =JSON.parse( JSON.stringify(res))
		if(!res.length){
			var sql1 = 'insert into daily_table SET ?'
			var info1 = {
				date : date,
				accNum : 0,
				userNum : 0,
				activeNum : 0,
				n_pay_amount : 0,
				a_pay_amount : 0,
				n_pay_number : 0,
				a_pay_number : 0,
				n_pay_user : 0,
				a_pay_user : 0
			}
			self.db.query(sql1,info1, function(err, res) {
				if (err) {
					console.error('createDayTable! ' + err.stack);
				}
			})
			var sql2 = 'insert into retention_table SET ?'
			var info2 = {
				date : date,
				accNum : 0,
				userNum : 0,
				retention_1 : 0,
				retention_2 : 0,
				retention_3 : 0,
				retention_4 : 0,
				retention_5 : 0,
				retention_6 : 0,
				retention_7 : 0,
				retention_15 : 0,
				retention_30 : 0,
				retention_45 : 0,
				retention_60 : 0,
				retention_more : 0
			}
			self.db.query(sql2,info2, function(err, res) {
				if (err) {
					console.error('createDayTable! ' + err.stack);
				}
			})
			var sql3 = 'insert into LTV_table SET ?'
			var info3 = {
				date : date,
				accNum : 0,
				userNum : 0,
				LTV_1 : 0,
				LTV_2 : 0,
				LTV_3 : 0,
				LTV_4 : 0,
				LTV_5 : 0,
				LTV_7 : 0,
				LTV_15 : 0,
				LTV_30 : 0,
				LTV_45 : 0,
				LTV_60 : 0,
				LTV_more : 0
			}
			self.db.query(sql3,info3, function(err, res) {
				if (err) {
					console.error('createDayTable! ' + err.stack);
				}
			})
		}
	})
}
//更新单日报表
mysqlDao.prototype.addDaylyData  = function(key,num) {
	var date = (new Date()).toLocaleDateString()
	var sql = "update daily_table SET "+key+"="+key+"+? where date=?"
	var args = [num,date];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			console.error('addDaylyData! ' + err.stack);
		}
	})
}
//玩家登陆更新留存报表
mysqlDao.prototype.updateRetention = function(uid,createTime) {
	var date = (new Date(createTime)).toLocaleDateString()
	var day = Math.ceil((Date.now() - util.getZeroTime(createTime)) / 86400000)
	var index = "more"
	for(var i = 0;i < retention_days.length;i++){
		if(day == retention_days[i]){
			index = retention_days[i]
			this.addRetentionData("retention_"+index,1,date)
			return
		}
	}
}
//更新留存报表
mysqlDao.prototype.addRetentionData  = function(key,num,date) {
	if(!date)
		date = (new Date()).toLocaleDateString()
	var sql = "update retention_table SET "+key+"="+key+"+? where date=?"
	var args = [num,date];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			console.error('retention_table! ' + err.stack);
		}
	})
}
//玩家充值更新LTV报表
mysqlDao.prototype.updateLTV = function(uid,amount,createTime) {
	var date = (new Date(createTime)).toLocaleDateString()
	var day = Math.ceil((Date.now() - util.getZeroTime(createTime)) / 86400000)
	var index = "more"
	var self = this
	for(var i = 0;i < ltv_days.length;i++){
		if(day <= ltv_days[i]){
			index = ltv_days[i]
			break
		}
	}
	self.addLTVData("LTV_"+index,amount,date)
	self.redisDao.db.hincrby("player:user:"+uid+":playerInfo","pay_state",1,function(err,data) {
		if(data == 1){
			if(day == 1)
				self.addDaylyData("n_pay_user",1)
			self.addDaylyData("a_pay_user",1)
		}
	})
}
//更新LTV报表
mysqlDao.prototype.addLTVData  = function(key,num,date) {
	if(!date)
		date = (new Date()).toLocaleDateString()
	var sql = "update LTV_table SET "+key+"="+key+"+? where date=?"
	var args = [num,date];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			console.error('LTV_table! ' + err.stack);
		}
	})
}
//添加英雄记录 uid,name,id,info,result
mysqlDao.prototype.addHeroLog = function(info) {
	if(info.info && info.info.qa >= 5){
		var sql = 'insert into hero_log SET ?'
		var data = {
			uid : info.uid,
			name : info.name,
			id : info.id,
			info : JSON.stringify(info.info),
			reason : info.reason,
			time : Date.now()
		}
		this.db.query(sql,data, function(err, res) {
			if (err) {
				console.error('addHeroLog! ' + err.stack);
			}
		})
	}
}
//添加装备记录
mysqlDao.prototype.addEquipLog = function(info) {
	if(info.info && info.info.qa >= 5){
		var sql = 'insert into equip_log SET ?'
		var data = {
			uid : info.uid,
			name : info.name,
			id : info.id,
			info : JSON.stringify(info.info),
			reason : info.reason,
			time : Date.now()
		}
		this.db.query(sql,data, function(err, res) {
			if (err) {
				console.error('addEquipLog! ' + err.stack);
			}
		})
	}
}
//添加法宝记录
mysqlDao.prototype.addFabaoLog = function(info) {
	if(info.info && info.info.qa >= 5){
		var sql = 'insert into fabao_log SET ?'
		var data = {
			uid : info.uid,
			name : info.name,
			id : info.id,
			info : JSON.stringify(info.info),
			reason : info.reason,
			time : Date.now()
		}
		this.db.query(sql,data, function(err, res) {
			if (err) {
				console.error('addFabaoLog! ' + err.stack);
			}
		})
	}
}
module.exports = {
	id : "mysqlDao",
	func : mysqlDao,
	init : "init",
	order : 0,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}