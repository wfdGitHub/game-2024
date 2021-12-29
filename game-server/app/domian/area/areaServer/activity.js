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
const open_cfg = require("../../../../config/gameCfg/open_cfg.json")
const invade = require("../../../../config/gameCfg/invade.json")
const lord_lv = require("../../../../config/gameCfg/lord_lv.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const invade_team = JSON.parse(invade["mon_team"]["value"])
const area_boss_base = require("../../../../config/gameCfg/area_boss_base.json")
const activity_day = require("../../../../config/gameCfg/activity_day.json")
const wuxian = require("../../../../config/gameCfg/wuxian.json")
const wuxian_vip = require("../../../../config/gameCfg/wuxian_vip.json")
const oneDayTime = 86400000
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
		"invade" : 0,
		"rv_normal" : 0,
		"rv_high" : 0,
		"rv_super" : 0
	}
	//获得活动数据
	this.getActivityData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(let i in data)
				data[i] = Number(data[i])
			cb(true,data)
		})
	}
	//征收
	this.revenueCoin = function(uid,type,cb) {
		if(type !== "normal" && type !== "high" && type !== "super"){
			cb(false,"type error "+type)
			return
		}
		var lv = self.getLordLv(uid)
		self.getObj(uid,main_name,"rv_"+type,function(data) {
			data = Number(data) || 0
			if(data && data >= default_cfg["revenue_"+type]["value"]){
				cb(false,"已征收")
			}else{
				var pcStr = ""
				if(type == "high")
					pcStr = default_cfg["default_pc_1"]["value"]
				if(type == "super")
					pcStr = default_cfg["default_pc_3"]["value"]
				self.consumeItems(uid,pcStr,1,"征税"+type,function(flag,err) {
					if(!flag){
						cb(false,err)
					}else{
						self.taskUpdate(uid,"revenue",1)
						self.incrbyObj(uid,main_name,"rv_"+type,1)
						var awardList = self.addItemStr(uid,"201:"+lord_lv[lv][type],1,"征收"+type)
						cb(true,awardList)
					}
				})
			}
		})
	}
	//挑战魔物入侵
	// this.challengeInvade = function(uid,cb) {
	// 	var curTime = util.getDayMilliseconds()
	// 	if(curTime < invade["beginTime"]["value"] || curTime > invade["endTime"]["value"]){
	// 		cb(false,"未到开放时间")
	// 		return
	// 	}
	// 	self.getObj(uid,main_name,"invade",function(count) {
	// 		count = Number(count) || 0
	// 		if(count >= invade["count"]["value"]){
	// 			cb(false,"挑战次数已满")
	// 		}else{
	// 			var defTeam = invade_team[Math.floor(Math.random() * invade_team.length)].concat()
	// 			defTeam = self.standardTeam(uid,defTeam,"invade")
	// 			var lv = self.getLordLv(uid)
	// 			var atkTeam = self.getUserTeam(uid)
	// 			var seededNum = Date.now()
	// 		    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
	// 		    var record = self.fightContorl.getFightRecord()
	// 		    var info = {
	// 		    	atkTeam : atkTeam,
	// 		    	defTeam : defTeam,
	// 		    	seededNum : seededNum,
	// 		    	winFlag : winFlag
	// 		    }
	// 		    if(winFlag){
	// 		    	self.incrbyObj(uid,main_name,"invade",1)
	// 		    	var rate = invade["base_rate"]["value"] + lv * invade["lv_rate"]["value"]
	// 		    	if(self.checkLimitedTime("saodang"))
	// 		    		rate *= 2
	// 		    	var awardList = self.addItemStr(uid,invade["base_award"]["value"],rate,"魔物入侵")
	// 		    	var record = self.fightContorl.getFightRecord()
	// 		    	var overInfo = record[record.length - 1]
	// 		    	var round = overInfo.round
	// 		    	if(round > 5)
	// 		    		round = 5
	// 		    	awardList = awardList.concat(self.openChestStr(uid,invade["round_"+round]["value"]))
	// 		    	info.awardList = awardList
	// 		    	info.count = ++count
	// 		    	cb(true,info)
	// 		    }else{
	// 		    	cb(true,info)
	// 		    }
	// 		}
	// 	})
	// }
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
			data["free_day_1"] = 0
			data["invade"] = 0
			data["rv_normal"] = 0
			data["rv_high"] = 0
			data["rv_super"] = 0
			for(var i in wuxian){
				if(wuxian[i]["rmb"]){
					data[i+"_count"] = 0
					data[i+"_cd"] = 0
				}
			}
			for(var i in wuxian_vip){
				data[i+"_count"] = 0
				data[i+"_cd"] = 0
			}
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
			self.setObj(uid,main_name,"onlineIndex",0)
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
		// self.setPlayerData(uid,"gold_consume",0)
		// for(var index in consumeTotal)
		// 	self.delObj(uid,main_name,"consumeTotal_"+index)
	}
	//领取每日免费礼包
	this.gainFreeDayAward = function(uid,id,cb) {
		if(!activity_cfg["free_day_"+id]){
			cb(false,"礼包不存在")
			return
		}
		self.getObj(uid,main_name,"free_day_"+id,function(data) {
			if(!data || data == 0){
				self.incrbyObj(uid,main_name,"free_day_"+id,1)
				var awardList = self.addItemStr(uid,activity_cfg["free_day_"+id]["value"],1,"免费礼包"+id)
				cb(true,awardList)
			}else{
				cb(false,"已领取")
			}
		})
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
				var awardList = self.addItemStr(uid,pay_days[id]["award"],1,"充值天数礼包"+id)
				cb(true,awardList)
			}
		})
	}
	//领取每日首充奖励
	this.gainRechargeDayAward = function(uid,id,cb) {
		var real_day = self.players[uid].real_day
		if(!activity_cfg["recharge_day_rmb_"+id]["value"] || real_day < activity_cfg["recharge_day_rmb_"+id]["value"]){
			cb(false,"条件未达成")
			return
		}
		self.getObj(uid,main_name,"recharge_day_"+id,function(data) {
			if(data == 0){
				self.incrbyObj(uid,main_name,"recharge_day_"+id,1)
				var awardList = self.addItemStr(uid,activity_cfg["recharge_day_"+id]["value"],1,"每日首充"+id)
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
				var awardList = self.addItemStr(uid,activity_cfg["recharge_week_"+id]["value"],1,"每周累充"+id)
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
			self.consumeItems(uid,VIP[vip]["buy_pc"],1,"购买vip礼包"+vip,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					self.incrbyObj(uid,main_name,"vip_buy"+vip,1)
					var awardList = self.addItemStr(uid,VIP[vip]["buy_pa"],1,"VIP礼包"+vip)
					cb(true,awardList)
				}
			})
		})
	}
	//领取首充礼包
	this.gainFirstRechargeAward = function(uid,type,index,cb) {
		if(type != 1 && type != 2 && type != 3){
			cb(false,"参数错误")
			return
		}
		if(self.players[uid]["real_rmb"] < activity_cfg["shouchong_"+type]["value"]){
			cb(false,"充值额度不足")
			return
		}
		if(self.players[uid].userDay < index){
			cb(false,"未到领取时间")
			return
		}
		var str = "shouchong_"+type+"_"+index
		self.getObj(uid,main_name,str,function(data) {
			if(data){
				cb(false,"已领取")
			}else{
				self.incrbyObj(uid,main_name,str,1)
				var awardList = self.addItemStr(uid,activity_cfg[str]["value"],1,"首充礼包"+str)
				cb(true,awardList)
			}
		})
	}
	//领取累充奖励
	this.gainRechargeTotalAward = function(uid,index,cb) {
		cb(false)
		// if(!recharge_total[index]){
		// 	cb(false,"参数错误")
		// 	return
		// }
		// if(!self.players[uid]["rmb"] || self.players[uid]["rmb"] < recharge_total[index].rmb){
		// 	cb(false,"充值额度不足")
		// 	return
		// }
		// self.getObj(uid,main_name,"total_award_"+index,function(data) {
		// 	if(data){
		// 		cb(false,"已领取")
		// 	}else{
		// 		self.setObj(uid,main_name,"total_award_"+index,1)
		// 		var awardList = self.addItemStr(uid,recharge_total[index].award,1,"累充奖励")
		// 		cb(true,awardList)
		// 	}
		// })
	}
	//领取单充奖励
	this.gainRechargeOnceAward = function(uid,index,cb) {
		if(!recharge[index]){
			cb(false,"参数错误")
			return
		}
		self.getHMObj(uid,main_name,["recharge_once_"+index,"once_award_"+index],function(data) {
			data[0] = Number(data[0]) || 0
			data[1] = Number(data[1]) || 0
			console.log("data",data)
			if(data[0] <= data[1]){
				cb(false,"已领完")
			}else{
				self.incrbyObj(uid,main_name,"once_award_"+index,1)
				var awardList = self.addItemStr(uid,recharge[index].once_award,1,"单充奖励"+index)
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
			if(data[0] == 1 && !self.players[uid].real_day){
				cb(false,"需要任意充值")
				return
			}
			if(data[0] == "0")
				self.incrbyObj(uid,main_name,"boxDay",1)
			self.incrbyObj(uid,main_name,"signCount",1)
			let awardList = self.addItemStr(uid,sign_in_day[data[1]]["award"],1,"签到")
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
			let awardList = self.addItemStr(uid,sign_in_cfg[index]["award"],1,"签到宝箱"+index)
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
			let awardList = self.addItemStr(uid,online_time[data]["award"],1,"在线奖励"+data)
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
				var amount = VIP[self.players[uid]["vip"] + 1]["heroAmount"] - VIP[self.players[uid]["vip"]]["heroAmount"]
				this.incrbyLordData(uid,"vip",1)
				this.incrbyLordData(uid,"heroAmount",amount)
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
			var awardList = self.addItemStr(uid,VIP[vip]["free_award"],1,"VIP每日礼包")
			cb(true,awardList)
		})
	}
	//领取登陆天数礼包
	this.gainActivityDayAward = function(uid,index,cb) {
		if(!index || !activity_day[index]){
			cb(false,"index error"+index)
			return
		}
		if(self.players[uid].userDay < activity_day[index]["day"]){
			cb(false,"天数不足 "+self.players[uid].userDay+"/"+activity_day[index]["day"])
			return
		}
		self.getObj(uid,main_name,["day_award"+index],function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"day_award"+index,1)
			var awardList = self.addItemStr(uid,activity_day[index]["award"],1,"天数礼包"+index)
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
			var awardList = self.addItemStr(uid,activity_lv[index]["award"],1,"等级基金"+index)
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
			var awardList = self.addItemStr(uid,activity_ce[index]["award"],1,"战力奖励"+index)
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
			var awardList = self.addItemStr(uid,activity_cfg["normal_card_day"]["value"],1,"普通月卡每日")
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
			var awardList = self.addItemStr(uid,activity_cfg["high_card_day"]["value"],1,"至尊特权每日")
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
						var awardList = self.addItemStr(uid,consumeTotal[index]["award"],1,"消耗元宝活动"+index)
						cb(true,awardList)
					}else{
						cb(false,"条件未达成"+data+"/"+consumeTotal[index]["need_gold"])
					}
				})
			}
		})
	}
	//领取功能开启奖励
	this.gainSysOpenAward = function(uid,index,cb) {
		var lv = self.getLordLv(uid)
		if(!index || !open_cfg[index] || lv < open_cfg[index]["lv"]){
			cb(false,"等级不足")
			return
		}
		self.getObj(uid,main_name,"open_"+index,function(data) {
			if(data){
				cb(false,"已领取")
			}else{
				self.setObj(uid,main_name,"open_"+index,1)
				var awardList = self.addItemStr(uid,open_cfg[index]["award"],1,"功能开启"+index)
				cb(true,awardList)
			}
		})
	}
	//开启无限资源
	this.openWuxian = function(uid,wuxianId,cb) {
		if(!wuxian[wuxianId] || !wuxian[wuxianId]["rmb"]){
			cb(false,"特权不存在")
			return
		}
		self.getHMObj(uid,main_name,[wuxianId,wuxianId+"_count",wuxianId+"_cd"],function(list) {
			if(!list[0]){
				cb(false,"特权未激活")
				return
			}
			list[1] = Number(list[1]) || 0
			list[2] = Number(list[2]) || 0
			var info = {}
			if(list[1] >= wuxian[wuxianId]["basic"]){
				if(list[2] < Date.now()){
					var cd = Date.now() + wuxian[wuxianId]["base_cd"] + (list[1] - 100) * wuxian[wuxianId]["up_cd"]
					info.cd = cd
					self.setObj(uid,main_name,wuxianId+"_cd",cd)
				}else{
					cb(false,"冷却中,"+Math.floor((list[2]-Date.now())/1000)+"秒后可开启")
					return
				}
			}
			self.incrbyObj(uid,main_name,wuxianId+"_count",1)
			info.count = list[1] + 1
			info.awardList = self.openChestAward(uid,wuxian[wuxianId]["chest"])
			cb(true,info)
		})
	}
	//开启累充无限资源
	this.openWuxianByRmb = function(uid,wuxianId,cb) {
		if(!wuxian[wuxianId] || !wuxian[wuxianId]["need"]){
			cb(false,"特权不存在")
			return
		}
		var real_rmb = self.players[uid].real_rmb
		self.getObj(uid,main_name,wuxianId+"_count",function(data) {
			data = Number(data) || 0
			if((data + 1) * wuxian[wuxianId]["need"] > real_rmb){
				cb(false,"未满足条件")
				return
			}
			var info = {}
			info.count = data + 1
			self.incrbyObj(uid,main_name,wuxianId+"_count",1)
			info.awardList = self.openChestAward(uid,wuxian[wuxianId]["chest"])
			cb(true,info)
		})
	}
	//开启VIP无限资源
	this.openWuxianByVip = function(uid,wuxianId,cb) {
		if(!wuxian_vip[wuxianId]){
			cb(false,"特权不存在")
			return
		}
		var vip = self.players[uid].vip
		if(vip < wuxian_vip[wuxianId]["vip"]){
			cb(false,"vip等级不足")
			return
		}
		self.getHMObj(uid,main_name,[wuxianId+"_count",wuxianId+"_cd"],function(list) {
			list[0] = Number(list[0]) || 0
			list[1] = Number(list[1]) || 0
			var info = {}
			if(list[0] >= wuxian_vip[wuxianId]["basic"]){
				if(list[1] < Date.now()){
					var cd = Date.now() + wuxian_vip[wuxianId]["base_cd"] + (list[0] - 100) * wuxian_vip[wuxianId]["up_cd"]
					info.cd = cd
					self.setObj(uid,main_name,wuxianId+"_cd",cd)
				}else{
					cb(false,"冷却中,"+Math.floor((list[1]-Date.now())/1000)+"秒后可开启")
					return
				}
			}
			self.incrbyObj(uid,main_name,wuxianId+"_count",1)
			info.count = list[0] + 1
			info.awardList = self.openChestAward(uid,wuxian_vip[wuxianId]["chest"])
			cb(true,info)
		})
	}
}