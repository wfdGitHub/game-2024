//限时活动
const util = require("../../../../util/util.js")
const main_name = "limited_time"
const oneDayTime = 86400000
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
				console.log("initLimitedTime",list)
			}
		})
	}
	//每日更新
	this.dayUpdateLimitedTime = function() {
		var curTime = Date.now()
		for(var id in list){
			if(list[id]["end"] <= curTime){
				console.log("活动时间结束",id)
				self.endNewLimitedTime(id)
			}
		}
	}
	//开启新活动
	this.openNewLimitedTime = function(id,day) {
		console.log("openNewLimitedTime",id,day)
		var info = {}
		info.begin = util.getZeroTime()
		console.log(util.getZeroTime(),oneDayTime)
		info.end = info.begin + oneDayTime * day
		list[id] = info
		self.setAreaObj(main_name,id,JSON.stringify(info))
	}
	//活动结束
	this.endNewLimitedTime = function(id) {
		console.log("endNewLimitedTime",id)
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