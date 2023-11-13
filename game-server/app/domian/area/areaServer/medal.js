//徽章活动
const medal_cfg = require("../../../../config/gameCfg/medal_cfg.json")
const medal_lv = require("../../../../config/gameCfg/medal_lv.json")
const medal_list = require("../../../../config/gameCfg/medal_list.json")
const medal_gather = require("../../../../config/gameCfg/medal_gather.json")
const medal_rank = require("../../../../config/gameCfg/medal_rank.json")
const main_name = "medal"
const oneDayTime = 86400000
const oneHourTime = 3600000
const util = require("../../../../util/util.js")
const async = require("async")
const slotKey = ["value","s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12","s13","s14","s15","s16","s17","s18","s19","s20"]
const openAwards = JSON.parse(medal_cfg["award"]["value"])
const day_task = JSON.parse(medal_cfg["day_task"]["value"])
const always_task = JSON.parse(medal_cfg["always_task"]["value"])
const lv_map = {}
for(var i in medal_list){
	if(!lv_map[medal_list[i]["lv"]])
		lv_map[medal_list[i]["lv"]] = []
	lv_map[medal_list[i]["lv"]].push(Number(i))
}
module.exports = function() {
	var self = this
	var local = {}
	var medalInfo = {"state" : 0}
	var timer
	//初始化
	this.medalInit = function() {
		if(!self.newArea)
			return
		//state 0 未开启 1 开启中   2  已结束
		self.getAreaHMObj(main_name,["state","beginTime","endTime"],function(list) {
			medalInfo.state = Number(list[0]) || 0
			if(!medalInfo.state){
				//未开启
				medalInfo.beginTime = util.getZeroTime(self.openTime) + (medal_cfg["open"]["value"] - 1) * oneDayTime + medal_cfg["hour"]["value"] * oneHourTime
				medalInfo.endTime = medalInfo.beginTime + medal_cfg["duration"]["value"] * oneDayTime
				self.setAreaHMObj(main_name,medalInfo)
			}else{
				//已开启
				medalInfo.beginTime = Number(list[1]) || 0
				medalInfo.endTime = Number(list[2]) || 0
			}
			if(medalInfo.state != 2)
				timer = setInterval(local.medalUpdate,10000)
		})
	}
	//定时器刷新
	local.medalUpdate = function() {
		switch(medalInfo.state){
			case 0:
				if(Date.now() >= medalInfo.beginTime)
					local.openActivity()
			break
			case 1:
				if(Date.now() >= medalInfo.endTime)
					local.endActivity()
			break
			case 2:
				clearInterval(timer)
			break
		}
	}
	//活动开启
	local.openActivity = function() {
		medalInfo.state = 1
		self.setAreaObj(main_name,"state",medalInfo.state)
	}
	//活动结束
	local.endActivity = function() {
		medalInfo.state = 2
		self.setAreaObj(main_name,"state",medalInfo.state)
		local.sendRankAward()
	}
	//获取数据  徽章列表  图鉴 奖励
	this.methods.getMedalData = function(uid,msg,cb) {
		if(medalInfo.state != 1){
			cb(true,{medalInfo:medalInfo})
			return
		}
		self.getObjAll(uid,main_name,function(data) {
			if(!data){
				local.gainMedalAlwaysTask(uid)
				data = {}
				//徽章槽位
				for(var i = 1;i <= 20;i++)
					data["s"+i] = 0
				data.value = 0
				self.setHMObj(uid,main_name,data)
			}else{
				for(var i in data)
					data[i] = Number(data[i])
			}
			if(data["day"] != self.areaDay){
				data["day"] = self.areaDay
				self.setObj(uid,main_name,"day",data["day"])
				local.gainMedalDayTask(uid)
			}
			cb(true,{medalInfo:medalInfo,info:data})
		})
	}
	//开启盲盒
	this.methods.openMedalBox = function(uid,msg,cb) {
		var count = msg.count
		if(medalInfo.state != 1){
			cb(false,"活动未开启")
			return
		}
		if(!Number.isInteger(count) || count < 1){
			cb(false,"参数错误")
			return
		}
		var info = {}
		async.waterfall([
			function(next) {
				//获取数据
				self.getHMObj(uid,main_name,slotKey,function(list) {
					for(var i = 0;i < slotKey.length;i++)
						info[slotKey[i]] = Number(list[i]) || 0
					if(count > (20 - info["value"])){
						next("格子不足")
						return
					}
					next()
				})
			},
			function(next) {
				//消耗道具
				self.consumeItems(uid,medal_cfg["item"]["value"],count,"开启盲盒",function(flag,err) {
					if(!flag){
						next(err)
						return
					}
					next()
				})
			},
			function(next) {
				var medals = []
				var awardList = []
				for(var i = 0;i < count;i++){
					//获取奖励
					awardList = awardList.concat(self.addItemStr(uid,util.getRandomOne(openAwards),1,"开启盲盒"))
					//获取徽章
					if(Math.random() < medal_lv[1]["lotto"])
						medals.push(util.getRandomOne(lv_map[1]))
					else
						medals.push(util.getRandomOne(lv_map[2]))
				}
				var len = 0
				info["value"] += count
				for(var i = 1;i <= 20 && len < medals.length;i++){
					if(info["s"+i] == 0){
						info["s"+i] = medals[len]
						info["g"+medals[len]] = 1
						len++
					}
				}
				self.setHMObj(uid,main_name,info)
				self.updateSprintRank(main_name,uid,count)
				cb(true,{info:info,awardList:awardList,medals:medals})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//出售徽章
	this.methods.sellMedal = function(uid,msg,cb) {
		var slot = msg.slot
		//获取数据
		self.getObj(uid,main_name,"s"+slot,function(data) {
			var mId = Number(data) || 0
			if(!mId){
				cb(false,"徽章不存在")
				return
			}
			self.setObj(uid,main_name,"s"+slot,0)
			self.incrbyObj(uid,main_name,"value",-1,function(value) {
				var info = {"value" : value}
				info["s"+slot] = 0
				var awardList = self.addItemStr(uid,"201:"+medal_lv[medal_list[mId]["lv"]]["pr"],1,"出售徽章")
				cb(true,{awardList:awardList,info:info})
			})
		})
	}
	//合成徽章
	this.methods.composeMedal = function(uid,msg,cb) {
		var slot1 = msg.slot1
		var slot2 = msg.slot2
		if(medalInfo.state != 1){
			cb(false,"活动未开启")
			return
		}
		if(!Number.isInteger(slot1) || !Number.isInteger(slot2) || slot1 == slot2){
			cb(false,"参数错误")
			return
		}
		//获取数据
		self.getHMObj(uid,main_name,["s"+slot1,"s"+slot2],function(list) {
			var mId1 = Number(list[0]) || 0
			var mId2 = Number(list[1]) || 0
			if(!mId1 || !mId2){
				cb(false,"徽章不存在")
				return
			}
			var lv = medal_list[mId1]["lv"]
			if(medal_list[mId1]["lv"] != medal_list[mId2]["lv"] || !medal_lv[lv]["up_rate"]){
				cb(false,"等级错误")
				return
			}
			self.setObj(uid,main_name,"s"+slot2,0)
			self.incrbyObj(uid,main_name,"value",-1,function(value) {
				var info = {"value" : value}
				if(Math.random() < medal_lv[lv]["up_rate"])
					info["s"+slot1] = util.getRandomOne(lv_map[lv + 1])
				else
					info["s"+slot1] = util.getRandomOne(lv_map[lv])
				info["g"+info["s"+slot1]] = 1
				info["s"+slot2] = 0
				self.setHMObj(uid,main_name,info)
				cb(true,{info:info})
			})
		})
	}
	//领取收集奖励
	this.methods.gainMedalGatherAward = function(uid,msg,cb) {
		var tId = msg.tId
		if(!medal_gather[tId]){
			cb(false,"奖励不存在")
			return
		}
		var arr = ["t"+tId]
		for(var i in medal_gather[tId]["list"])
			arr.push("g"+medal_gather[tId]["list"][i])
		self.getHMObj(uid,main_name,arr,function(list) {
			if(list[0]){
				cb(false,"已领取")
				return
			}
			for(var i = 1;i < list.length;i++){
				if(!list[i]){
					cb(false,"条件未达成")
					return
				}
			}
			self.incrbyObj(uid,main_name,"t"+tId,1,function(data) {
				var info = {}
				info["t"+tId] = data
				var awardList = self.addItemStr(uid,medal_gather[tId]["award"],1,"收集徽章")
				cb(true,{info:info,awardList:awardList})
			})
		})
	}
	//获取排名
	this.methods.getMedalRank = function(uid,msg,cb) {
		self.zrevrangewithscore(main_name,0,9,function(list) {
			var info = {}
			info.uids = []
			info.scores = []
			for(var i = 0;i < list.length;i += 2){
				info.uids.push(list[i])
				info.scores.push(Math.floor(list[i+1]))
			}
			self.getPlayerInfoByUids(info.uids,function(userInfos) {
				info.userInfos = userInfos
				self.zrevrank(main_name,uid,function(data) {
					info.myRank = data
					self.zrangeScoreByKey(main_name,uid,function(data) {
						info.myScore = Math.floor(data)
						cb(true,info)
					})
				})
			})
		})
	}
	//发放排名奖励
	local.sendRankAward = function() {
		self.incrbyAreaObj(main_name,"settle",1,function(data) {
			if(data != 1)
				return
			var index = 0
			self.zrevrange(main_name,0,-1,function(list) {
				for(var i = 0;i < list.length;i++){
					var rank = i + 1
					if(rank > medal_rank[index]["count"] && medal_rank[index+1])
						index++
					self.sendTextToMail(list[i],main_name,medal_rank[index]["award"],rank)
				}
			})
		})
	}
	//领取成就任务
	local.gainMedalAlwaysTask = function(uid) {
		for(var i in always_task)
			self.gainTask(uid,always_task[i])
	}
	//领取每日任务
	local.gainMedalDayTask = function(uid) {
		for(var i in day_task)
			self.gainTask(uid,day_task[i])
	}
}