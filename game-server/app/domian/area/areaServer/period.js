//周期活动
const period_cfg = require("../../../../config/gameCfg/period_cfg.json")
const util = require("../../../../util/util.js")
const main_name = "period"
const oneDayTime = 86400000
var MAX_ID = 0
var PER_KEYS = ["rmb"]
for(var i in period_cfg)
	if(Number(i) > MAX_ID)
		MAX_ID = Number(i)
MAX_ID += 1
for(var i = 1;i < 20;i++){
	if(period_cfg[0]["dbed_"+i] !== undefined){
		PER_KEYS.push("dbed_"+period_cfg[0]["dbed_"+i])
		PER_KEYS.push("dbjl_"+period_cfg[0]["dbed_"+i])
	}
	if(period_cfg[0]["lced_"+i] !== undefined)
		PER_KEYS.push("lcjl_"+period_cfg[0]["lced_"+i])
}
module.exports = function() {
	var self = this
	var index = -1
	var info = {
		"index" : -1,
		"state" : 1,//1  未开启  2开启中
		"endTime" : 0,//结束时间
	}
	//活动初始化
	this.updatePeriod = function() {
		self.getAreaObj(main_name,"info",function(data) {
			if(data)
				info = JSON.parse(data)
			if(info.state == 1){
				//判断开启
				if(self.areaDay > 1 && (self.areaDay+1) % 3 == 0){
					self.delAreaObjAll(main_name)
					info.index = Math.ceil((self.areaDay+1) / 3) % MAX_ID
					info.state = 2
					info.endTime = util.getZeroTime() + oneDayTime - 10000
				}
			}else if(info.state == 2 && Date.now() > info.endTime){
				//判断关闭
				info.state = 1
			}
			self.setAreaObj(main_name,"info",JSON.stringify(info))
		})
	}
	//获取周期活动数据
	this.methods.getPeriodData = function(uid,msg,cb) {
		var data = {}
		data.info = info
		var keys = []
		for(var i = 0;i < PER_KEYS.length;i++){
			keys.push(PER_KEYS[i]+"_"+uid)
		}
		self.getAreaHMObj(main_name,keys,function(list) {
			var userData = {}
			for(var i = 0;i < PER_KEYS.length;i++)
				userData[PER_KEYS[i]] = Number(list[i]) || 0
			data.userData = userData
			cb(true,data)
		})
	}
	//领取单笔奖励
	this.methods.gainPeriodDBAward = function(uid,msg,cb) {
		var id = msg.id
		if(info.state != 2 || !period_cfg[info.index]){
			cb(false,"活动未开启")
			return
		}
		if(!period_cfg[info.index]["dbed_"+id]){
			cb(false,"id error "+id)
			return
		}
		var rmb = period_cfg[info.index]["dbed_"+id]
		var keys = ["dbed_"+rmb+"_"+uid,"dbjl_"+rmb+"_"+uid]
		self.getAreaHMObj(main_name,keys,function(list) {
			list[0] = Number(list[0]) || 0
			list[1] = Number(list[1]) || 0
			if(!list[0] || list[1] >= list[0]){
				cb(false,"条件未达成或已领取")
				return
			}
			self.incrbyAreaObj(main_name,"dbjl_"+rmb+"_"+uid,1,function() {
				var awardList = self.addItemStr(uid,period_cfg[info.index]["dbjl_"+id],1,"限时单笔"+id)
				cb(true,awardList)
			})
		})
	}
	//领取累充奖励
	this.methods.gainPeriodLCAward = function(uid,msg,cb) {
		var id = msg.id
		if(info.state != 2 || !period_cfg[info.index]){
			cb(false,"活动未开启")
			return
		}
		if(!period_cfg[info.index]["lced_"+id]){
			cb(false,"id error "+id)
			return
		}
		var rmb = period_cfg[info.index]["lced_"+id]
		var keys = ["rmb_"+uid,"lcjl_"+rmb+"_"+uid]
		self.getAreaHMObj(main_name,keys,function(list) {
			list[0] = Number(list[0]) || 0
			if(list[0] < rmb || list[1]){
				cb(false,"条件未达成或已领取")
				return
			}
			self.incrbyAreaObj(main_name,"lcjl_"+rmb+"_"+uid,1,function() {
				var awardList = self.addItemStr(uid,period_cfg[info.index]["lcjl_"+id],1,"限时累充"+id)
				cb(true,awardList)
			})
		})
	}
	//玩家充值更新
	this.userPeriodRmb = function(uid,rmb,rate) {
		if(info.state == 2 && rmb && rate){
			self.incrbyAreaObj(main_name,"dbed_"+rmb+"_"+uid,rate)
			self.incrbyAreaObj(main_name,"rmb_"+uid,Math.round(rmb * rate))
		}
	}
}