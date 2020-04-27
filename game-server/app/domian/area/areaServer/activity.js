const sign_in_day = require("../../../../config/gameCfg/sign_in_day.json")
const sign_in_cfg = require("../../../../config/gameCfg/sign_in_cfg.json")
const online_time = require("../../../../config/gameCfg/online_time.json")
var main_name = "activity"
module.exports = function() {
	var self = this
	const baseInfo = {
		"signDay" : 1,
		"signCount" : 0,
		"boxDay" : 0,
		"box1" : 0,
		"box2" : 0,
		"onlineIndex" : 0
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
			self.setHMObj(uid,main_name,data)
		})
	}
	//模拟充值
	this.test_recharge = function(uid,rmb,cb) {
		if(!Number.isInteger(rmb)){
			cb(false,"参数错误")
			return
		}
		self.playerDao.setPlayerInfo({uid:uid,key:"rmb_day",value:rmb})
		self.playerDao.setPlayerInfo({uid:uid,key:"rmb",value:rmb})
		self.players[uid].rmb_day += rmb
		self.players[uid].rmb += rmb
		cb(true,{rmb_day : self.players[uid].rmb_day,rmb : self.players[uid].rmb})
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
}