const recharge = require("../../../../config/gameCfg/recharge.json")
const recharge_total = require("../../../../config/gameCfg/recharge_total.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
const activity_cfg = require("../../../../config/gameCfg/activity_cfg.json")
const awardBag_day = require("../../../../config/gameCfg/awardBag_day.json")
var war_horn = require("../../../../config/gameCfg/war_horn.json")
var main_name = "activity"
module.exports = function() {
	var self = this
	//申请充值
	this.apply_recharge = function(uid,index,cb) {
		if(!recharge[index]){
			cb(false,"参数错误")
			return
		}
		this.recharge(uid,index)
		cb(true)
	}
	//充值
	this.recharge = function(uid,index) {
		self.addUserRMB(uid,recharge[index].rmb)
		self.incrbyObj(uid,main_name,"recharge_"+index,1,function(data) {
			var gold = recharge[index].gold
			var rate = 0
			if(data == 1)
				rate = recharge[index].first_rate
			else
				rate = recharge[index].normal_rate
			var award = self.addItem({uid:uid,itemId:202,value:gold,rate:rate})
			var notify = {
				type : "recharge",
				index : index,
				award : award
			}
			self.sendToUser(uid,notify)
		})
	}
	//激活等级基金
	this.activateLvFund = function(uid,cb) {
		self.getObj(uid,main_name,"lv_fund",function(data) {
			if(data){
				cb(false,"已激活基金")
			}else{
				self.setObj(uid,main_name,"lv_fund",1)
				self.addUserRMB(uid,6800)
				var notify = {
					type : "activateLvFund"
				}
				self.sendToUser(uid,notify)
				cb(true)
			}
		})
	}
	//增加rmb余额
	this.addUserRMB = function(uid,rmb) {
		self.incrbyLordData(uid,"rmb_day",rmb)
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
			var notify = {
				type : "addUserRMB",
				rmb_day : self.players[uid].rmb_day,
				rmb : self.players[uid].rmb
			}
			self.sendToUser(uid,notify)
		})
		self.checkVipLv(uid)
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
	//激活专属月卡
	this.activateHighCard = function(uid,cb) {
		self.getObj(uid,main_name,"highCard",function(data) {
			if(data){
				cb(false,"已激活专属月卡")
			}else{
				self.setObj(uid,main_name,"highCard",1)
				self.chageLordData(uid,"highCard",1)
				self.addUserRMB(uid,12800)
				var awardList = self.addItemStr(uid,activity_cfg["high_card_award"]["value"])
				var notify = {
					type : "activateHighCard",
					awardList : awardList
				}
				self.sendToUser(uid,notify)
				cb(true)
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
			cb(true,awardList)
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
			self.addUserRMB(uid,12800)
			self.setObj(uid,"war_horn","high",1)
			self.incrbyObj(uid,"war_horn","exp",war_horn[curMonth]["exp"],function(exp) {
				var awardList = self.addItemStr(uid,war_horn[curMonth]["award"])
				cb(true,{awardList:awardList,exp:exp})
			})
		})
	}
}