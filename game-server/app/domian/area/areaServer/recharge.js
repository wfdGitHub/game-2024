const recharge = require("../../../../config/gameCfg/recharge.json")
const recharge_total = require("../../../../config/gameCfg/recharge_total.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
const activity_cfg = require("../../../../config/gameCfg/activity_cfg.json")
const awardBag_day = require("../../../../config/gameCfg/awardBag_day.json")
const war_horn = require("../../../../config/gameCfg/war_horn.json")
const gift_list = require("../../../../config/gameCfg/gift_list.json")
const gift_week = require("../../../../config/gameCfg/gift_week.json")
const gift_month = require("../../../../config/gameCfg/gift_month.json")
const pay_cfg = require("../../../../config/gameCfg/pay_cfg.json")
const uuid = require("uuid")
const main_name = "activity"
module.exports = function() {
	var self = this
	//申请充值
	this.apply_recharge = function(uid,unionid,pay_id,cb) {
		if(!pay_cfg[pay_id]){
			cb(false,"pay_id error")
			return
		}
		var info = {
			pay_id : pay_id,
			userName : this.players[uid]["name"],
			unionid : unionid,
			accId : this.players[uid]["accId"],
			uid : uid,
			areaId : self.areaId
		}
		self.payDao.createGameOrder(info,function(flag,data) {
			cb(flag,data)
		})
	}
	//充值成功
	this.finish_recharge = function(uid,pay_id,cb) {
		var call_back = function(uid,flag,data) {
			if(flag){
				var notify = {
					type : "finish_recharge",
					pay_id : pay_id,
					data : data
				}
				self.sendToUser(uid,notify)
			}
		}
		switch(pay_cfg[pay_id]["type"]){
			case "lv_fund":
				this.activateLvFund(uid,call_back.bind(this,uid))
			break
			case "highCard":
				this.activateHighCard(uid,call_back.bind(this,uid))
			break
			case "warHorn":
				this.advanceWarHorn(uid,call_back.bind(this,uid))
			break
			case "recharge":
				this.recharge(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "box_day":
				this.buyAwardBagday(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "box_week":
				this.buyAwardBagWeek(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "box_month":
				this.buyAwardBagMonth(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "limit_gift":
				this.buyLimitGift(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
		}
		cb(true)
	}
	//充值
	this.recharge = function(uid,index,cb) {
		self.addUserRMB(uid,recharge[index].rmb)
		self.incrbyObj(uid,main_name,"recharge_"+index,1,function(data) {
			var gold = recharge[index].gold
			var rate = 0
			if(data == 1)
				rate = recharge[index].first_rate
			else
				rate = recharge[index].normal_rate
			var award = self.addItem({uid:uid,itemId:202,value:gold,rate:rate})
			cb(true,{{awardList:[award]})
		})
	}
	//激活等级基金
	this.activateLvFund = function(uid,cb) {
		self.getObj(uid,main_name,"lv_fund",function(data) {
			if(data){
				cb(false,"已激活基金")
			}else{
				self.setObj(uid,main_name,"lv_fund",1)
				self.addUserRMB(uid,activity_cfg["grow_lof"]["value"])
				cb(true)
			}
		})
	}
	//增加rmb余额
	this.addUserRMB = function(uid,rmb) {
		if(rmb <= 0)
			return
		self.incrbyLordData(uid,"rmb_day",rmb,function(data) {
			if(data == rmb)
				self.incrbyObj(uid,main_name,"pay_days",1)
		})
		self.incrbyLordData(uid,"rmb",rmb)
		self.incrbyObj(uid,main_name,"normalRmb",rmb,function(data) {
			data = Number(data)
			if((data - rmb) < activity_cfg["normal_card_rmb"]["value"] && data >= activity_cfg["normal_card_rmb"]["value"]){
				self.setObj(uid,main_name,"normalCard",1)
				var notify = {
					type : "activateNormalCard",
					normalRmb : data
				}
				self.sendToUser(uid,notify)
			}
			if(self.players[uid]){
				var notify = {
					type : "addUserRMB",
					rmb_day : self.players[uid].rmb_day,
					rmb : self.players[uid].rmb
				}
				self.sendToUser(uid,notify)
			}
		})
		self.checkVipLv(uid)
	}
	//激活至尊特权
	this.activateHighCard = function(uid,cb) {
		self.getObj(uid,main_name,"highCard",function(data) {
			if(data){
				cb(false,"已激活至尊特权")
			}else{
				self.setObj(uid,main_name,"highCard",1)
				self.chageLordData(uid,"highCard",1)
				self.addUserRMB(uid,activity_cfg["high_card_lof"]["value"])
				var awardList = self.addItemStr(uid,activity_cfg["high_card_award"]["value"])
				cb(true,{awardList:awardList})
			}
		})
	}
	//购买每日礼包
	this.buyAwardBagday = function(uid,index,cb) {
		if(!index || !awardBag_day[index]){
			cb(false,"礼包不存在")
			return
		}
		self.getObj(uid,main_name,"bagDay_"+index,function(data) {
			if(data > 0){
				cb(false,"已购买")
				return
			}
			self.addUserRMB(uid,awardBag_day[index].rmb)
			self.incrbyObj(uid,main_name,"bagDay_"+index,1)
			var awardList = self.addItemStr(uid,awardBag_day[index].award)
			cb(true,{awardList:awardList})
		})
	}
	//获取每周礼包与每月礼包购买数据
	this.getWeekAndMonthRecord = function(uid,cb) {
		var info = {}
		self.getObjAll(uid,"week_shop",function(data) {
			info.week_shop = data || {}
			self.getObjAll(uid,"month_shop",function(data) {
				info.month_shop = data || {}
				cb(true,info)
			})
		})
	}
	//购买每周礼包
	this.buyAwardBagWeek = function(uid,index,cb) {
		if(!index || !gift_week[index]){
			cb(false,"礼包不存在")
			return
		}
		self.getObj(uid,"week_shop",index,function(data) {
			data = Number(data) || 0
			if(data >= gift_week[index]["limit"]){
				cb(false,"已限购")
				return
			}
			self.addUserRMB(uid,gift_week[index].rmb)
			self.incrbyObj(uid,"week_shop",index,1)
			var awardList = self.addItemStr(uid,gift_week[index].award)
			cb(true,{awardList:awardList})
		})
	}
	//购买每月礼包
	this.buyAwardBagMonth = function(uid,index,cb) {
		if(!index || !gift_month[index]){
			cb(false,"礼包不存在")
			return
		}
		self.getObj(uid,"month_shop",index,function(data) {
			data = Number(data) || 0
			if(data >= gift_month[index]["limit"]){
				cb(false,"已限购")
				return
			}
			self.addUserRMB(uid,gift_month[index].rmb)
			self.incrbyObj(uid,"month_shop",index,1)
			var awardList = self.addItemStr(uid,gift_month[index].award)
			cb(true,{awardList:awardList})
		})
	}
	//进阶战令
	this.advanceWarHorn = function(uid,cb) {
		let curMonth = (new Date()).getMonth()
		self.getObj(uid,"war_horn","high",function(data) {
			if(data == 1){
				cb(false,"已进阶")
				return
			}
			self.addUserRMB(uid,activity_cfg["war_horn"]["value"])
			self.setObj(uid,"war_horn","high",1)
			self.incrbyObj(uid,"war_horn","exp",war_horn[curMonth]["exp"],function(exp) {
				var awardList = self.addItemStr(uid,war_horn[curMonth]["award"])
				cb(true,{awardList:awardList,exp:exp})
			})
		})
	}
	//购买限时礼包
	this.buyLimitGift = function(uid,id,cb) {
		if(!gift_list[id]){
			cb(false,"限时礼包错误")
			return
		}
		self.getObj(uid,"limit_gift",id,function(data) {
			if(data){
				self.addUserRMB(uid,gift_list[id]["price"])
				var awardList = self.addItemStr(uid,gift_list[id]["award"])
				self.delObj(uid,"limit_gift",id)
				cb(true,{awardList:awardList})
			}else{
				cb(false,"限时礼包不存在或已过期")
				return
			}
		})
	}
}