const stringRandom = require('string-random');
const pay_cfg = require("../../config/gameCfg/pay_cfg.json")
const uuid = require("uuid")
const async = require("async")
var mysql = require("./mysql/mysql.js")
var payDao = function() {}
payDao.prototype.init  = function() {
	this.db = this.mysqlDao.db
}
//创建充值订单
payDao.prototype.createGameOrder = function(otps,cb) {
	var self = this
	sql = 'insert into game_order SET ?'
	// console.log("createGameOrder",otps,pay_cfg[otps.pay_id])
	var info = {
		game_order : uuid.v1(),
		pay_id : otps.pay_id,
		goodsName : pay_cfg[otps.pay_id]["name"],
		amount : pay_cfg[otps.pay_id]["rmb"],
		userName : otps.userName,
		unionid : otps.unionid,
		accId : otps.accId,
		uid : otps.uid,
		create_time : Date.now(),
		status : 2,
		areaId : otps.areaId,
		extras_params : otps.extras_params || ""
	}
    this.db.query(sql,info, function(err, res) {
        if (err) {
            // console.error('createCDType! ' + err.stack);
            cb(false,err)
        }else{
            info.messagetype = "createGameOrder"
            self.cacheDao.saveCache(info)
            cb(true,info)
        }
    })
}
//完成充值订单
payDao.prototype.checkGameOrder = function(res,otps,cb) {
	var self = this
	var sql = "select * from game_order where game_order = ?"
	self.db.query(sql,[otps.game_order], function(err, res) {
		if(err || !res){
			console.error(err)
			self.faildOrder("订单不存在",otps)
			res.send("SUCCESS")
			cb(false,"finishGameOrder game_order err")
			return
		}
		res =JSON.parse( JSON.stringify(res))
		var data = res[0]
		if(err || !data){
			console.error("订单不存在",err)
			self.faildOrder("订单不存在",otps)
			res.send("SUCCESS")
			cb(false,"finishGameOrder game_order err")
		}else{
			if(data.status == 0){
				self.faildOrder("订单已完成",otps,data)
				res.send("SUCCESS")
				cb(false)
			}else if(Number(otps.amount) < data.amount){
				self.faildOrder("充值金额错误",otps,data)
				res.send("SUCCESS")
				cb(false,"充值金额错误",data)
			}else{
				if(otps.status != 0){
					//支付失败
					sql = 'update game_order SET status=? where game_order = ?'
					self.db.query(sql,[otps.status,otps.game_order],function(){})
					res.send("SUCCESS")
					cb(false,"充值失败")
				}else{
					otps.uid = data.uid
					otps.pay_id = data.pay_id
					otps.areaId = data.areaId
					otps.goodsName = pay_cfg[data.pay_id]["name"]
					cb(true,null,data,otps)
				}
			}
		}
	})
}
//订单支付完成
payDao.prototype.overGameOrder = function(otps) {
	sql = 'update game_order SET pay_time=?,status=0,order_no=?,channel_code=?,channel_uid=? where game_order = ?'
	this.db.query(sql,[Date.now(),otps.order_no,otps.channel,otps.channel_uid,otps.game_order],function(){})
}
payDao.prototype.faildOrder = function(str,sdkInfo,gameInfo) {
	var info = {
		game_order : sdkInfo ? sdkInfo.game_order : "",
		err : str,
		sdkInfo : sdkInfo,
		gameInfo : gameInfo
	}
	this.redisDao.db.rpush("pay_faild_order",JSON.stringify(info))
}
payDao.prototype.updateRmb = function(info) {
	var self = this
	info.amount = Number(info.amount) || 0
	var sql = 'update user_list SET totalRmb=totalRmb+?,lateRmb=? where uid=?'
	var args = [info.amount,info.amount,info.uid];
	self.mysqlDao.db.query(sql,args, function(err, res) {
		if (err) {
			console.error('update user_list! ' + err.stack);
		}
	})
	self.redisDao.db.hincrbyfloat("game:info","amount",info.amount)
	self.redisDao.db.hincrby("area:area"+info.areaId+":areaInfo","day_play_count",1)
	self.redisDao.db.hincrby("area:area"+info.areaId+":areaInfo","all_play_count",1)
	self.redisDao.db.hincrbyfloat("area:area"+info.areaId+":areaInfo","day_play_amount",info.amount)
	self.redisDao.db.hincrbyfloat("area:area"+info.areaId+":areaInfo","all_play_amount",info.amount)
	self.redisDao.db.hget("player:user:"+info.uid+":playerInfo","createTime",function(err,createTime) {
		createTime = Number(createTime)
		if((new Date(createTime)).toLocaleDateString() == (new Date()).toLocaleDateString()){
			//新角色充值
			self.mysqlDao.addDaylyData("n_pay_amount",info.amount)
			self.mysqlDao.addDaylyData("n_pay_number",1)
		}
		self.mysqlDao.addDaylyData("a_pay_amount",info.amount)
		self.mysqlDao.addDaylyData("a_pay_number",1)
		self.mysqlDao.updateLTV(info.uid,info.amount,createTime)
	})
}
module.exports = {
	id : "payDao",
	func : payDao,
	init : "init",
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "cacheDao",
        ref : "cacheDao"
	},{
		name : "mysqlDao",
		ref : "mysqlDao"
	}]
}

// var model = new payDao()
// model.init()
// model.createGameOrder({
// 		pay_id : 5004,
// 		userName : "wfd",
// 		unionid : 123,
// 		accId : 1234,
// 		uid : 12345,
// 		channel_code : 12,
// 		channel_uid : 12,
// 		areaId : 1
// 	},function(flag,data) {
// 	console.log(flag,data)
// })
// model.finishGameOrder({game_order:"0092a790-d000-11ea-a2a4-1f542f74ca49",order_no:"sdasdasa",status:0,amount:"12.8",channel_uid : 12,channel : "12"},(flag,str,data)=>{
// 	console.log(flag,str,data)
// })
	// var sql = "select * from game_order where game_order = ?"
	// model.db.query(sql,["0092a790-d000-11ea-a2a4-1f542f74ca49"], function(err, res) {console.log(res)})