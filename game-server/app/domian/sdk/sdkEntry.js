//SKD登陆模块
const util = require("../../../util/util.js")
const http = require('http')
const https = require('https')
const async = require('async')
const querystring = require("querystring")
var model = function() {}
//初始化获取配置
model.prototype.init = function(cb) {
	// console.log("SKD登陆模块 初始化SDK配置")
	this.sdkConfig = require("../../../config/gameCfg/sdkConfig.json")
	for(var i in this.sdkConfig)
		if(Number.isFinite(this.sdkConfig[i]["value"]))
			this.sdkConfig[i]["value"] = this.sdkConfig[i]["value"].toFixed(0)
}
//渠道隔离
model.prototype.entry = function(data,cb) {
	var self = this
	//渠道验证
	switch(self.sdkConfig.sdk_type["value"]){
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
//quick登陆
model.prototype.quickEntry = function(data,cb) {
	var self = this
	var token = data.token
	var uid = data.uid
	var channel_code = data.channel_code
	var url = self.sdkConfig["CheckUserInfo"]["value"]+"?token="+token+"&product_code="+self.sdkConfig.ProductCode["value"]+"&uid="+uid+"&channel_code="+channel_code
	http.get(url,function(res){
	  	res.on("data",function(data) {
	    	if(data == 1){
	    		self.entrySuccess(uid,cb)
	    	}else{
	    		self.entryFaild(uid,"渠道账号验证错误",cb)
	    	}
	  	})
		res.on("error", err => {
			cb({flag:false,err:err})
		});
	})
}
//小七手游登陆
model.prototype.x7syEntry = function(data,cb) {
	var self = this
	var tokenkey = data.token
	var sign = ""
	var os = data.os
	if(os == "ios")
		sign = util.md5(self.sdkConfig["iosAppKey"]["value"]+tokenkey)
	else
		sign = util.md5(self.sdkConfig["AppKey"]["value"]+tokenkey)
	var url = self.sdkConfig["CheckUserInfo"]["value"]+"?tokenkey="+tokenkey+"&sign="+sign
	https.get(url,function(res){
	  	var _data='';
	  	res.on("data",function(chunk) {
	  		_data += chunk;
	  	})
	  	res.on('end', function(){
	  		var info = JSON.parse(_data)
	    	if(info.errorno == 0){
	    		self.entrySuccess(info.data.guid,cb)
	    	}else{
	    		self.entryFaild(tokenkey,info.errormsg,cb)
	    	}
	  	})
		res.on("error", err => {
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
	cb({flag:false,err:err})
}
module.exports = {
	id : "sdkEntry",
	func : model,
	init : "init",
	scope : "prototype",
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}