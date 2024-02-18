//周末活动
const weekend_cfg = require("../../../../config/gameCfg/weekend_cfg.json")
const util = require("../../../../util/util.js")
const main_name = "weekend"
const oneDayTime = 86400000
const MAX_NUM = 30000000000000
var MAX_ID = 0
var PER_KEYS = ["rmb"]
for(var i in weekend_cfg)
	if(Number(i) > MAX_ID)
		MAX_ID = Number(i)
MAX_ID += 1
for(var i = 1;i < 20;i++){
	if(weekend_cfg[0]["lced_"+i] !== undefined)
		PER_KEYS.push("lcjl_"+weekend_cfg[0]["lced_"+i])
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
	this.updateWeekend = function() {
		self.getAreaObj(main_name,"info",function(data) {
			if(data)
				info = JSON.parse(data)
			if(info.state == 1){
				//判断开启
				var day = (new Date()).getDay()
				//周5 6 7开启
				if(day == 0 || day == 5 || day == 6){
					self.delAreaObjAll(main_name)
					self.delZset(main_name+"_rank")
					info.state = 2
					info.endTime = util.getWeekZeroTime() + oneDayTime * 7 - 10000
					info.index = util.getWeekNum() % MAX_ID
				}
			}else if(info.state == 2 && Date.now() > info.endTime){
				//判断关闭
				info.state = 1
				self.endWeekend()
			}
			self.setAreaObj(main_name,"info",JSON.stringify(info))
		})
	}
	//获取周末活动数据
	this.methods.getWeekendData = function(uid,msg,cb) {
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
			self.zrevrangewithscore(main_name+"_rank",0,9,function(list) {
				var rankInfo = {}
				rankInfo.uids = []
				rankInfo.scores = []
				for(var i = 0;i < list.length;i += 2){
					rankInfo.uids.push(list[i])
					rankInfo.scores.push(Math.floor(list[i+1]))
				}
				self.getPlayerInfoByUids(rankInfo.uids,function(userInfos) {
					rankInfo.userInfos = userInfos
					data.rankInfo = rankInfo
					cb(true,data)
				})
			})
		})
	}
	//领取累充奖励
	this.methods.gainWeekendLCAward = function(uid,msg,cb) {
		var id = msg.id
		if(info.state != 2 || !weekend_cfg[info.index]){
			cb(false,"活动未开启")
			return
		}
		if(!weekend_cfg[info.index]["lced_"+id]){
			cb(false,"id error "+id)
			return
		}
		var rmb = weekend_cfg[info.index]["lced_"+id]
		var keys = ["rmb_"+uid,"lcjl_"+rmb+"_"+uid]
		self.getAreaHMObj(main_name,keys,function(list) {
			list[0] = Number(list[0]) || 0
			if(list[0] < rmb || list[1]){
				cb(false,"条件未达成或已领取")
				return
			}
			self.incrbyAreaObj(main_name,"lcjl_"+rmb+"_"+uid,1,function() {
				var awardList = self.addItemStr(uid,weekend_cfg[info.index]["lcjl_"+id],1,"限时累充"+id)
				cb(true,awardList)
			})
		})
	}
	//玩家充值更新
	this.userWeekendRmb = function(uid,rmb,rate) {
		if(info.state == 2 && rmb && rate){
			var value = Math.round(rmb * rate)
			self.incrbyAreaObj(main_name,"rmb_"+uid,value)
			self.incrbyZset(main_name+"_rank",uid,value,function(data) {
				data = Math.floor(data) + ((MAX_NUM - Date.now()) * 1e-14)
				self.addZset(main_name+"_rank",uid,data)
			})
		}
	}
	//活动关闭
	this.endWeekend = function() {
		//发放排行榜
		self.zrevrange(main_name+"_rank",0,9,function(list) {
			for(var i = 0;i <= 9;i++){
				var index = i+1
				self.sendTextToMail(list[i],"weekend",weekend_cfg[info.index]["rank_"+index],index)
			}
		})
	}
	//获取活动道具
	this.getWeekendHook = function() {
		if(info.state == 2 && weekend_cfg[info.index]){
			return weekend_cfg[info.index]["hook_item"]
		}
	}
}