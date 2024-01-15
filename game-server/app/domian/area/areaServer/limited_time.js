//限时活动
const util = require("../../../../util/util.js")
const limited_time = require("../../../../config/gameCfg/limited_time.json")
const main_name = "limited_time"
const oneDayTime = 86400000
const limitedList = JSON.parse(limited_time["loop_activitie"]["value"])
const limitedDay = limited_time["loop_activitie"]["day"]
module.exports = function() {
	var self = this
	var list = {}
	//初始化活动
	this.initLimitedTime = function() {
		self.getAreaObjAll(main_name,function(data) {
			if(data){
				for(var id in data){
					list[id] = JSON.parse(data[id])
				}
			}
		})
	}
	//每日更新
	this.dayUpdateLimitedTime = function() {
		var curTime = Date.now()
		for(var id in list){
			if(list[id]["end"] <= curTime){
				self.endNewLimitedTime(id)
			}
		}
		// var day = util.getTimeDifference(0,Date.now())
		// if(day % limited_time["loop_day"]["value"] == 0){
		// 	//开启新活动
		// 	var index = day % limitedList.length
		// 	self.openNewLimitedTime(limitedList[index],limitedDay)
		// }
		if(self.areaDay == 1){
			self.openNewLimitedTime(limited_time["newArea"]["value"],limited_time["newArea"]["day"])
		}
	}
	//开启新活动
	this.openNewLimitedTime = function(id,day) {
		var info = {}
		info.begin = util.getZeroTime()
		info.end = info.begin + oneDayTime * day
		list[id] = info
		self.setAreaObj(main_name,id,JSON.stringify(info))
	}
	//活动结束
	this.endNewLimitedTime = function(id) {
		delete list[id]
		self.delAreaObj(main_name,id)
	}
	//检测活动是否开启
	this.checkLimitedTime = function(id) {
		return list[id]?true:false
	}
	//获取当前活动列表
	this.getLimitedTimeList = function() {
		return list
	}
}