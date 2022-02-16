//数据库查询
var sdkConfig = require("../../../config/sysCfg/sdkConfig.json")
var util = require("../../../util/util.js")
var Md5_Key = sdkConfig["Md5_Key"]
var model = function() {
	var self
	var posts = {}
	var local = {}
	this.init = function (server,serverManager) {
		self = serverManager
		for(var key in posts){
			console.log("注册",key)
			server.post(key,posts[key])
		}
	}
	//获取服务器列表
	posts["/areaInfos"] = function(req,res) {
		var data = req.body
		console.log("areaInfos",data)
		self.redisDao.db.get("area:lastid",function(err,lastid) {
			var multiList = []
			for(var i = 1;i <= lastid;i++){
				multiList.push(["hgetall","area:area"+i+":areaInfo"])
			}
			self.redisDao.multi(multiList,function(err,list) {
				res.send(list)
			})
		})
	}
	//获取玩家列表
	posts["/user_list"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		if(data.uid)
			arr.push({key : "uid",value : data.uid})
		if(data.userName)
			arr.push({key : "userName",value : data.userName})
		if(data.accId)
			arr.push({key : "accId",value : data.accId})
		if(data.gname)
			arr.push({key : "gname",value : data.gname})
		if(data.area)
			arr.push({key : "area",value : data.area})
		var info = local.getSQL("user_list",arr,pageSize,pageCurrent,"uid")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			self.mysqlDao.db.query(sql2,args2, function(err, list) {
				if (err) {
					// console.log('getCDTypeList! ' + err.stack);
					return
				}
				info.list = JSON.parse(JSON.stringify(list))
				res.send(info)
			})
		})
	}
	//获取订单记录
	posts["/game_order"] = function(req,res) {
		console.log("game_order")
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		if(data.uid)
			arr.push({key : "uid",value : data.uid})
		if(data.accId)
			arr.push({key : "accId",value : data.accId})
		if(data.areaId)
			arr.push({key : "areaId",value : data.areaId})
		if(data.userName)
			arr.push({key : "userName",value : data.userName})
		if(data.pay_id)
			arr.push({key : "pay_id",value : data.pay_id})
		if(data.game_order)
			arr.push({key : "game_order",value : data.game_order})
		if(data.order_no)
			arr.push({key : "order_no",value : data.order_no})
		if(data.status)
			arr.push({key : "status",value : data.status})
		var info = local.getSQL("game_order",arr,pageSize,pageCurrent,"id")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			self.mysqlDao.db.query(sql2,args2, function(err, list) {
				if (err) {
					// console.log('getCDTypeList! ' + err.stack);
					return
				}
				info.list = JSON.parse(JSON.stringify(list))
				res.send(info)
			})
		})
	}
	//获取聊天记录
	posts["/getChat"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		if(data.uid)
			arr.push({key : "uid",value : data.uid})
		if(data.room)
			arr.push({key : "roomName",value : data.room})
		var info = local.getSQL("chat_record",arr,pageSize,pageCurrent,"id")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			self.mysqlDao.db.query(sql2,args2, function(err, list) {
				if (err) {
					// console.log('getCDTypeList! ' + err.stack);
					return
				}
				info.list = JSON.parse(JSON.stringify(list))
				res.send(info)
			})
		})
	}
	//获取邮件日志
	posts["/mail_log"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		if(data.uid)
			arr.push({key : "uid",value : data.uid})
		if(data.admin)
			arr.push({key : "admin",value : data.admin})
		if(data.areaId)
			arr.push({key : "areaId",value : data.areaId})
		var info = local.getSQL("mail_log",arr,pageSize,pageCurrent,"id")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			self.mysqlDao.db.query(sql2,args2, function(err, list) {
				if (err) {
					// console.log('getCDTypeList! ' + err.stack);
					return
				}
				info.list = JSON.parse(JSON.stringify(list))
				res.send(info)
			})
		})
	}
	//获取登陆日志
	posts["/login_log"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		if(data.uid)
			arr.push({key : "uid",value : data.uid})
		if(data.accId)
			arr.push({key : "accId",value : data.accId})
		if(data.userName)
			arr.push({key : "userName",value : data.userName})
		var info = local.getSQL("login_log",arr,pageSize,pageCurrent,"id")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			self.mysqlDao.db.query(sql2,args2, function(err, list) {
				if (err) {
					// console.log('getCDTypeList! ' + err.stack);
					return
				}
				info.list = JSON.parse(JSON.stringify(list))
				res.send(info)
			})
		})
	}
	//获取道具日志
	posts["/item_log"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		if(data.uid)
			arr.push({key : "uid",value : data.uid})
		if(data.itemId)
			arr.push({key : "itemId",value : data.itemId})
		if(data.reason)
			arr.push({key : "reason",value : data.reason})
		if(data.type)
			arr.push({key : "type",value : data.type})
		var info = local.getSQL("item_log",arr,pageSize,pageCurrent,"id")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			self.mysqlDao.db.query(sql2,args2, function(err, list) {
				if (err) {
					// console.log('getCDTypeList! ' + err.stack);
					return
				}
				info.list = JSON.parse(JSON.stringify(list))
				res.send(info)
			})
		})
	}
	//获取角色列表
	posts["/getRoleList"] = function(req,res) {
		var data = req.body
		console.log("getRoleList",data)
		var account_id = data.account_id
		if(!account_id){
			res.send({
				"error_code" : 1,
				"message" : "account_id : "+account_id
			})
		}else{
			self.accountDao.getRoleList(account_id,function(flag,data) {
				var info = {
					"error_code" : 0,
					"message" : "Thành công",
					"data" : data
				}
				res.send(info)
			})
		}
	}
	//使用激活码
	posts["/giftcode"] = function(req,res) {
		var data = req.body
		console.log("getRoleList",data)
		var app_key = data.app_key
		var account_id = data.account_id
		var uid = data.role_id
		var areaId = data.area_id
		var key = data.giftcode
		var app_key = data.app_key
		if(!sdkConfig.app_keys[app_key]){
			res.send({
				"error_code" : 1,
				"message" : "app_key 错误"
			})
			return
		}
		var v_sign = util.md5(data.app_key+data.account_id+data.role_id+data.area_id+data.giftcode+sdkConfig.app_keys[app_key]["secret_key"])
		if(v_sign != data.signature){
			res.send({
				"error_code" : 1,
				"message" : "签名验证失败"
			})
			return
		}
		//检查signature
		self.playerDao.getPlayerInfo({uid:uid},function(playerInfo) {
			console.log("playerInfo",playerInfo)
			if(!playerInfo || !playerInfo.areaId || !playerInfo.name){
				res.send({
					"error_code" : 1,
					"message" : "Thành công"
				})
				return
			}
			if(playerInfo.areaId != areaId){
				res.send({
					"error_code" : 1,
					"message" : "Thành công"
				})
				return
			}
			self.CDKeyDao.verifyCDKey(key,uid,areaId,playerInfo.name,function(flag,str) {
				if(!flag){
					res.send({
						"error_code" : 1,
						"message" : str
					})
				}else{
					var serverId = self.areaDeploy.getServer(areaId)
					self.app.rpc.area.areaRemote.sendMail.toServer(serverId,uid,areaId,"Mã gói","Bạn đã lấy được mã gói thành công!",str,null)
					res.send({
						"error_code" : 0,
						"message" : "Thành công"
					})
				}
			})
		})
	}
	//添加开服计划
	posts["/getOpenPlan"] = function(req,res) {
		var data = req.body
		console.log("getOpenPlan",data)
		var time = data.time
		self.setOpenPlan(time,function(flag,err) {
			res.send({flag:flag,err:err})
		})
	}
	//获取开服计划表
	posts["/getOpenPlan"] = function(req,res) {
		var data = req.body
		console.log("getOpenPlan",data)
		self.getOpenPlan(time,function(flag,data) {
			res.send({flag:flag,data:data})
		})
	}
	//删除开服计划
	posts["/delOpenPlan"] = function(req,res) {
		var data = req.body
		console.log("delOpenPlan",data)
		var time = data.time
		self.delOpenPlan(time,function(flag,err) {
			res.send({flag:flag,err:err})
		})
	}
	//添加合服计划
	posts["/setMergePlan"] = function(req,res) {
		var data = req.body
		console.log("setMergePlan",data)
		var time = data.time
		var areaList = data.areaList
		self.setMergePlan(areaList,time,function(flag,err) {
			res.send({flag:flag,err:err})
		})
	}
	//获取合服计划表
	posts["/getMergePlan"] = function(req,res) {
		var data = req.body
		console.log("getMergePlan",data)
		self.getMergePlan(function(flag,data) {
			res.send({flag:flag,data:data})
		})
	}
	//删除合服计划
	posts["/delMergePlan"] = function(req,res) {
		var data = req.body
		console.log("delMergePlan",data)
		var time = data.time
		self.delMergePlan(time,function(flag,err) {
			res.send({flag:flag,err:err})
		})
	}
	local.getSQL = function(tableName,arr,pageSize,pageCurrent,key) {
		var sql1 = "select count(*) from "+tableName
		var sql2 = "select * from "+tableName	
		var args1 = []
		var args2 = []
		for(var i = 0;i < arr.length;i++){
			if(i == 0){
				sql1 += " where "+arr[i]["key"]+" = ?"
				sql2 += " where "+arr[i]["key"]+" = ?"
			}else{
				sql1 += " and "+arr[i]["key"]+" = ?"
				sql2 += " and "+arr[i]["key"]+" = ?"
			}
			args1.push(arr[i]["value"])
			args2.push(arr[i]["value"])
		}
		sql2 += " order by "+key+" desc LIMIT ?,"+pageSize
		args2.push((pageCurrent-1)*pageSize)
		console.log("getSQL sql1",sql1,"sql2",sql2,args1,args2)
		return {sql1:sql1,sql2:sql2,args1:args1,args2:args2}
	}
	local.getRoleList = function(account_id,cb) {
			self.accountDao.getRoleList(account_id,function(flag,data) {
				cb(data)
			})
	}
}
module.exports = new model()