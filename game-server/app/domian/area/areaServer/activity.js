const sign_in_day = require("../../../../config/gameCfg/sign_in_day.json")
const sign_in_cfg = require("../../../../config/gameCfg/sign_in_cfg.json")
const online_time = require("../../../../config/gameCfg/online_time.json")
const activity_lv = require("../../../../config/gameCfg/activity_lv.json")
const activity_cfg = require("../../../../config/gameCfg/activity_cfg.json")
const activity_ce = require("../../../../config/gameCfg/activity_ce.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
var main_name = "activity"
module.exports = function() {
	var self = this
	const baseInfo = {
		"signDay" : 1,
		"signCount" : 0,
		"boxDay" : 0,
		"box1" : 0,
		"box2" : 0,
		"onlineIndex" : 0,
		"normalCard" : 0,
		"normalRmb" : 0,
		"normalAward" : 0,
		"highAward" : 0
	}
	//活动数据更新
	this.activityUpdate = function(uid) {
		self.getObjAll(uid,main_name,function(data) {
			data = Object.assign({},baseInfo,data)
			for(let i in data)
				data[i] = Number(data[i])
			if(data["signCount"]){
				data["signDay"]++
				if(data["signDay"] > 30)
					data["signDay"] = 1
				data["signCount"] = 0
			}
			if(data["boxDay"] >= 7 && data["box1"] && data["box2"]){
				data["boxDay"] = 0
				data["box1"] = 0
				data["box2"] = 0
			}
			if(data["normalCard"]){
				data["normalCard"]++
				if(data["normalCard"] > 30){
					data["normalCard"] = 0
					data["normalRmb"] = 0
				}
			}
			data["normalAward"] = 0
			data["highAward"] = 0
			self.setHMObj(uid,main_name,data)
		})
	}
	//模拟充值
	this.test_recharge = function(uid,rmb,cb) {
		if(!Number.isInteger(rmb)){
			cb(false,"参数错误")
			return
		}
		setTimeout(this.recharge.bind(this,uid,rmb),3000)
		cb(true)
	}
	//充值
	this.recharge = function(uid,rmb) {
		this.incrbyLordData(uid,"rmb_day",rmb)
		this.incrbyLordData(uid,"rmb",rmb)
		this.incrbyObj(uid,main_name,"normalRmb",rmb,function(data) {
			data = Number(data)
			if((data - rmb) < activity_cfg["normal_card_rmb"]["value"] && data >= activity_cfg["normal_card_rmb"]["value"]){
				self.setObj(uid,main_name,"normalCard",1)
				var notify = {
					type : "activateNormalCard",
					normalRmb : data
				}
				self.sendToUser(uid,notify)
			}
		})
		this.checkVipLv(uid)
		var notify = {
			type : "recharge",
			rmb_day : self.players[uid].rmb_day,
			rmb : self.players[uid].rmb
		}
		self.sendToUser(uid,notify)
	}
	//获得活动数据
	this.getActivityData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(let i in data)
				data[i] = Number(data[i])
			cb(true,data)
		})
	}
	//签到
	this.gainSignInAward = function(uid,cb) {
		self.getHMObj(uid,main_name,["signCount","signDay"],function(data) {
			if(data[0] >= 2){
				cb(false,"已领完")
				return
			}
			if(data[0] == 1 && !self.players[uid].rmb_day){
				cb(false,"需要任意充值")
				return
			}
			if(data[0] == "0")
				self.incrbyObj(uid,main_name,"boxDay",1)
			self.incrbyObj(uid,main_name,"signCount",1)
			let awardList = self.addItemStr(uid,sign_in_day[data[1]]["award"])
			cb(true,awardList)
		})
	}
	//领取签到宝箱
	this.gainSignInBox = function(uid,index,cb) {
		if(!sign_in_cfg[index]){
			cb(false,"宝箱不存在")
			return
		}
		self.getHMObj(uid,main_name,["box"+index,"boxDay"],function(data) {
			for(let i in data)
				data[i] = Number(data[i])
			if(data[0]){
				cb(false,"已领取")
				return
			}
			if(data[1] < sign_in_cfg[index]["day"]){
				cb(false,"连续签到时间不足")
				return
			}
			self.incrbyObj(uid,main_name,"box"+index,1)
			let awardList = self.addItemStr(uid,sign_in_cfg[index]["award"])
			cb(true,awardList)
		})
	}
	//在线奖励
	this.gainOnlineTimeAward = function(uid,cb) {
		self.getObj(uid,main_name,"onlineIndex",function(data) {
			data = Number(data) + 1
			if(!online_time[data]){
				cb(false,"已领完")
				return
			}
			self.incrbyObj(uid,main_name,"onlineIndex",1)
			let awardList = self.addItemStr(uid,online_time[data]["award"])
			cb(true,awardList)
		})
	}
	//检查vip等级
	this.checkVipLv = function(uid) {
		if(VIP[self.players[uid].vip+1]){
			if(self.players[uid].rmb >= VIP[self.players[uid].vip+1]["rmb"]){
				this.incrbyLordData(uid,"vip",1)
				this.incrbyLordData(uid,"heroAmount",VIP[self.players[uid]["vip"]]["heroAmount"])
				var notify = {
					type : "vip",
					curLv : self.players[uid].vip,
					rmb : self.players[uid].rmb
				}
				this.sendToUser(uid,notify)
				this.checkVipLv(uid)
			}
		}
	}
	//领取vip免费礼包
	this.gainVipAward = function(uid,vip,cb) {
		if(!vip || !VIP[vip]){
			cb(false,"vip等级不存在")
			return
		}
		if(self.players[uid].vip < vip){
			cb(false,"vip等级不足 "+self.players[uid].vip+"/"+vip)
			return
		}
		self.getObj(uid,main_name,"vip_free"+vip,function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"vip_free"+vip,1)
			var awardList = self.addItemStr(uid,VIP[vip]["free_award"])
			cb(true,awardList)
		})
	}
	//购买vip付费礼包
	this.buyVipAward = function(uid,vip,cb) {
		if(!vip || !VIP[vip]){
			cb(false,"vip等级不存在")
			return
		}
		if(self.players[uid].vip < vip){
			cb(false,"vip等级不足 "+self.players[uid].vip+"/"+vip)
			return
		}
		self.getObj(uid,main_name,"vip_buy"+vip,function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.consumeItems(uid,VIP[vip]["buy_pc"],1,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					self.incrbyObj(uid,main_name,"vip_buy"+vip,1)
					var awardList = self.addItemStr(uid,VIP[vip]["buy_pa"])
					cb(true,awardList)
				}
			})
		})
	}
	//激活等级基金
	this.activateLvFund = function(uid,cb) {
		self.getObj(uid,main_name,"lv_fund",function(data) {
			if(data){
				cb(false,"已激活基金")
			}else{
				setTimeout(function() {
					self.setObj(uid,main_name,"lv_fund",1)
					self.recharge(uid,6800)
					var notify = {
						type : "activateLvFund"
					}
					self.sendToUser(uid,notify)
				},3000)
				cb(true)
			}
		})
	}
	//领取等级基金奖励
	this.gainActivityLvAward = function(uid,index,cb) {
		if(!index || !activity_lv[index]){
			cb(false,"index error"+index)
			return
		}
		if(self.players[uid].level < activity_lv[index]["lv"]){
			cb(false,"等级不足 "+self.players[uid].level+"/"+activity_lv[index]["lv"])
			return
		}
		self.getHMObj(uid,main_name,["lv_fund","lv_award"+index],function(data) {
			if(!data[0]){
				cb(false,"未激活等级基金")
				return
			}
			if(data[1]){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"lv_award"+index,1)
			var awardList = self.addItemStr(uid,activity_lv[index]["award"])
			cb(true,awardList)
		})
	}
	//领取战力奖励
	this.gainActivityCeAward = function(uid,index,cb) {
		if(!index || !activity_ce[index]){
			cb(false,"index error"+index)
			return
		}
		if(self.getCE(uid) < activity_ce[index]["ce"]){
			cb(false,"战力不足 "+self.getCE(uid)+"/"+activity_ce[index]["ce"])
			return
		}
		self.getObj(uid,main_name,"ce_award"+index,function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"ce_award"+index,1)
			var awardList = self.addItemStr(uid,activity_ce[index]["award"])
			cb(true,awardList)
		})
	}
	//领取普通月卡
	this.gainNormalCardAward = function(uid,cb) {
		self.getHMObj(uid,main_name,["normalCard","normalAward"],function(data) {
			if(data[0] == "0"){
				cb(false,"未激活普通月卡")
				return
			}
			if(data[1] != "0"){
				cb(false,"今日已领取")
				return
			}
			self.incrbyObj(uid,main_name,"normalAward",1)
			var awardList = self.addItemStr(uid,activity_cfg["normal_card_day"]["value"])
			cb(true,awardList)
		})
	}
	//激活专属月卡
	this.activateHighCard = function(uid,cb) {
		self.getObj(uid,main_name,"highCard",function(data) {
			if(data){
				cb(false,"已激活专属月卡")
			}else{
				setTimeout(function() {
					self.setObj(uid,main_name,"highCard",1)
					self.incrbyLordData(uid,"vip",1)
					self.recharge(uid,12800)
					var awardLsit = self.addItemStr(uid,activity_cfg["high_card_award"]["value"])
					var notify = {
						type : "activateHighCard",
						awardLsit : awardLsit
					}
					self.sendToUser(uid,notify)
				},3000)
				cb(true)
			}
		})
	}
	//领取专属月卡
	this.gainHighCardAward = function(uid,cb) {
		self.getHMObj(uid,main_name,["highCard","highAward"],function(data) {
			if(!data[0]){
				cb(false,"未激活专属月卡")
				return
			}
			if(data[1] != "0"){
				cb(false,"今日已领取")
				return
			}
			self.incrbyObj(uid,main_name,"highAward",1)
			var awardList = self.addItemStr(uid,activity_cfg["high_card_day"]["value"])
			cb(true,awardList)
		})
	}
}