//数据库查询
var http = require("http")
var model = function() {
	var self = this
	var posts = {}
	var local = {}
	this.init = function (server,mysqlDao,redisDao) {
		self.mysqlDao = mysqlDao
		self.redisDao = redisDao
		for(var key in posts){
			server.post(key,posts[key])
		}
	}
	//清聊天记录
	posts["/clearChatRecord"] = function(req,res) {
		var url = "http://127.0.0.1:5081/clearChatRecord"
		http.get(url,function(res){})
		res.send("SUCCESS")
	}
	//封号
	posts["/freezeAcc"] = function(req,res) {
		var data = req.body
		console.log("freezeAcc",data)
		var url = "http://127.0.0.1:5081/freezeAcc?uid="+data.uid+"&value="+data.value
		http.get(url,function(res){})
		res.send("SUCCESS")
	}
	//清除战斗校验错误数据
	posts["/verify_clear"] = function(req,res) {
		self.redisDao.db.llen("verify_faild",function(err,total) {
			self.redisDao.db.del("verify_faild",function(err,data) {
				res.send()
			})
		})
	}
	//获取战斗校验错误日志
	posts["/verify_faild"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var info = {}
		self.redisDao.db.llen("verify_faild",function(err,total) {
			info.total = total
			self.redisDao.db.lrange("verify_faild",(pageCurrent-1)*pageSize,(pageCurrent)*pageSize,function(err,data) {
				info.list = data
				res.send(info)
			})
		})
	}
	//获取总数据
	posts["/game_info"] = function(req,res) {
		var data = req.body
		var info = {}
		self.redisDao.db.hgetall("game:info",function(err,data) {
			info.list = data
			res.send(data)
		})
	}
	//获取服务器列表
	posts["/areaInfos"] = function(req,res) {
		var data = req.body
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
		if(data.beginTime)
			arr.push({key : "pay_time",value : data.beginTime,type:"more"})
		if(data.endTime)
			arr.push({key : "pay_time",value : data.endTime,type:"less"})
		var info = local.getSQL("game_order",arr,pageSize,pageCurrent,"id")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			if(!pageSize || !pageCurrent){
				if(info.total >= 10000){
					res.send({"err" : "数据过长"})
					return
				}
			}
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
		if(data.beginTime)
			arr.push({key : "time",value : data.beginTime,type:"more"})
		if(data.endTime)
			arr.push({key : "time",value : data.endTime,type:"less"})
		var info = local.getSQL("item_log",arr,pageSize,pageCurrent,"id")
		var sql1 = info.sql1
		var sql2 = info.sql2
		var args1 = info.args1
		var args2 = info.args2
		var info = {}
		self.mysqlDao.db.query(sql1,args1,function(err,total) {
			info.total = JSON.parse(JSON.stringify(total))[0]["count(*)"]
			if(!pageSize || !pageCurrent){
				if(info.total >= 10000){
					res.send({"err" : "数据过长"})
					return
				}
			}
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
	//获取单日记录
	posts["/daily_table"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		var info = local.getSQL("daily_table",arr,pageSize,pageCurrent,"id")
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
	//获取留存记录
	posts["/retention_table"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		var info = local.getSQL("retention_table",arr,pageSize,pageCurrent,"id")
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
	//获取LTV记录
	posts["/LTV_table"] = function(req,res) {
		var data = req.body
		var pageSize = data.pageSize
		var pageCurrent = data.pageCurrent
		var arr = []
		var info = local.getSQL("LTV_table",arr,pageSize,pageCurrent,"id")
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
	//获取跨服数据
	posts["/cross_grading"] = function(req,res) {
		self.redisDao.db.zrevrange(["cross:grading:rank",0,-1,"WITHSCORES"],function(err,list) {
			console.log(err,list)
			var uids = []
			var areaIds = []
			var scores = []
			for(var i = 0;i < list.length;i+=2){
				var strList = list[i].split("|")
				var areaId = Number(strList[0])
				var uid = Number(strList[1])
				if(uid > 10000){
					uids.push(uid)
					areaIds.push(areaId)
					scores.push(list[i+1])
				}
			}
			var info = {
				uids : uids,
				areaIds : areaIds,
				scores : scores
			}
			local.getPlayerBaseByUids(uids,function(userInfos) {
				info.userInfos = userInfos
				res.send(info)
			})
		})
	}
	//获取王者巅峰赛数据
	posts["/cross_peak"] = function(req,res) {
		self.redisDao.db.zrevrange(["cross:grading:rank",0,-1,"WITHSCORES"],function(err,list) {
			console.log(err,list)
			var uids = []
			var areaIds = []
			var scores = []
			for(var i = 0;i < list.length;i+=2){
				var strList = list[i].split("|")
				var areaId = Number(strList[0])
				var uid = Number(strList[1])
				if(uid > 10000){
					uids.push(uid)
					areaIds.push(areaId)
					scores.push(list[i+1])
				}
			}
			var info = {
				uids : uids,
				areaIds : areaIds,
				scores : scores
			}
			local.getPlayerBaseByUids(uids,function(userInfos) {
				info.userInfos = userInfos
				res.send(info)
			})
		})
	}
	//批量获取玩家基本数据
	local.getPlayerBaseByUids = function(uids,cb) {
		if(!uids.length){
			cb([])
			return
		}
		var multiList = []
		for(var i = 0;i < uids.length;i++){
			multiList.push(["hmget","player:user:"+uids[i]+":playerInfo",["name","head","level","vip","offline","CE","figure","title","frame"]])
		}
		self.redisDao.multi(multiList,function(err,list) {
			var userInfos = []
			for(var i = 0;i < uids.length;i++){
				let info = {}
				if(uids[i] < 10000){
					info = self.robots[uids[i]]
				}else{
					info = {
						uid : uids[i],
						name : list[i][0],
						head : list[i][1],
						level : list[i][2],
						vip : list[i][3],
						offline : list[i][4],
						ce : list[i][5],
						figure : list[i][6],
						title : list[i][7],
						frame : list[i][8],
					}
				}
				userInfos.push(info)
			}
			cb(userInfos)
		})
	}
	local.getSQL = function(tableName,arr,pageSize,pageCurrent,key) {
		var sql1 = "select count(*) from "+tableName
		var sql2 = "select * from "+tableName	
		var args1 = []
		var args2 = []
		for(var i = 0;i < arr.length;i++){
			var sign = "="
			switch(arr[i]["type"]){
				case "more":
					sign = ">"
				break
				case "less":
					sign = "<"
				break
				default:
					sign = "="
			}
			if(i == 0){
				sql1 += " where "+arr[i]["key"]+" "+sign+" ?"
				sql2 += " where "+arr[i]["key"]+" "+sign+" ?"
			}else{
				sql1 += " and "+arr[i]["key"]+" "+sign+" ?"
				sql2 += " and "+arr[i]["key"]+" "+sign+" ?"
			}
			args1.push(arr[i]["value"])
			args2.push(arr[i]["value"])
		}
		sql2 += " order by "+key
		if(pageSize && pageCurrent){
			sql2 += " desc LIMIT ?,"+pageSize
			args2.push((pageCurrent-1)*pageSize)
		}
		// console.log("getSQL sql1",sql1,"sql2",sql2,args1,args2)
		return {sql1:sql1,sql2:sql2,args1:args1,args2:args2}
	}
}
module.exports = new model()