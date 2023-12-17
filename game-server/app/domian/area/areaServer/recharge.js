const recharge = require("../../../../config/gameCfg/recharge.json")
const recharge_total = require("../../../../config/gameCfg/recharge_total.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
const activity_cfg = require("../../../../config/gameCfg/activity_cfg.json")
const war_horn = require("../../../../config/gameCfg/war_horn.json")
const gift_list = require("../../../../config/gameCfg/gift_list.json")
const pay_cfg = require("../../../../config/gameCfg/pay_cfg.json")
const wuxian = require("../../../../config/gameCfg/wuxian.json")
const util = require("../../../../util/util.js")
const GM_CFG = require("../../../../config/gameCfg/GM_CFG.json")
const uuid = require("uuid")
const async = require("async")
const main_name = "activity"
const day31Time = 2592000000
const day14Time = 1209600000
const day7Time = 604800000
const oneDayTime = 86400000
var rechargeMap = {}
var recharge_once_table = {}
for(var i in recharge){
	if(recharge[i]["once_award"])
		rechargeMap[recharge[i]["rmb"]] = i
}
for(var payId in pay_cfg){
	var cent = pay_cfg[payId]["cent"]
	if(rechargeMap[cent])
		recharge_once_table[payId] = rechargeMap[cent]
}
// var skinArr = []
// for(var i in gift_skin)
// 	skinArr.push(i)
// var skinList = []
module.exports = function() {
	var self = this
	//每日刷新
	this.rechargeDayUpdate = function() {
		// skinList = util.getRandomArray(skinArr,6)
	}
	//玩家每日刷新
	this.userRechargeDayUpdate = function(uid) {
		for(var i in pay_cfg)
			if(pay_cfg[i]["updateType"] == "day")
				self.delObj(uid,"recharge_fast",i)
	}
	//玩家每周刷新
	this.userRechargeWeekUpdate = function(uid) {
		for(var i in pay_cfg)
			if(pay_cfg[i]["updateType"] == "week")
				self.delObj(uid,"recharge_fast",i)
	}
	//玩家每月刷新
	this.userRechargeMonthUpdate = function(uid) {
		for(var i in pay_cfg)
			if(pay_cfg[i]["updateType"] == "month")
				self.delObj(uid,"recharge_fast",i)
	}
	//点票支付
	this.dianpiao_recharge = function(uid,pay_id,info,cb) {
        if(!pay_cfg[pay_id] || pay_cfg[pay_id]["dianpiao"] === undefined){
			cb(false,"pay_id error")
			return
		}
		async.waterfall([
			function(next) {
				if(pay_cfg[pay_id]["count"]){
					self.getObj(uid,"recharge_fast",pay_id,function(data) {
						data = Number(data) || 0
						if(data >= pay_cfg[pay_id]["count"]){
							cb(false,"购买次数已达上限")
							return
						}else{
							next()
						}
					})
				}else{
					next()
				}
			},
			function(next) {
				var rate = 1
				if(info && info.extras_params && info.extras_params.rate)
					rate = info.extras_params.rate
				if(pay_cfg[pay_id]["dianpiao"] == 0){
					self.finish_recharge(uid,pay_id,info,cb)
				}else{
					self.consumeItems(uid,"110:"+pay_cfg[pay_id]["rmb"],rate,"点票支付",function(flag,err) {
						if(flag){
							self.incrbyPlayerData(uid,"diaopiao_use",pay_cfg[pay_id]["rmb"] * rate)
							self.finish_recharge(uid,pay_id,info,cb)
						}else{
							cb(false,err)
						}
					})
				}
			}
		],function(err) {
			cb(false,"pay_id error")
		})
	}
	//获取快速充值数据
	this.getRechargeFastData = function(uid,cb) {
		self.getObjAll(uid,"recharge_fast",function(data) {
			cb(true,data)
		})
	}
	//申请充值
	this.apply_recharge = function(uid,unionid,pay_id,extras_params,cb) {
		if(!pay_cfg[pay_id]){
			cb(false,"pay_id error")
			return
		}
		if(pay_cfg[pay_id]["count"]){
			self.getObj(uid,"recharge_fast",pay_id,function(data) {
				data = Number(data) || 0
				if(data >= pay_cfg[pay_id]["count"]){
					cb(false,"购买次数已达上限")
					return
				}
				self.create_recharge(uid,unionid,pay_id,extras_params,cb)
			})
		}else{
			self.create_recharge(uid,unionid,pay_id,extras_params,cb)
		}
	}
	this.create_recharge = function(uid,unionid,pay_id,extras_params,cb) {
		var info = {
			pay_id : pay_id,
			extras_params : extras_params,
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
	this.finish_recharge = function(uid,pay_id,info,cb) {
		var rate = 1
		if(info && info.extras_params){
			var extras_params = JSON.parse(info.extras_params)
			if(extras_params.rate)
				rate = Math.max(1,Number(extras_params.rate) || 1)
		}
		var call_back = function(uid,flag,data) {
			if(flag){
				self.addUserRMB(uid,pay_cfg[pay_id].cent * rate)
				var notify = {
					type : "finish_recharge",
					pay_id : pay_id,
					rate : rate,
					data : data
				}
				self.sendToUser(uid,notify)
			}
		}
		if(!pay_cfg[pay_id]){
			cb(false)
			return
		}
		switch(pay_cfg[pay_id]["type"]){
			case "lv_fund":
			case "power_fund":
			case "beaty_fund":
				this.activateFund(uid,pay_cfg[pay_id]["type"],call_back.bind(this,uid))
			break
			case "highCard":
				this.activateHighCard(uid,pay_id,call_back.bind(this,uid))
			break
			case "warHorn":
				this.advanceWarHorn(uid,pay_id,call_back.bind(this,uid))
			break
			case "quick_pri":
				this.buyQuickPri(uid,pay_id,call_back.bind(this,uid))
			break
			case "tour_pri":
				this.buyTourPri(uid,pay_id,call_back.bind(this,uid))
			break
			case "stone_pri":
				this.buyStonePri(uid,pay_id,call_back.bind(this,uid))
			break
			case "ttt_pri":
				this.buyTTTPri(uid,call_back.bind(this,uid))
			break
			case "zhulu_pri":
				this.buyZhuluPri(uid,call_back.bind(this,uid))
			break
			case "manor_pri":
				this.buyManorPri(uid,call_back.bind(this,uid))
			break
			case "recharge":
				this.recharge(uid,rate,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "limit_gift":
				this.buyLimitGift(uid,rate,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "fast":
				this.buyFastRecharge(uid,rate,pay_id,call_back.bind(this,uid))
			break
			case "area_gift":
				this.buyAreaGift(uid,pay_id,call_back.bind(this,uid))
			break
			case "long_award":
				this.buyLongAward(uid,pay_id,call_back.bind(this,uid))
			break
			default:
				console.error("充值类型错误  "+uid+"  "+pay_id+"   "+pay_cfg[pay_id]["type"])
		}
		if(pay_cfg[pay_id]["count"])
			self.incrbyObj(uid,"recharge_fast",pay_id,1)
		var once_index = recharge_once_table[pay_id]
		if(once_index){
			self.incrbyObj(uid,main_name,"recharge_once_"+once_index,1,function(data) {
				var notify = {
					type : "recharge_once_update",
					index : once_index,
					curValue : data
				}
				self.sendToUser(uid,notify)
			})
		}
		cb(true)
	}
	//真实充值
	this.real_recharge = function(uid,value,cb) {
		self.incrbyLordData(uid,"real_rmb",value)
		self.incrbyLordData(uid,"real_day",value)
		self.incrbyLordData(uid,"real_week",value)
		if(self.players[uid]){
			var notify = {
				type : "real_recharge",
				real_rmb : self.players[uid].real_rmb,
				real_day : self.players[uid].real_day,
				real_week : self.players[uid].real_week
			}
			self.sendToUser(uid,notify)
		}
		self.festivalTotalRecharge(uid,value)
		if(cb)
			cb(true)
	}
	//充值
	this.recharge = function(uid,rate,index,cb) {
		self.incrbyObj(uid,main_name,"recharge_"+index,1,function(data) {
			var gold = recharge[index].gold
			var count = 0
			if(data == 1)
				count = recharge[index].first_rate
			else
				count = recharge[index].normal_rate
			var award = "202:"+Math.round(gold*count*rate)
			self.sendTextToMail(uid,"recharge",award)
			cb(true)
		})
	}
	//快速充值
	this.buyFastRecharge = function(uid,rate,pay_id,cb) {
		self.sendTextToMail(uid,"recharge",self.itemstrChangeRate(pay_cfg[pay_id]["award"],rate))
		cb(true)
	}
	//新服限购
	this.buyAreaGift = function(uid,pay_id,cb) {
		self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
		self.addAreaGiftNum(pay_cfg[pay_id]["arg"])
		cb(true)
	}
	//购买无限特权
	this.buyWuxian = function(uid,id,cb) {
		if(!wuxian[id] || !wuxian[id]["rmb"]){
			cb(false,"无限特权不存在")
			return
		}
		self.incrbyObj(uid,main_name,id,1)
		var notify = {
			type : "wuxian",
			wuxianId : id
		}
		self.sendToUser(uid,notify)
		cb(true)
	}
	//购买GM等级
	this.buyGMLv = function(uid,pay_id,cb) {
		if(!pay_cfg[pay_id]){
			cb(false,"pay_id error "+pay_id)
			return
		}
		var id = pay_cfg[pay_id]["arg"]
		if(!GM_CFG[id]){
			cb(false,"GM特权不存在")
			return
		}
		self.redisDao.db.hget("player:user:"+uid+":playerInfo","gmLv",function(err,data) {
			var index = Number(data) || 0
			if(id <= index){
				console.error(uid+ " gm等级错误 "+id+"/"+index)
			}else{
				self.chageLordData(uid,"gmLv",id)
				var notify = {
					type : "gmLv",
					lv : id
				}
				self.sendToUser(uid,notify)
			}
			self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
			cb(true)
		})
	}
	//购买循环礼包
	// this.buyLoopGift = function(uid,loopId,cb) {
	// 	if(!loopId || !gift_loop[loopId]){
	// 		cb(false,"礼包不存在")
	// 		return
	// 	}
	// 	self.getObj(uid,main_name,"loop_"+loopId,function(data) {
	// 		if(data > 0){
	// 			console.log("循环礼包已购买",loopId)
	// 		}
	// 		self.incrbyObj(uid,main_name,"loop_"+loopId,1)
	// 		var award = "202:"+gift_loop[loopId].gold
	// 		award += "&"+gift_loop[loopId].award
	// 		self.sendTextToMail(uid,"recharge",award)
	// 		cb(true)
	// 	})
	// }
	//激活基金
	this.activateFund = function(uid,type,cb) {
		self.getObj(uid,main_name,type,function(data) {
			if(data){
				cb(false,"已激活基金")
			}else{
				self.setObj(uid,main_name,type,1)
				cb(true)
			}
		})
	}
	//增加rmb余额
	this.addUserRMB = function(uid,rmb) {
		this.onlyUserRMB(uid,rmb)
		this.addUserVIPExp(uid,rmb)
	}
	//仅增加rmb余额
	this.onlyUserRMB = function(uid,rmb) {
		if(rmb <= 0)
			return
		self.incrbyLordData(uid,"rmb_day",rmb,function(data) {
			if(data == rmb)
				self.incrbyObj(uid,main_name,"pay_days",1)
		})
		self.incrbyLordData(uid,"rmb",rmb)
		self.incrbyLordData(uid,"week_rmb",rmb)
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
		})
		self.incrbyObj(uid,main_name,"betterRmb",rmb,function(data) {
			data = Number(data)
			if((data - rmb) < activity_cfg["better_card_rmb"]["value"] && data >= activity_cfg["better_card_rmb"]["value"]){
				self.setObj(uid,main_name,"betterCard",1)
				var notify = {
					type : "activatebetterCard",
					normalRmb : data
				}
				self.sendToUser(uid,notify)
			}
		})
		if(self.players[uid]){
			var notify = {
				type : "addUserRMB",
				rmb_day : self.players[uid].rmb_day,
				rmb : self.players[uid].rmb,
				week_rmb : self.players[uid].week_rmb
			}
			self.sendToUser(uid,notify)
		}
	}
	//增加VIP经验
	this.addUserVIPExp = function(uid,exp) {
		if(exp <= 0)
			return
		self.incrbyLordData(uid,"vip_exp",exp)
		if(self.players[uid]){
			var notify = {
				type : "addUserVIPExp",
				vip_exp : self.players[uid].vip_exp
			}
			self.sendToUser(uid,notify)
			self.checkVipLv(uid)
		}
	}
	//激活至尊特权
	this.activateHighCard = function(uid,pay_id,cb) {
		self.getObj(uid,main_name,"highCard",function(data) {
			if(data){
				cb(false,"已激活至尊特权")
			}else{
				self.taskUpdate(uid,"buy_zztq",1)
				self.setObj(uid,main_name,"highCard",1)
				self.chageLordData(uid,"highCard",1)
				self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
				cb(true)
			}
		})
	}
	//进阶战令
	this.advanceWarHorn = function(uid,pay_id,cb) {
		let curMonth = (new Date()).getMonth()
		self.getObj(uid,"war_horn","high",function(data) {
			if(data == 1){
				cb(false,"已进阶")
				return
			}
			self.setObj(uid,"war_horn","high",1)
			self.taskUpdate(uid,"buy_zl",1)
			self.incrbyObj(uid,"war_horn","exp",war_horn[curMonth]["exp"],function(exp) {
				self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
				cb(true,{exp:exp})
			})
		})
	}
	//购买限时礼包
	this.buyLimitGift = function(uid,rate,id,cb) {
		if(!gift_list[pay_id] || !pay_cfg[pay_id]){
			cb(false,"限时礼包错误")
			return
		}
		self.getObj(uid,"limit_gift",pay_id,function(data) {
			if(data){
				self.sendTextToMail(uid,"recharge",self.itemstrChangeRate(gift_list[id]["award"],rate))
				self.delObj(uid,"limit_gift",id)
				cb(true)
			}else{
				cb(false,"限时礼包不存在或已过期")
				return
			}
		})
	}
	//购买皮肤
	this.buyLimitSkin = function(uid,id,cb) {
		// console.log("buyLimitSkin",uid,id)
		// if(!gift_skin[id]){
		// 	cb(false,"限时礼包错误")
		// 	return
		// }
		// self.getObj(uid,"skin",id,function(data) {
		// 	data = Number(data) || 0
		// 	if(data >= gift_skin[id]["limit"]){
		// 		cb(false,"已限购")
		// 		return
		// 	}
		// 	self.incrbyObj(uid,"skin",id,1)
		// 	self.sendTextToMail(uid,"recharge",gift_skin[id].award)
		// 	cb(true)
		// })
	}
	//购买快速作战特权
	this.buyQuickPri = function(uid,pay_id,cb) {
		var  quick_pri = self.getLordAtt(uid,"quick_pri")
		if(!quick_pri || Date.now() > quick_pri){
			//新购
			quick_pri = util.getZeroTime() + day7Time
		}else{
			console.log("快速作战特权已购买，延长时间")
			//延长
			quick_pri += day7Time
		}
		self.taskUpdate(uid,"buy_kszz",1)
		self.chageLordData(uid,"quick_pri",quick_pri)
		self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
		cb(true,{quick_pri:quick_pri})
	}
	//购买三界特权
	this.buyTourPri = function(uid,pay_id,cb) {
		var  tour_pri = self.getLordAtt(uid,"tour_pri")
		if(!tour_pri || Date.now() > tour_pri){
			//新购
			tour_pri = util.getZeroTime() + day31Time
		}else{
			console.log("三界已购买，延长时间")
			//延长
			tour_pri += day31Time
		}
		self.chageLordData(uid,"tour_pri",tour_pri)
		self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
		cb(true,{tour_pri:tour_pri})
	}
	//购买宝石矿场特权
	this.buyStonePri = function(uid,pay_id,cb) {
		var  stone_pri = self.getLordAtt(uid,"stone_pri")
		if(!stone_pri || Date.now() > stone_pri){
			//新购
			stone_pri = util.getZeroTime() + day31Time
		}else{
			console.log("快速作战特权已购买，延长时间")
			//延长
			stone_pri += day31Time
		}
		self.chageLordData(uid,"stone_pri",stone_pri)
		self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
		cb(true,{stone_pri:stone_pri})
	}
	//购买通天塔特权
	this.buyTTTPri = function(uid,cb) {
		self.chageLordData(uid,"ttt_pri",1)
		cb(true,{ttt_pri:1})
	}
	//购买逐鹿之战特权
	this.buyZhuluPri = function(uid,cb) {
		var  zhulu_pri = self.getLordAtt(uid,"zhulu_pri")
		if(!zhulu_pri || Date.now() > zhulu_pri){
			//新购
			zhulu_pri = util.getZeroTime() + day14Time
		}else{
			console.log("快速作战特权已购买，延长时间")
			//延长
			zhulu_pri += day14Time
		}
		self.chageLordData(uid,"zhulu_pri",zhulu_pri)
		cb(true,{zhulu_pri:zhulu_pri})
	}
	//购买家园特权
	this.buyManorPri = function(uid,cb) {
		var  manor_pri = self.getLordAtt(uid,"manor_pri")
		if(!manor_pri || Date.now() > manor_pri){
			//新购
			manor_pri = util.getZeroTime() + day14Time
		}else{
			console.log("快速作战特权已购买，延长时间")
			//延长
			manor_pri += day14Time
		}
		self.chageLordData(uid,"manor_pri",manor_pri)
		cb(true,{manor_pri:manor_pri})
	}
	//购买周卡
	this.buyLongAward = function(uid,pay_id,cb) {
		var time = util.getZeroTime() + pay_cfg[pay_id]["day"] * oneDayTime
		self.setObj(uid,main_name,"pay_"+pay_id,time)
		self.sendTextToMail(uid,"recharge",pay_cfg[pay_id]["award"])
		cb(true,time)
	}
	//领取周卡奖励
	this.gainLongAward = function(uid,pay_id,cb) {
		if(!pay_cfg[pay_id] || pay_cfg[pay_id]["type"] != "long_award"){
			cb(false,"pay_id error "+pay_id)
			return
		}
		self.getHMObj(uid,main_name,["pay_"+pay_id,"award_"+pay_id],function(list) {
			var time = Number(list[0]) || 0
			var state = Number(list[1]) || 0
			if(Date.now() < time && !state){
				self.incrbyObj(uid,main_name,"award_"+pay_id,1)
				var awardList = self.addItemStr(uid,pay_cfg[pay_id]["arg2"],1,pay_cfg[pay_id]["name"])
				cb(true,awardList)
			}else{
				cb(false)
			}
		})
	}
}