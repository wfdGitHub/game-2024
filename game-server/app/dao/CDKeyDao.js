const stringRandom = require('string-random');
var mysql = require("./mysql/mysql.js")
var pageNum = 20
var CDKeyDao = function() {}
CDKeyDao.prototype.init  = function() {
	this.db = mysql.init()
}
//创建礼包码类型
CDKeyDao.prototype.createCDType = function(type,award,des,cb) {
	var self = this
	var sql = "select * from CDType where type = ?"
	var args = [type];
	self.db.query(sql,args, function(err, res) {
		if (err) {
			cb(false,err)
			return
		}
		if(res && res.length){
			cb(false,"该类型已存在")
			return
		}else{
			sql = 'insert into CDType SET ?'
			var info = {
				type : type,
				award : award,
				valid : 1,
				c_time : Date.now(),
				des : des
			}
			self.db.query(sql,info, function(err, res) {
				if (err) {
					// console.error('createCDType! ' + err.stack);
					cb(false,err)
				}else{
					cb(true)
				}
			})
		}
	})
}
//禁用礼包码类型
CDKeyDao.prototype.pauseCDType = function(type,cb) {
	var sql = 'update CDType SET valid=0 where type=?'
	var args = [type];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			// console.error('pauseCDType! ' + err.stack);
			cb(false,err)
		}else{
			cb(true)
		}
	})
}
//恢复礼包码类型
CDKeyDao.prototype.resumeCDType = function(type,cb) {
	var sql = 'update CDType SET valid=1 where type=?'
	var args = [type];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			// console.error('resumeCDType! ' + err.stack);
			cb(false,err)
		}else{
			cb(true)
		}
	})
}
//获取礼包码类型表总页数
CDKeyDao.prototype.getCDTypePage = function(cb) {
	var sql = "select count(*) from CDType"
	var args = [];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			// console.error('getCDTypePage! ' + err.stack);
			cb(false,err)
			return
		}
		res =JSON.parse( JSON.stringify(res))
		console.log(res)
		cb(true,[res[0]["count(*)"],pageNum])
	})
}
//获取礼包码类型表一页数据
CDKeyDao.prototype.getCDTypeList = function(dataNum,cb) {
	var sql = "select * from CDType LIMIT ?,"+pageNum
	var args = [dataNum];
	this.db.query(sql,args, function(err, res) {
		if (err) {
			// console.log('getCDTypeList! ' + err.stack);
			cb(false,err)
			return
		}
		res =JSON.parse( JSON.stringify(res))
		cb(res)
	})
}
//生成礼包码
CDKeyDao.prototype.createCDKey = function(key,type,num,expires,cb) {
	var self = this
	var curTime = Date.now()
	var list = []
	var cdkeyList = []
	if(key && typeof(key) === "string"){
		list.push([key,type,curTime,expires,999999])
		cdkeyList.push(key)
	}else{
		for(let i = 0;i < num;i++){
			var cdkey = stringRandom(18)
			list.push([cdkey,type,curTime,expires,1])
			cdkeyList.push(cdkey)
		}
	}
	var sql = "INSERT INTO CDKey(cdkey,type,c_time,expires,maxCount) VALUES ?"
	self.db.query(sql,[list], function(err, res) {
		if (err) {
			// console.error('createCDKey! ' + err.stack);
			cb(false,err)
		}else{
			sql = 'update CDType SET total=total+? where type = ?'
			self.db.query(sql,[num,type],function(){})
			cb(true,cdkeyList)
		}
	})
}
//验证礼包码
CDKeyDao.prototype.verifyCDKey = function(key,uid,area,name,cb) {
	console.log(key,uid,area,name)
	var self = this
	self.getCDKeyInfo(key,function(flag,data) {
		if(!flag){
			cb(false,data)
		}else{
			if(data.maxCount <= data.count){
				cb(false,"该礼包码已经被激活")
				return
			}
			var curTime = Date.now()
			if(data.expires < curTime){
				cb(false,"该礼包码已失效")
				return
			}
			self.redisDao.db.hget("player:user:"+uid+":cdkey",data.type,function(err,value) {
				if(err){
					cb(false,err)
				}else if(value){
					cb(false,"该类型礼包码已经激活过了")
				}else{
					var sql = "select * from CDType where type = ?"
					self.db.query(sql,[data.type], function(err, res) {
						if(err){
							cb(false,err)
						}else{
							if(res[0].valid == 0){
								cb(false,"该礼包码已失效")
								return
							}
							sql = 'update CDKey SET count=count+?,uid=?,area=?,name=?,u_time=? where cdkey = ?'
							self.db.query(sql,[1,uid,area,name,curTime,key],function(){})
							if(data.maxCount == data.count + 1){
								sql = 'update CDType SET used=used+? where type = ?'
								self.db.query(sql,[1,data.type],function(){})
							}
							self.redisDao.db.hset("player:user:"+uid+":cdkey",data.type,curTime)
							cb(true,res[0].award)
						}
					})
				}
			})
		}
	})

}
//获取礼包码数据
CDKeyDao.prototype.getCDKeyInfo = function(key,cb) {
	var sql = "select * from CDKey where cdkey = ?"
	this.db.query(sql,[key], function(err, res) {
		if(err){
			cb(false,err)
		}else{
			if(!res.length){
				cb(false,"礼包码不存在")
			}else{
				cb(true,JSON.parse(JSON.stringify(res[0])))
			}
		}
	})
}
module.exports = {
	id : "CDKeyDao",
	func : CDKeyDao,
	init : "init",
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}

// var CDKey = new CDKeyDao()
// CDKey.init()
// CDKey.createCDType("normal_1","201:100","渠道",function(flag,data) {
// 	console.log("!!!",flag,data)
// })
// CDKey.getCDTypeList(0,function(flag,data) {
// 	console.log(flag,data)
// })
// CDKey.createCDKey("normal_1",5,1,Date.now()+1000000,function(flag,data) {
// 	console.log(flag,data)
// })
// CDKey.getCDKeyInfo("2bVQiGLIWSRVQgmJMj",function(flag,data) {
// 	console.log(flag,data)
// })
// CDKey.verifyCDKey("CJIL4F8WT8T4xWvPTB",1,1,1,function(flag,data) {
// 	console.log(flag,data)
// })