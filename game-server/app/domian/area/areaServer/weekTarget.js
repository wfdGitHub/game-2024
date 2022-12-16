//七日目标
var week_goods = require("../../../../config/gameCfg/week_goods.json")
var week_day = require("../../../../config/gameCfg/week_day.json")
var week_box = require("../../../../config/gameCfg/week_box.json")
var area_party_cfg = require("../../../../config/gameCfg/area_party_cfg.json")
var async = require("async")
var main_name = "week_target"
module.exports = function() {
	var self = this
	var index = 0
	//每日更新
	this.weekTaskDayUpdate = function() {
		index = Math.ceil(self.areaDay / 7)
		if(!area_party_cfg[index])
			index = -1
	}
	//获取七日目标数据
	this.getWeekTargetData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			for(var i in data){
				data[i] = Number(data[i])
			}
			if(index == -1 && !data["finish"]){
                self.clearWeekTarget(uid)
                data["finish"] = 1
                self.setObj(uid,main_name,"finish",1)
			}else if(index != 0 && data["index"] != index){
				self.gainWeekTask(uid)
				self.setObj(uid,main_name,"index",index)
				data["taskCount"] = 0
				self.setObj(uid,"week_target","taskCount",0)
			}
			data["index"] = index
			cb(true,data)
		})
	}
	//领取七天登陆礼包
	this.gainLoginAward = function(uid,day,cb) {
		if(!week_day[day] || !week_day[day]["login_award"]){
			cb(false,"每日礼包不存在")
			return
		}
		if(day > self.players[uid].userDay){
			cb(false,"不可领取 "+self.players[uid].userDay+"/"+day)
			return
		}
		self.getObj(uid,main_name,"login_award"+day,function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"login_award"+day,1)
			let awardList = self.addItemStr(uid,week_day[day]["login_award"],1,"七天登录"+day)
			cb(true,awardList)
		})
	}
	// //领取每日礼包
	// this.gainDayAward = function(uid,day,cb) {
	// 	if(!week_day[day] || !week_day[day]["day_award"]){
	// 		cb(false,"每日礼包不存在")
	// 		return
	// 	}
	// 	if(day > self.players[uid].userDay){
	// 		cb(false,"不可领取 "+self.players[uid].userDay+"/"+day)
	// 		return
	// 	}
	// 	self.getObj(uid,main_name,"day_award"+day,function(data) {
	// 		if(data){
	// 			cb(false,"已领取")
	// 			return
	// 		}
	// 		self.incrbyObj(uid,main_name,"day_award"+day,1)
	// 		let awardList = self.addItemStr(uid,week_day[day]["day_award"],1,"七日目标登录礼包"+day)
	// 		cb(true,awardList)
	// 	})
	// }
	// //领取等级礼包
	// this.gainLvAward = function(uid,day,cb) {
	// 	if(!week_day[day] || !week_day[day]["lv_award"]){
	// 		cb(false,"等级礼包不存在")
	// 		return
	// 	}
	// 	if(day > self.players[uid].userDay){
	// 		cb(false,"不可领取 "+self.players[uid].userDay+"/"+day)
	// 		return
	// 	}
	// 	if(self.getLordLv(uid) < week_day[day]["lv_limit"]){
	// 		cb(false,"等级不足")
	// 		return
	// 	}
	// 	self.getObj(uid,main_name,"lv_award"+day,function(data) {
	// 		if(data){
	// 			cb(false,"已领取")
	// 			return
	// 		}
	// 		self.incrbyObj(uid,main_name,"lv_award"+day,1)
	// 		let awardList = self.addItemStr(uid,week_day[day]["lv_award"],1,"七日目标等级礼包"+day)
	// 		cb(true,awardList)
	// 	})
	// }
	// //领取充值礼包
	// this.gainRmbAward = function(uid,day,cb) {
	// 	if(!week_day[day] || !week_day[day]["rmb_award"]){
	// 		cb(false,"等级礼包不存在")
	// 		return
	// 	}
	// 	if(day > self.players[uid].userDay){
	// 		cb(false,"不可领取 "+self.players[uid].userDay+"/"+day)
	// 		return
	// 	}
	// 	self.getObj(uid,"playerInfo","rmb_day",function(rmb) {
	// 		if(!rmb || rmb <= 0){
	// 			cb(false,"条件不足")
	// 			return
	// 		}
	// 		self.getObj(uid,main_name,"rmb_award"+day,function(data) {
	// 			if(data){
	// 				cb(false,"已领取")
	// 				return
	// 			}
	// 			self.incrbyObj(uid,main_name,"rmb_award"+day,1)
	// 			let awardList = self.addItemStr(uid,week_day[day]["rmb_award"])
	// 			cb(true,awardList)
	// 		})
	// 	})
	// }
	// //购买限购礼包
	// this.buyWeekTargetGoods = function(uid,day,index,cb) {
	// 	if(!week_day[day] || !week_day[day]["goods"+index]){
	// 		cb(false,"限购礼包不存在")
	// 		return
	// 	}
	// 	let goodsId = week_day[day]["goods"+index]
	// 	if(!week_goods[goodsId]){
	// 		cb(false,"配置错误"+goodsId)
	// 		return
	// 	}
	// 	if(day > self.players[uid].userDay){
	// 		cb(false,"不可购买 "+self.players[uid].userDay+"/"+day)
	// 		return
	// 	}
	// 	self.getObj(uid,main_name,"goods:"+day+":"+index,function(data) {
	// 		if(data){
	// 			cb(false,"已购买")
	// 			return
	// 		}
	// 		self.consumeItems(uid,week_goods[goodsId].pc,1,"七日目标限时礼包_"+day+"_"+index,function(flag,err) {
	// 			if(flag){
	// 				self.incrbyObj(uid,main_name,"goods:"+day+":"+index,1)
	// 				let awardList = self.addItemStr(uid,week_goods[goodsId].pa,1,"七日目标限购礼包_"+day+"_"+index)
	// 				cb(true,awardList)
	// 			}else{
	// 				cb(false,err)
	// 			}
	// 		})
	// 	})
	// }
	//领取七日目标宝箱
	this.gainWeekTargetBox = function(uid,boxId,cb) {
		if(!week_box[boxId]){
			cb(false,"宝箱不存在")
			return
		}
		self.getObj(uid,main_name,"taskCount",function(data) {
			data = Number(data) || 0
			if(data < week_box[boxId]["value"]){
				cb(false,"未达成目标")
				return
			}
			self.getObj(uid,main_name,"box"+boxId,function(data) {
				if(data){
					cb(false,"已领取")
					return
				}
				self.incrbyObj(uid,main_name,"box"+boxId,1)
				let awardList = self.addItemStr(uid,week_box[boxId]["award"],1,"七日目标宝箱"+boxId)
				cb(true,awardList)
			})
		})
	}
}