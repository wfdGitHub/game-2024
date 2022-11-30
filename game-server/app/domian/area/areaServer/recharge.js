const recharge = require("../../../../config/gameCfg/recharge.json")
const recharge_total = require("../../../../config/gameCfg/recharge_total.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
const activity_cfg = require("../../../../config/gameCfg/activity_cfg.json")
const awardBag_day = require("../../../../config/gameCfg/awardBag_day.json")
const war_horn = require("../../../../config/gameCfg/war_horn.json")
const gift_list = require("../../../../config/gameCfg/gift_list.json")
const gift_week = require("../../../../config/gameCfg/gift_week.json")
const gift_month = require("../../../../config/gameCfg/gift_month.json")
const gift_skin = require("../../../../config/gameCfg/gift_skin.json")
const pay_cfg = require("../../../../config/gameCfg/pay_cfg.json")
const gift_loop = require("../../../../config/gameCfg/gift_loop.json")
const wuxian = require("../../../../config/gameCfg/wuxian.json")
const util = require("../../../../util/util.js")
const uuid = require("uuid")
const async = require("async")
const main_name = "activity"
const day31Time = 2592000000
var skinArr = []
for(var i in gift_skin)
	skinArr.push(i)
var skinList = []
module.exports = function() {
	var self = this
	//每日刷新
	this.rechargeDayUpdate = function() {
		skinList = util.getRandomArray(skinArr,6)
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
	this.dianpiao_recharge = function(uid,pay_id,cb) {
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
				if(pay_cfg[pay_id]["dianpiao"] == 0){
					self.finish_recharge(uid,pay_id,cb)
				}else{
					self.consumeItems(uid,"110:"+pay_cfg[pay_id]["dianpiao"],1,"点票支付",function(flag,err) {
						if(flag){
							self.incrbyPlayerData(uid,"diaopiao_use",pay_cfg[pay_id]["dianpiao"])
							self.finish_recharge(uid,pay_id,cb)
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
	this.apply_recharge = function(uid,unionid,pay_id,cb) {
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
				self.create_recharge(uid,unionid,pay_id,cb)
			})
		}else{
			self.create_recharge(uid,unionid,pay_id,cb)
		}
	}
	this.create_recharge = function(uid,unionid,pay_id,cb) {
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
				self.addUserRMB(uid,pay_cfg[pay_id]["rmb"])
				var notify = {
					type : "finish_recharge",
					pay_id : pay_id,
					data : data
				}
				self.sendToUser(uid,notify)
			}
		}
		if(!pay_cfg[pay_id]){
			cb(false)
			return
		}
		self.finish_pay(uid,pay_id,call_back)
		cb(true)
	}
	self.finish_pay = function(uid,pay_id,call_back) {
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
			case "quick_pri":
				this.buyQuickPri(uid,call_back.bind(this,uid))
			break
			case "tour_pri":
				this.buyTourPri(uid,call_back.bind(this,uid))
			break
			case "stone_pri":
				this.buyStonePri(uid,call_back.bind(this,uid))
			break
			case "gift_loop":
				this.buyLoopGift(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "gift_skin":
				this.buyLimitSkin(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "wuxian":
				this.buyWuxian(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "finish":
				this.finish_item(uid,pay_cfg[pay_id]["arg"],call_back.bind(this,uid))
			break
			case "fast":
				this.buyFastRecharge(uid,pay_id,call_back.bind(this,uid))
			break
			case "area_gift":
				this.buyAreaGift(uid,pay_id,call_back.bind(this,uid))
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
		if(cb)
			cb(true)
	}
	//充值
	this.recharge = function(uid,index,cb) {
		self.incrbyObj(uid,main_name,"recharge_once_"+index,1,function(data) {
			var notify = {
				type : "recharge_once_update",
				index : index,
				curValue : data
			}
			self.sendToUser(uid,notify)
		})
		self.incrbyObj(uid,main_name,"recharge_"+index,1,function(data) {
			var gold = recharge[index].gold
			var rate = 0
			if(data == 1)
				rate = recharge[index].first_rate
			else
				rate = recharge[index].normal_rate
			var award = self.addItem({uid:uid,itemId:202,value:gold,rate:rate,reason:"充值"})
			cb(true,{awardList:[award]})
		})
	}
	//直接获得道具
	this.finish_item = function(uid,str,cb) {
		var awardList = self.addItemStr(uid,str,1,"直接充值"+str)
		cb(true,{awardList:awardList})
	}
	//快速充值
	this.buyFastRecharge = function(uid,pay_id,cb) {
		self.sendMail(uid,"充值奖励","感谢您的充值,这是您的充值奖励,请查收。",pay_cfg[pay_id]["award"])
		cb(true)
	}
	//新服限购
	this.buyAreaGift = function(uid,pay_id,cb) {
		self.sendMail(uid,"充值奖励","感谢您的充值,这是您的充值奖励,请查收。",pay_cfg[pay_id]["award"])
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
	//购买循环礼包
	this.buyLoopGift = function(uid,loopId,cb) {
		if(!loopId || !gift_loop[loopId]){
			cb(false,"礼包不存在")
			return
		}
		self.getObj(uid,main_name,"loop_"+loopId,function(data) {
			if(data > 0){
				console.log("循环礼包已购买",loopId)
			}
			self.incrbyObj(uid,main_name,"loop_"+loopId,1)
			var award = "202:"+gift_loop[loopId].gold
			award += "&"+gift_loop[loopId].award
			var awardList = self.addItemStr(uid,award,1,"循环礼包"+loopId)
			cb(true,{awardList:awardList})
		})
	}
	//激活等级基金
	this.activateLvFund = function(uid,cb) {
		self.getObj(uid,main_name,"lv_fund",function(data) {
			if(data){
				cb(false,"已激活基金")
			}else{
				self.setObj(uid,main_name,"lv_fund",1)
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
			if(self.players[uid]){
				var notify = {
					type : "addUserRMB",
					rmb_day : self.players[uid].rmb_day,
					rmb : self.players[uid].rmb,
					week_rmb : self.players[uid].week_rmb
				}
				self.sendToUser(uid,notify)
			}
		})
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
			if(self.players[uid]){
				var notify = {
					type : "addUserRMB",
					rmb_day : self.players[uid].rmb_day,
					rmb : self.players[uid].rmb,
					week_rmb : self.players[uid].week_rmb
				}
				self.sendToUser(uid,notify)
			}
		})
	}
	//增加VIP经验
	this.addUserVIPExp = function(uid,exp) {
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
	this.activateHighCard = function(uid,cb) {
		self.getObj(uid,main_name,"highCard",function(data) {
			if(data){
				var awardList = self.addItemStr(uid,"202:2000",1,"激活至尊特权")
				cb(true,{awardList:awardList})
			}else{
				self.setObj(uid,main_name,"highCard",1)
				self.chageLordData(uid,"highCard",1)
				var awardList = self.addItemStr(uid,activity_cfg["high_card_award"]["value"],1,"激活至尊特权")
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
			if(data >= awardBag_day[index]["limit"]){
				cb(false,"已限购")
				return
			}
			self.incrbyObj(uid,main_name,"bagDay_"+index,1)
			var awardList = self.addItemStr(uid,awardBag_day[index].award,1,"每日礼包"+index)
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
				self.getObjAll(uid,"skin",function(data) {
					info.skin_shop = data || {}
					info.skinList = skinList
					cb(true,info)
				})
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
			self.incrbyObj(uid,"week_shop",index,1)
			var awardList = self.addItemStr(uid,gift_week[index].award,1,"每周礼包"+index)
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
			self.incrbyObj(uid,"month_shop",index,1)
			var awardList = self.addItemStr(uid,gift_month[index].award,1,"每月礼包"+index)
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
			self.setObj(uid,"war_horn","high",1)
			self.incrbyObj(uid,"war_horn","exp",war_horn[curMonth]["exp"],function(exp) {
				var awardList = self.addItemStr(uid,war_horn[curMonth]["award"],1,"激活战令")
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
				var awardList = self.addItemStr(uid,gift_list[id]["award"],1,"限时礼包"+id)
				self.delObj(uid,"limit_gift",id)
				cb(true,{awardList:awardList})
			}else{
				cb(false,"限时礼包不存在或已过期")
				return
			}
		})
	}
	//购买皮肤
	this.buyLimitSkin = function(uid,id,cb) {
		console.log("buyLimitSkin",uid,id)
		if(!gift_skin[id]){
			cb(false,"限时礼包错误")
			return
		}
		self.getObj(uid,"skin",id,function(data) {
			data = Number(data) || 0
			if(data >= gift_skin[id]["limit"]){
				cb(false,"已限购")
				return
			}
			self.incrbyObj(uid,"skin",id,1)
			var awardList = self.addItemStr(uid,gift_skin[id].award,1,"购买皮肤")
			cb(true,{awardList:awardList})
		})
	}
	//购买快速作战特权
	this.buyQuickPri = function(uid,cb) {
		var  quick_pri = self.getLordAtt(uid,"quick_pri")
		if(!quick_pri || Date.now() > quick_pri){
			//新购
			quick_pri = util.getZeroTime() + day31Time
		}else{
			console.log("快速作战特权已购买，延长时间")
			//延长
			quick_pri += day31Time
		}
		self.chageLordData(uid,"quick_pri",quick_pri)
		var awardList = self.addItemStr(uid,activity_cfg["quick_award"]["value"],1,"快速作战特权")
		cb(true,{quick_pri:quick_pri,awardList:awardList})
	}
	//购买三界特权
	this.buyTourPri = function(uid,cb) {
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
		var awardList = self.addItemStr(uid,activity_cfg["tour_award"]["value"],1,"三界特权")
		cb(true,{tour_pri:tour_pri,awardList:awardList})
	}
	//购买宝石矿场特权
	this.buyStonePri = function(uid,cb) {
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
		var awardList = self.addItemStr(uid,activity_cfg["stone_award"]["value"],1,"宝石矿场特权")
		cb(true,{stone_pri:stone_pri,awardList:awardList})
	}
}