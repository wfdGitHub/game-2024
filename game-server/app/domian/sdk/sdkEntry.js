//SKD登陆模块
const util = require("../../../util/util.js")
const http = require('http')
const https = require('https')
const async = require('async')
const querystring = require("querystring")
var model = function() {}
//初始化获取配置
model.prototype.init = function(cb) {
	this.sdkConfig = require("../../../config/sysCfg/sdkConfig.json")
}
//渠道隔离
model.prototype.entry = function(data,cb) {
	var self = this
	async.waterfall([
		function(next) {
			//渠道隔离
			if(self.sdkConfig.isolation && data.device_id){
				self.redisDao.db.hget("device_channel",device_id,function(err,data) {
					if(data && data != channel_code){
						next("您已在其他平台注册，请返回原平台登录")
					}else{
						self.redisDao.db.hset("device_channel",device_id,channel_code)
						next()
					}
				})
			}else{
				next()
			}
		},
		function(next) {
			//渠道验证
			switch(self.sdkConfig.sdk_type){
				case "quick":
					//quick登陆
					self.quickEntry(data,cb)
				break
				case "x7sy":
					//小七手游
					self.x7syEntry(data,cb)
				break
			}
		}
	],function(err) {
		cb({flag:false,err:err})
	})
}
//quick登陆
model.prototype.quickEntry = function(data,cb) {
	var self = this
	var token = data.token
	var uid = data.uid
	var channel_code = data.channel_code
	var url = self.sdkConfig["CheckUserInfo"]+"?token="+token+"&product_code="+self.sdkConfig.product_code+"&uid="+uid+"&channel_code="+channel_code
	http.get(url,function(res){
	  	res.on("data",function(data) {
	    	if(data == 1){
	    		self.entrySuccess(uid,cb)
	    	}else{
	    		self.entryFaild(uid,"渠道账号验证错误",cb)
	    	}
	  	})
		res.on("error", err => {
			console.log(err.message);
			cb({flag:false,err:err})
		});
	})
}
//小七手游登陆
model.prototype.x7syEntry = function(data,cb) {
	console.log("x7syEntry",data)
	var self = this
	var tokenkey = data.tokenkey
	var sign = util.md5(encodeURI(self.sdkConfig["appkey"]+tokenkey))
	console.log("sign",sign)
	var url = self.sdkConfig["CheckUserInfo"]+"?tokenkey="+tokenkey+"&sign="+sign
	http.get(url,function(res){
	  	res.on("data",function(data) {
	  		console.log(data)
	    	if(data.errorno == 0){
	    		self.entrySuccess(data.data.guid,cb)
	    	}else{
	    		self.entryFaild(uid,data.errormsg,cb)
	    	}
	  	})
		res.on("error", err => {
			console.log(err.message);
			cb({flag:false,err:err})
		});
	})
}
//登陆成功
model.prototype.entrySuccess = function(uid,cb) {
	var unionid = uid
	var loginToken = util.randomString(8)
	this.redisDao.db.hset("loginToken",unionid,loginToken)
	cb({flag:true,unionid:unionid,token:loginToken})
}
//登陆失败
model.prototype.entryFaild = function(uid,err,cb) {
	console.log("entryFaild",uid,err)
	cb({flag:false,err:err})
}
module.exports = {
	id : "sdkEntry",
	func : model,
	init : "init",	
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}