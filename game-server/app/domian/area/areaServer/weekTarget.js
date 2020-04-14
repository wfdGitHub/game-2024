//七日目标
var week_goods = require("../../../../config/gameCfg/week_goods.json")
var week_day = require("../../../../config/gameCfg/week_day.json")
var async = require("async")
var main_name = "week_target"
module.exports = function() {
	var self = this
	//获取七日目标数据
	this.getWeekTargetData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(obj) {
			for(var i in obj){
				obj[i] = Number(obj[i])
			}
			cb(true,obj)
		})
	}
	//领取每日礼包
	this.gainDayAward = function(uid,day,cb) {
		if(!week_day[day] || !week_day[day]["day_award"]){
			cb(false,"每日礼包不存在")
			return
		}
		if(day > self.areaDay){
			cb(false,"不可领取 "+self.areaDay+"/"+day)
			return
		}
		self.getObj(uid,main_name,"day_award"+day,function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"day_award"+day,1)
			let awardList = self.addItemStr(uid,week_day[day]["day_award"])
			cb(true,awardList)
		})
	}
	//领取等级礼包
	this.gainLvAward = function(uid,day,cb) {
		if(!week_day[day] || !week_day[day]["lv_award"]){
			cb(false,"等级礼包不存在")
			return
		}
		if(day > self.areaDay){
			cb(false,"不可领取 "+self.areaDay+"/"+day)
			return
		}
		if(self.getLordLv(uid) < week_day[day]["lv_limit"]){
			cb(false,"等级不足")
			return
		}
		self.getObj(uid,main_name,"lv_award"+day,function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.incrbyObj(uid,main_name,"lv_award"+day,1)
			let awardList = self.addItemStr(uid,week_day[day]["lv_award"])
			cb(true,awardList)
		})
	}
	//领取充值礼包
	this.gainRmbAward = function(uid,day,cb) {
		if(!week_day[day] || !week_day[day]["rmb_award"]){
			cb(false,"等级礼包不存在")
			return
		}
		if(day > self.areaDay){
			cb(false,"不可领取 "+self.areaDay+"/"+day)
			return
		}
		self.getObj(uid,"playerInfo","rmb",function(rmb) {
			if(rmb < week_day[day]["rmb"]){
				cb(false,"条件不足")
				return
			}
			self.getObj(uid,main_name,"rmb_award"+day,function(data) {
				if(data){
					cb(false,"已领取")
					return
				}
				self.incrbyObj(uid,main_name,"rmb_award"+day,1)
				let awardList = self.addItemStr(uid,week_day[day]["rmb_award"])
				cb(true,awardList)
			})
		})
	}
	//购买限购礼包
	this.buyWeekTargetGoods = function(uid,day,index,cb) {
		if(!week_day[day] || !week_day[day]["goods"+index]){
			cb(false,"限购礼包不存在")
			return
		}
		let goodsId = week_day[day]["goods"+index]
		if(!week_goods[goodsId]){
			cb(false,"配置错误"+goodsId)
			return
		}
		if(day > self.areaDay){
			cb(false,"不可购买 "+self.areaDay+"/"+day)
			return
		}
		self.getObj(uid,main_name,"goods:"+day+":"+index,function(data) {
			if(data){
				cb(false,"已购买")
				return
			}
			self.consumeItems(uid,week_goods[goodsId].pc,1,function(flag,err) {
				if(flag){
					self.incrbyObj(uid,main_name,"goods:"+day+":"+index,1)
					let awardList = self.addItemStr(uid,week_goods[goodsId].pa)
					cb(true,awardList)
				}else{
					cb(false,err)
				}
			})
		})
	}
}