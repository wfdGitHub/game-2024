const sign_in_day = require("../../../../config/gameCfg/sign_in_day.json")
const sign_in_cfg = require("../../../../config/gameCfg/sign_in_cfg.json")
const online_time = require("../../../../config/gameCfg/online_time.json")
const activity_lv = require("../../../../config/gameCfg/activity_lv.json")
const activity_cfg = require("../../../../config/gameCfg/activity_cfg.json")
const activity_ce = require("../../../../config/gameCfg/activity_ce.json")
const recharge = require("../../../../config/gameCfg/recharge.json")
const recharge_total = require("../../../../config/gameCfg/recharge_total.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
const consumeTotal = require("../../../../config/gameCfg/consumeTotal.json")
const awardBag_day = require("../../../../config/gameCfg/awardBag_day.json")
const pay_days = require("../../../../config/gameCfg/pay_days.json")
const invade = require("../../../../config/gameCfg/invade.json")
const invade_team = JSON.parse(invade["mon_team"]["value"])
const area_boss_base = require("../../../../config/gameCfg/area_boss_base.json")
var util = require("../../../../util/util.js")
var maxBoss = 0
for(var i in area_boss_base){
	maxBoss++
}
const main_name = "activity"
module.exports = function() {
	var self = this
	const baseInfo = {
		"signDay" : 1,
		"signCount" : 0,
		"boxDay" : 0,
		"box1" : 0,
		"box2" : 0,
		"normalCard" : 0,
		"normalRmb" : 0,
		"normalAward" : 0,
		"highAward" : 0,
		"recharge_day_1" : 0,
		"recharge_day_2" : 0,
		"invade" : 0
	}
	//获得活动数据
	this.getActivityData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(let i in data)
				data[i] = Number(data[i])
			cb(true,data)
		})
	}
	//挑战魔物入侵
	this.challengeInvade = function(uid,cb) {
		var curTime = util.getDayMilliseconds()
		if(curTime < invade["beginTime"]["value"] || curTime > invade["endTime"]["value"]){
			cb(false,"未到开放时间")
			return
		}
		self.getObj(uid,main_name,"invade",function(count) {
			count = Number(count) || 0
			if(count >= invade["count"]["value"]){
				cb(false,"挑战次数已满")
			}else{
				var defTeam = invade_team[Math.floor(Math.random() * invade_team.length)].concat()
				defTeam = self.standardTeam(uid,defTeam,"invade")
				var lv = self.getLordLv(uid)
				var atkTeam = self.getUserTeam(uid)
				var seededNum = Date.now()
			    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    var record = self.fightContorl.getFightRecord()
			    var info = {
			    	atkTeam : atkTeam,
			    	defTeam : defTeam,
			    	seededNum : seededNum,
			    	winFlag : winFlag
			    }
			    if(winFlag){
			    	self.incrbyObj(uid,main_name,"invade",1)
			    	var rate = invade["base_rate"]["value"] + lv * invade["lv_rate"]["value"]
			    	var awardList = self.addItemStr(uid,invade["base_award"]["value"],rate)
			    	var record = self.fightContorl.getFightRecord()
			    	var overInfo = record[record.length - 1]
			    	var round = overInfo.round
			    	if(round > 5)
			    		round = 5
			    	awardList = awardList.concat(self.openChestStr(uid,invade["round_"+round]["value"]))
			    	info.awardList = awardList
			    	info.count = ++count
			    	cb(true,info)
			    }else{
			    	cb(true,info)
			    }
			}
		})
	}
	//活动数据更新
	this.activityUpdate = function(uid) {
		self.getObjAll(uid,main_name,function(data) {
			data = Object.assign({},baseInfo,data)
			for(var i in data)
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
			data["vip_day_award"] = 0
			data["recharge_day_1"] = 0
			data["recharge_day_2"] = 0
			data["invade"] = 0
			for(var i in awardBag_day){
				data["bagDay_"+i] = 0
			}
			for(var i = 1;i < 10;i++){
				if(!activity_cfg["recharge_week_"+i]){
					break
				}else{
					delete data["recharge_week_"+i]
				}
			}
			self.setHMObj(uid,main_name,data)
		})
	}
	//活动数据每周刷新
	this.activityWeekUpdate = function(uid) {
		for(var i = 1;i < 10;i++){
			if(!activity_cfg["recharge_week_"+i]){
				break
			}else{
				self.delObj(uid,main_name,"recharge_week_"+i)
			}
		}
	}
	//领取充值天数礼包
	this.gainRPayDaysAward = function(uid,id,cb) {
		if(!pay_days[id]){
			cb(false,"礼包不存在")
			return
		}
		self.getHMObj(uid,main_name,["pay_days","pay_days_"+id],function(list) {
			var days = Number(list[0]) || 0
			if(list[1]){
				cb(false,"已领取")
			}else if(days < pay_days[id]["day"]){
				cb(false,"条件未达成")
			}else{
				self.setObj(uid,main_name,"pay_days_"+id,1)
				var awardList = self.addItemStr(uid,pay_days[id]["award"])
				cb(true,awardList)
			}
		})
	}
	//领取每日首充奖励
	this.gainRechargeDayAward = function(uid,id,cb) {
		var rmb_day = self.players[uid].rmb_day
		if(!activity_cfg["recharge_day_rmb_"+id] || rmb_day < activity_cfg["recharge_day_rmb_"+id]){
			cb(false,"条件未达成")
			return
		}
		self.getObj(uid,main_name,"recharge_day_"+id,function(data) {
			if(data == 0){
				self.incrbyObj(uid,main_name,"recharge_day_"+id,1)
				var awardList = self.addItemStr(uid,activity_cfg["recharge_day_"+id]["value"])
				cb(true,awardList)
			}else{
				cb(false,"已领取")
			}
		})
	}
	//领取每周累充奖励
	this.gainRechargeWeekAward = function(uid,id,cb) {
		var week_rmb = self.players[uid].week_rmb
		if(!activity_cfg["recharge_week_rmb_"+id] || week_rmb < activity_cfg["recharge_week_rmb_"+id]["value"]){
			cb(false,"条件未达成")
			return
		}
		self.getObj(uid,main_name,"recharge_week_"+id,function(data) {
			if(!data){
				self.incrbyObj(uid,main_name,"recharge_week_"+id,1)
				var awardList = self.addItemStr(uid,activity_cfg["recharge_week_"+id]["value"])
				cb(true,awardList)
			}else{
				cb(false,"已领取")
			}
		})
	}
	//购买vip礼包
	this.buyVipAward = function(uid,vip,cb) {
		if(!VIP[vip]){
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
	//领取首充礼包
	this.gainFirstRechargeAward = function(uid,index,cb) {
		if(!activity_cfg["first_recharge_"+index]){
			cb(false,"参数错误")
			return
		}
		if(self.players[uid].userDay - 1 < index){
			cb(false,"未到领取时间")
			return
		}
		if(!self.players[uid]["real_rmb"]){
			cb(false,"未充值")
			return
		}
		self.getObj(uid,main_name,"first_award_"+index,function(data) {
			if(data){
				cb(false,"已领取")
			}else{
				self.incrbyObj(uid,main_name,"first_award_"+index,1)
				var awardList = self.addItemStr(uid,activity_cfg["first_recharge_"+index]["value"])
				cb(true,awardList)
			}
		})
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
		if(!self.players[uid]){
			return
		}
		if(VIP[self.players[uid].vip+1]){
			if(self.players[uid].vip_exp >= VIP[self.players[uid].vip+1]["rmb"]){
				this.incrbyLordData(uid,"vip",1)
				this.incrbyLordData(uid,"heroAmount",VIP[self.players[uid]["vip"]]["heroAmount"])
				if(self.players[uid]){
					var notify = {
						type : "vip",
						curLv : self.players[uid].vip,
						vip_exp : self.players[uid].vip_exp
					}
					this.sendToUser(uid,notify)
				}
				this.checkVipLv(uid)
			}
		}
	}
	//领取vip免费礼包
	this.gainVipAward = function(uid,cb) {
		var vip = self.players[uid].vip
		self.getObj(uid,main_name,"vip_day_award",function(data) {
			if(data != 0){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"vip_day_award",1)
			var awardList = self.addItemStr(uid,VIP[vip]["free_award"])
			cb(true,awardList)
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
	//领取消耗活动奖励
	this.gainConsumeTotalAward = function(uid,index,cb) {
		if(!consumeTotal[index]){
			cb(false,"档位不存在")
			return
		}
		self.getObj(uid,main_name,"consumeTotal_"+index,function(data) {
			if(data){
				cb(false,"已领取")
			}else{
				self.getPlayerData(uid,"gold_consume",function(data) {
					data = Number(data)
					if(data && data >= consumeTotal[index]["need_gold"]){
						self.incrbyObj(uid,main_name,"consumeTotal_"+index,1)
						var awardList = self.addItemStr(uid,consumeTotal[index]["award"])
						cb(true,awardList)
					}else{
						cb(false,"条件未达成"+data+"/"+consumeTotal[index]["need_gold"])
					}
				})
			}
		})
	}
}