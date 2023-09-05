//SDK获取数据模块
const async = require("async")
const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const util = require("../../../util/util.js")
const http = require('http')
const https = require('https')
const async = require('async')
const querystring = require("querystring")
var priKey = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDDxRpuKIdYQ3lRHlIHJLbwJUKJVSVORZEISw/flJmz1rXATtuiKuPSGmDvDK7qF7J0imX3gF7DPAzckd7jlL9Ri95hCj/Ovclvjq+mgkxA+KQ3JlI5HGaM+WjMi4CVhbnpfcB6t75iQfW4IV556pbQFxPg2+WOfe/IkZiXM7eRYK6KdkfTCGvFK2LJvlImmOWDHP4xVS4EAkINgBGjpYK4IBNO537/3vCykEJ5yz+W29RA9oal6EKFsLbhTdUGYuxIKbGMA8tAki6QfqzLq1WgrmOaM2cWwKtZuR3rwfq2yb10Y9xQyA1bF5qFT/y1I61f3gBpN9Thynzjpift0fglAgMBAAECggEAIVoJ96xl6m6MU3qD5P2nQOBIJpdf5KbLX4tSJ/fr+4xfqGSG3GjMKTYfP3p8rhrdZydQ2cp/2mj3k/gx7bmgombeus+BMVp538yCNi7KiOMTLuYTafFhszCmXvqBLHf8xT+MNBvrjlfIYdclfkWt7cOQumUcBZuE5zmOsmu4IUb4ArjKsEmGDqdsp3fCESzbMWqBinvOmdUy+3VbBTpSjU/PDWCd/OgnTHpwPY7O9T7zSo8grkkWyq79W5kz7PLXdtqt1DNChUjHHv+ANM3T5L127BlHDskyG24AGrDzLmCmNQab4qFtOjPtHdsXsQm8cllgzD4lvP6ThuAG8DK4IQKBgQDnoCY8CLc2kUNyibdaA5N7y4xaY9vm1t6jKf37fOS069GkUNfOb8r+Pxp70UAKzMBWZ4iVlDbEh3FU0jveYutsUUbjEB4qI19/jvUHahKzaE9DCK3HkGvjT3NkQmZ+LslS/CxJtyZl+mN8/Ur6OA7p/l8BuJMVMXY+G7mQRZVtzQKBgQDYXwZX712DP5DTLcoUwOM9mIa8UFIFoZN+lwKLq8c0wbpZ3uicU90YwCPVvuATp/fwjOgOEId8HkLeBXkbqkJRimI0y4bTPzHNk0JDlTso79ERcglA9wU4j3C6OArB0Id/u2cVSex/JW3arQt2jRk5JCSDtWn7k1cB9qPvckUbuQKBgA3nYSQtacIOyjuv5J+0oz/FIjGy2Npsf4TP2n0kLB5oIXd5mtq7fzXv18ki8HM1gz4sjNhdw0Pc1YK/8/QPgA5KerTanNTutqbTkAXX6jN2yXs+pB/cnX1RoZ2dFsXwTQl8NbRfGCD6/Mnd8og+oTaOnGlgCQQ2qeBkjakJZETpAoGBAIu/FAHHf8Y9T/SVJmexDRPDZ4JI/jDU4sZoEiTTlZ3lYc6ZwfL1118c+ggbd+46FlEvMNGkq1zmzplHP6k2lg7EKhmfOj1GG4yDB9FOmR8fhRCXbpKe+KhHPK+JcqkrXdiJ2VJOpIiaTBFoona3OwtE5LCMgx8RUqjZ+5ezXh9BAoGBAIz5//GXs1kJoGQatr0rvE4CvVLVbKHaVaXy7MAcp4uya3g1cZh3Swje8e4RD6UfiKmx+aPETfw9IkXbrPTYmXCNDx5bSbbPL+WMY8c7F7K0krOfl8Vtzg5cCfo45+IsLCM16sDT0MhLCPUMWj0kcd4bKcAc3CENaL3U03oLE58r"
var pubKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAopmeYiESjI6lVQCVOV5KoNqMy4eKYOs91cF2vETJ6i4q2fp94LLCUQlVV9LzhHnyyRh/fe4ehlfRr/e1ERxQKqB60D+N58+rdH6Is8053WAiTjaChR9avKp23ZFcdhc5TFFCTsD00bWVMPUUxBzxwFft/ZhEbXepi6Aex33L1vfyHWkjt4ZofdIImj+ffEnOnCn5VQcmdthIH6hSZdn1NXD+Dpf3Z8Ik0jamBkQAU9OYiyR7ds3i5+ndISMPkLJM0VGnqext/n4WRh8gUPd6t384mOgrZTgufS0n6/0p+PezNUI3Kud+6q/fGPlaf7rCXkBPVBBPFhyv8jySX0HW6QIDAQAB"
var model = function() {
	var self = this
	var posts = {}
	var local = {}
	this.init = function (server,serverManager) {
		this.key = new NodeRSA(priKey,'pkcs8-private')
		this.serverManager = serverManager
		for(var key in posts){
			console.log("注册",key)
			server.post(key,posts[key])
		}
	}

	// Response字段	类型	必选	说明
	// bizResp	String	是	响应参数，值为每个接口对应响应参数的JSON字符串
	// apiMethod	String	是	接口名称
	// respTime	String	是	响应时间，格式使用ISO8601规范，示例：2023-03-09T14:41:19+0800
	// appkey	String	是	游戏appkey
	// gameType	String	是	游戏端类型，网游为client H5游戏为 h5
	// signature	String	是	响应签名（签名方式参见下文）
	// osType	String	否	系统类型，ios或android
	//获取角色信息
	posts["/x7sy_roleQuery"] = function(req,res) {
		var body = req.body
		var data = JSON.parse(body.bizParams)
		var info = {
			bizResp : {
				respCode : "SUCCESS",
				respMsg : "SUCCESS",
				role : {},
				guidRoles : []
			},
			apiMethod : body.apiMethod,
			respTime : body.reqTime,
			appkey : this.sdkPay.sdkConfig["AppKey"]["value"],
			gameType : body.gameType,
			signature : body.signature,
			osType : body.osType
		}
		if(data.roleId){
			self.redisDao.db.hmget("player:user:"+data.roleId+":playerInfo",["accId","areaId"],function(err,list) {
				self.redisDao.db.hget("acc:user:"+list[0]+":base","unionid",function(err,unionid) {
					self.getx7syRole(unionid,list[1],function(flag,roleData) {
						if(!flag){
							info.bizResp.respCode = "FAILD"
							info.bizResp.respMsg = roleData
						}else{
							info.bizResp.role = roleData
						}
						self.x7syhashSign(info)
						res.send(info)
					})
				})
			})
		}else if(data.guids){
			self.getx7syRoleList(data.guids,data.serverId,function(roles) {
				info.bizResp.guidRoles = roles
				self.x7syhashSign(info)
				res.send(info)
			})
		}else{
			self.x7syhashSign(info)
			res.send(info)
		}
	}
}
//小七敏感词屏蔽  test https://api.x7sy.com/x7DetectionHelper/gateway
model.prototype.x7syMessageDetect = function(guid,os,message,cb) {
	var self = this
	var bizParams = {"guid":guid,"detectionMessage":message}
	self.x7syRequest(bizParams,"x7Detection.messageDetect",function(data) {
		console.log(data)
		if(daya.respCode != "SUCCESS"){
			cb(false)
			return
		}
		var bizResp = JSON.parse(data.bizResp)
		var detectResult = bizResp.detectResult
		if(detectResult.level != 1){
			if(detectResult.sensitiveWords.length)
				for(var i = 0;i < detectResult.sensitiveWords.length;i++)
					message.replaceAll(detectResult.sensitiveWords[i],"*")
			self.x7syMessageDetectReport(detectResult.detectionLogId,3)
		}
		cb(true,message,detectResult.level)
	})
}
//小七敏感词上报
model.prototype.x7syMessageDetectReport = function(detectionLogId,operateType) {
	self.x7syRequest({detectionLogId:detectionLogId,operateType:operateType},"x7Detection.messageDetectReport",function(data) {
		console.log("敏感词上报",data)
	})
}
//小七接口
model.prototype.x7syRequest = function(bizParams,apiMethod,cb) {
	var options={
	  hostname:'api.x7sy.com',
	  port:443,
	  path:'/x7DetectionHelper/gateway',
	  method:'POST',
	  headers:{
	    "Content-Type":"application/x-www-form-urlencoded",
	  }
	}
	var info = {
		bizParams : bizParams,
		apiMethod : apiMethod,
		reqTime : new Date().toISOString(),
		appkey : this.sdkPay.sdkConfig["AppKey"]["value"],
		gameType : "client",
		osType : "android"
	}
	this.x7syRequestSign(info)
	var req=https.request(options,function(res){
	var _data='';
	res.on('data', function(chunk){
	   _data += chunk;
	});
	res.on('end', function(){
		_data = JSON.parse(_data)
		cb(_data)
	 });
	})
	req.on('error', function(e) {
	  console.log(e)
	})
	console.log(info)
	info = querystring.stringify(info)
	req.write(info);
	req.end()
}
model.prototype.getTimeStamp = function() {
    var parts = isostr.match(/d+/g);
    return new Date(parts[0]+'-'+parts[1]+'-'+parts[2]+' '+parts[3]+':'+parts[4]+':'+parts[5]).getTime();
}
//小七回调签名 POST + 空格 + $apiMethod + @ + $appkey + # + $gameType + . + $respTime + \n\n + $bizResp
model.prototype.x7syhashSign = function(info) {
	info.bizResp = JSON.stringify(info.bizResp)
	var appkey = this.sdkPay.sdkConfig["AppKey"]["value"]
	var payload = "POST "+info.apiMethod+"@"+appkey+"#"+info.gameType+"."+info.respTime+"\n\n"+info.bizResp
	// console.log("payload",payload)
    info.signature = this.key.sign(payload,"base64","base64")
}
//小七请求签名
model.prototype.x7syRequestSign = function(info) {
	info.bizParams = JSON.stringify(info.bizParams)
	var appkey = this.sdkPay.sdkConfig["AppKey"]["value"]
	var payload = "POST "+info.apiMethod+"@"+appkey+"#"+info.gameType+"."+info.reqTime+"\n\n"+info.bizParams
	// console.log("payload",payload)
    info.signature = key.sign(Buffer.from(payload),"base64").toString("base64")
}
//批量获取角色信息
model.prototype.getx7syRoleList = async function(guids,serverId,cb) {
	var self = this
	var list = []
	for(let i = 0;i < guids.length;i++){
		if(serverId){
			list.push({"unionid" : guids[i],"serverId":serverId})
		}else{
			var gList = await self.getx7syServerAwait(guids[i])
			list = list.concat(gList)
		}
	}
	var roles = []
	for(let i = 0;i < list.length;i++){
		role = await self.getx7syRoleAwait(list[i].unionid,list[i].serverId)
		roles.push(role)
	}
	cb(roles)
}
//异步获取服务器列表
model.prototype.getx7syServerAwait = function(unionid) {
	var self = this
	return new Promise(function(resolve) {
		self.redisDao.db.hget("acc:accMap:unionid",unionid,function(err,accId) {
			self.redisDao.db.hgetall("acc:user:"+accId+":areaMap",function(err,data) {
				var list = []
				for(var i in data){
					list.push({"unionid" : unionid,"serverId":i})
				}
				resolve(list)
			})
		})
	})
}
//异步获取角色数据
model.prototype.getx7syRoleAwait = function(unionid,serverId) {
	var self = this
	return new Promise(function(resolve) {
		self.getx7syRole(unionid,serverId,function(flag,roleData) {
			resolve(roleData)
		})
	})
}
// Role字段	类型 (长度)	必选	说明
// roleId	String (64)	是	游戏角色ID
// guid	String (64)	是	小7小号ID
// roleName	String (100)	是	角色名称
// serverId	String (64)	是	角色所属区服ID
// serverName	String (64)	是	角色所属区服名称
// roleLevel	String (100)	是	角色等级， 示例：100，无此属性可留空
// roleCE	String (100)	是	角色战力，示例：20000，无此属性可留空
// roleStage	String (100)	是	角色关卡，示例：2-3，无此属性可留空
// roleRechargeAmount	Float (10,2)	是	角色总充值，精度为小数点后2位，无此属性可留空
// roleGuild	String (100)	否	角色所属公会，无此属性可不传
model.prototype.getx7syRole = function(unionid,serverId,cb) {
	var self = this
	var role = {}
	async.waterfall([
		function(next) {
			role.guid = unionid
			self.redisDao.db.hget("acc:accMap:unionid",unionid,function(err,data) {
				if(!data){
					next("账号不存在")
					return
				}
				role.accId = data
				next()
			})
		},
		function(next) {
			//获取角色ID
			self.redisDao.db.hget("acc:user:"+role.accId+":areaMap",serverId,function(err,data) {
				if(!data){
					next("角色不存在")
					return
				}
				role.roleId = data
				next()
			})
		},
		function(next) {
			//获取基础数据
			self.redisDao.db.hgetall("player:user:"+role.roleId+":playerInfo",function(err,userInfo) {
				if(err || !userInfo){
					next("角色不存在")
				}else{
					role.roleName = userInfo.name
					role.serverId = userInfo.areaId
					role.serverName = userInfo.areaId+"服"
					role.roleLevel = userInfo.level
					role.roleCE = userInfo.CE
					role.roleRechargeAmount = Number((Number(userInfo.real_rmb)/100).toFixed(2))
					role.roleGuild = userInfo.gname
					next()
				}
			})
		},
		function(next) {
			//获取关卡
			self.redisDao.db.hget("player:user:"+role.roleId+":playerData","boss",function(err,boss) {
				role.roleStage = boss || "0"
				cb(true,role)
			})
		}
	],function(err) {
		cb(false,err)
	})
}
module.exports = {
	id : "sdkQuery",
	func : model,
	scope : "prototype",
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "payDao",
		ref : "payDao"
	},{
		name : "sdkPay",
		ref : "sdkPay"
	}]
}