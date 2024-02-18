//七日目标
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
		index = Math.ceil(self.areaDay / 3)
		if(!area_party_cfg[index])
			index = -1
	}
	//七日目标刷新
	this.weekTargetRefresh = function(uid) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			for(var i in data){
				data[i] = Number(data[i])
			}
			if(index != 0 && data["index"] != index){
				self.gainWeekTask(uid)
				self.setObj(uid,main_name,"index",index)
				self.setObj(uid,"week_target","taskCount",0)
				for(var boxId in week_box){
					self.delObj(uid,main_name,"box"+boxId)
				}
			}
		})
	}
	//获取七日目标数据
	this.getWeekTargetData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			for(var i in data){
				data[i] = Number(data[i])
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