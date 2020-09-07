const stringRandom = require('string-random');
const pay_cfg = require("../../config/gameCfg/pay_cfg.json")
const uuid = require("uuid")
var mysql = require("./mysql/mysql.js")
var payDao = function() {}
payDao.prototype.init  = function() {
	this.db = this.mysqlDao.db
}
//创建充值订单
payDao.prototype.createGameOrder = function(otps,cb) {
	var self = this
	sql = 'insert into game_order SET ?'
	console.log("uuid",uuid.v1())
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
payDao.prototype.finishGameOrder = function(otps,cb) {
	var self = this
	var sql = "select * from game_order where game_order = ?"
	self.db.query(sql,[otps.game_order], function(err, res) {
		if(err || !res){
			console.error(err)
			self.faildOrder("订单不存在",otps)
			cb(false,"finishGameOrder game_order err")
			return
		}
		res =JSON.parse( JSON.stringify(res))
		var data = res[0]
		if(err || !data){
			console.error("订单不存在",err)
			self.faildOrder("订单不存在",otps)
			cb(false,"finishGameOrder game_order err")
		}else{
			if(data.status == 0){
				self.faildOrder("订单已完成",otps,data)
				cb(false,null,data)
			}else if(Number(otps.amount) != data.amount){
				self.faildOrder("充值金额不对应",otps,data)
				cb(false,"充值金额不对应",data)
			}else{
				if(otps.status != 0){
					//支付失败
					sql = 'update game_order SET status=? where game_order = ?'
					self.db.query(sql,[otps.status,otps.game_order],function(){})
					cb(false,"充值失败")
				}else{
					sql = 'update game_order SET pay_time=?,status=0,order_no=?,channel_code=?,channel_uid=? where game_order = ?'
					self.db.query(sql,[Date.now(),otps.order_no,otps.channel,otps.channel_uid,otps.game_order],function(){})
					otps.uid = data.uid
					otps.pay_id = data.pay_id
					otps.areaId = data.areaId
					otps.messagetype = "finishGameOrder"
					otps.goodsName = pay_cfg[data.pay_id]["name"]
					self.cacheDao.saveCache(otps)
					cb(true,null,data)
				}
			}
		}
	})
}
//完成充值订单
payDao.prototype.finishGameOrderJianwan = function(otps,cb) {
	var self = this
	var sql = "select * from game_order where game_order = ?"
	self.db.query(sql,[otps.extras_params], function(err, res) {
		if(err || !res){
			console.error(err)
			self.faildOrder("订单不存在",otps)
			cb(false,"finishGameOrder game_order err")
			return
		}
		res =JSON.parse( JSON.stringify(res))
		var data = res[0]
		if(err || !data){
			console.error("订单不存在",err)
			self.faildOrder("订单不存在",otps)
			cb(false,"finishGameOrder game_order err")
		}else{
			if(data.status == 0){
				self.faildOrder("订单已完成",otps,data)
				cb(false,null,data)
			}else if(Number(otps.amount) != data.amount){
				self.faildOrder("充值金额不对应",otps,data)
				cb(false,"充值金额不对应",data)
			}else{
				if(otps.status != 0){
					//支付失败
					sql = 'update game_order SET status=? where game_order = ?'
					self.db.query(sql,[otps.status,otps.extras_params],function(){})
					cb(false,"充值失败")
				}else{
					sql = 'update game_order SET pay_time=?,status=0,order_no=?,channel_code=?,channel_uid=? where game_order = ?'
					self.db.query(sql,[Date.now(),otps.order_no,otps.channel,otps.channel_uid,otps.extras_params],function(){})
					otps.uid = data.uid
					otps.pay_id = data.pay_id
					otps.areaId = data.areaId
					otps.messagetype = "finishGameOrder"
					otps.goodsName = pay_cfg[data.pay_id]["name"]
					self.cacheDao.saveCache(otps)
					cb(true,null,data)
				}
			}
		}
	})
}
payDao.prototype.faildOrder = function(str,sdkInfo,gameInfo) {
	console.error(str,sdkInfo)
	var info = {
		err : str,
		sdkInfo : sdkInfo,
		gameInfo : gameInfo
	}
	this.redisDao.db.hset("pay_faild_order",sdkInfo.game_order,JSON.stringify(info))
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