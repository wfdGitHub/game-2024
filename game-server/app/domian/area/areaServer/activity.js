const sign_in_day = require("../../../../config/gameCfg/sign_in_day.json")
const sign_in_cfg = require("../../../../config/gameCfg/sign_in_cfg.json")
const online_time = require("../../../../config/gameCfg/online_time.json")
const activity_lv = require("../../../../config/gameCfg/activity_lv.json")
const activity_cfg = require("../../../../config/gameCfg/activity_cfg.json")
const activity_ce = require("../../../../config/gameCfg/activity_ce.json")
const recharge = require("../../../../config/gameCfg/recharge.json")
const recharge_total = require("../../../../config/gameCfg/recharge_total.json")
const area_rank = require("../../../../config/gameCfg/area_rank.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
var util = require("../../../../util/util.js")
var main_name = "activity"
module.exports = function() {
	var self = this
	var area_rank_deadline = util.getZeroTime(self.openTime) + activity_cfg["area_rank_time"]["value"]
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
	//领取首充礼包
	this.gainFirstRechargeAward = function(uid,cb) {
		if(!self.players[uid]["rmb"]){
			cb(false,"未充值")
		}else{
			self.getObj(uid,main_name,"first_award",function(data) {
				if(data){
					cb(false,"已领取")
				}else{
					self.setObj(uid,main_name,"first_award",1)
					var awardList = self.addItemStr(uid,activity_cfg["first_recharge"]["value"])
					cb(true,awardList)
				}
			})
		}
	}
	//领取累充奖励
	this.gainRechargeTotalAward = function(uid,index,cb) {
		if(!recharge_total[index]){
			cb(false,"参数错误")
			return
		}
		if(!self.players[uid]["rmb"] || self.players[uid]["rmb"] < recharge_total[index].rmb){
			cb(false,"充值额度不足")
			return
		}
		self.getObj(uid,main_name,"total_award_"+index,function(data) {
			if(data){
				cb(false,"已领取")
			}else{
				self.setObj(uid,main_name,"total_award_"+index,1)
				var awardList = self.addItemStr(uid,recharge_total[index].award)
				cb(true,awardList)
			}
		})
	}
	//领取单充奖励
	this.gainRechargeOnceAward = function(uid,index,cb) {
		if(!recharge[index]){
			cb(false,"参数错误")
			return
		}
		self.getHMObj(uid,main_name,["recharge_"+index,"once_award_"+index],function(data) {
			if(!data[0]){
				cb(false,"未充值该档位")
			}else if(data[1]){
				cb(false,"已领取")
			}else{
				self.setObj(uid,main_name,"once_award_"+index,1)
				var awardList = self.addItemStr(uid,recharge[index].once_award)
				cb(true,awardList)
			}
		})
	}
	//申请充值
	this.apply_recharge = function(uid,index,cb) {
		if(!recharge[index]){
			cb(false,"参数错误")
			return
		}
		setTimeout(this.recharge.bind(this,uid,index),3000)
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
					self.addUserRMB(uid,6800)
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
					self.chageLordData(uid,"highCard",1)
					self.addUserRMB(uid,12800)
					var awardList = self.addItemStr(uid,activity_cfg["high_card_award"]["value"])
					var notify = {
						type : "activateHighCard",
						awardList : awardList
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
	//更新冲榜活动排行榜
	this.updateAreaRank = function(uid,ce) {
		console.log("updateAreaRank",uid,ce)
		if(self.newArea && Date.now() < area_rank_deadline){
			self.addZset("areaRank",uid,ce)
		}else{
			console.log("冲榜活动关闭")
			self.updateAreaRank = function(){}
		}
	}
	//获取冲榜活动排行榜
	this.getAreaRank = function(cb) {
		var info = {
			state : self.newArea,
			area_rank_deadline : area_rank_deadline,
		}
		if(!info.state){
			cb(true,info)
		}else{
			self.zrangewithscore("areaRank",-20,-1,function(list) {
				info.list = list
				cb(true,info)
			})
		}
	}
	//领取冲榜奖励
	this.gainAreaRankAward = function(uid,cb) {
		if(self.newArea && Date.now() > area_rank_deadline){
			self.getObj(uid,main_name,"area_rank",function(data) {
				if(data){
					cb(false,"已领取")
				}else{
					self.redisDao.db.zrevrank("area:area"+self.areaId+":zset:areaRank",uid,function(err,rank) {
						console.log(err,rank,uid)
						if(rank != null){
							rank = Number(rank) + 1
							var text = "亲爱的玩家您好，恭喜您在7日冲榜活动中获得"+rank+"名，获得丰厚奖励，祝您游戏愉快！"
							if(rank >= 21){
								rank = 21
								text = "亲爱的玩家您好，恭喜您在7日冲榜活动中获得参与奖励，祝您游戏愉快！"
							}
							var ce = self.getCE(uid)
							var award = ""
							award = area_rank[rank]["award"]
							if(ce > activity_cfg["area_rank_extra"]["value"] && area_rank[rank]["extra"]){
								award += "&"+area_rank[rank]["extra"]
							}
							self.sendMail(uid,"冲榜活动奖励",text,award)
							self.setObj(uid,main_name,"area_rank",1)
							cb(true)
						}else{
							cb(false,"未参与冲榜"+rank)
						}
					})
				}
			})
		}else{
			cb(false,"未到领取时间")
		}
	}
}