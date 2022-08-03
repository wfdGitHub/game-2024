//特权礼包
const async = require("async")
const util = require("../../../../util/util.js")
const privilege_gift = require("../../../../config/gameCfg/privilege_gift.json")
const oneDayTime = 86400000
const main_name = "privilege"
module.exports = function() {
	var self = this
	//每日更新
	this.priDayUpdate = function(uid) {
		for(var pId in privilege_gift)
			self.delObj(uid,main_name,"day_"+pId)
	}
	//获取特权礼包数据
	this.priGetData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			cb(true,data)
		})
	}
	//购买特权礼包
	this.priBuyGift = function(uid,pId,cb) {
		if(!privilege_gift[pId]){
			cb(false,"特权礼包不存在"+pId)
			return
		}
		var zeroTime = util.getZeroTime()
		self.getObj(uid,main_name,"pri_"+pId,function(data) {
			data = Number(data) || 0
			if(data < zeroTime)
				data = zeroTime
			data += privilege_gift[pId]["duration"] * oneDayTime
			self.setObj(uid,main_name,"pri_"+pId,data,function() {
				var notify = {
					type : "pri_buy",
					pId : pId,
					endTime : data,
					awardList : self.addItemStr(uid,privilege_gift[pId]["buy_award"],1,"特权购买"+pId)
				}
				self.sendToUser(uid,notify)
				cb(true)
			})
		})

	}
	//领取特权礼包每日奖励
	this.priGainGift = function(uid,pId,cb) {
		if(!privilege_gift[pId]){
			cb(false,"特权礼包不存在"+pId)
			return
		}
		async.waterfall([
			function(next) {
				//特权时间
				self.getObj(uid,main_name,"pri_"+pId,function(endTime) {
					endTime = Number(endTime) || 0
					if(Date.now() > endTime){
						next("已过期"+endTime+"/"+Date.now())
					}else{
						next()
					}
				})
			},
			function(next) {
				//领取状态
				self.getObj(uid,main_name,"day_"+pId,function(data) {
					if(data){
						next("今日已领取")
					}else{
						next()
					}
				})
			},
			function(next) {
				//获取奖励
				self.setObj(uid,main_name,"day_"+pId,1)
				var awardList = self.addItemStr(uid,privilege_gift[pId]["day_award"],1,"特权奖励"+pId)
				cb(true,awardList)
			}
		],function(err) {
			cb(false,err)
		})
	}
}