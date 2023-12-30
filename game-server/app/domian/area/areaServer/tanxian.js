//探险玩法（云游）
const tanxian_cfg = require("../../../../config/gameCfg/tanxian_cfg.json")
const tanxian_type = require("../../../../config/gameCfg/tanxian_type.json")
const ONE_TIME = tanxian_cfg["tanxian_time"]["value"]
const BEGIN_TIME = tanxian_cfg["tanxian_begin"]["value"]
const MAX_TIME = tanxian_cfg["tanxian_maxTime"]["value"]
const main_name = "tanxian"
const async = require("async")
var util = require("../../../../util/util.js")
var taxianList = []
var taxianWeight = []
var curWeight = 0
for(var i in tanxian_type){
	if(tanxian_type[i]["teams"])
		tanxian_type[i]["teams"] = JSON.parse(tanxian_type[i]["teams"])
	tanxian_type[i]["id"] = i
	taxianList.push(tanxian_type[i])
	curWeight += tanxian_type[i]["weight"]
	taxianWeight.push(curWeight)
}
module.exports = function() {
	var self = this
	//探险每日刷新
	this.tanxianDayUpdate = function(uid) {
		self.setObj(uid,main_name,"live",0)
		for(var i = 1;i <= 6;i++)
			self.setObj(uid,main_name,"live_"+i,0)
	}
	//获取数据
	this.methods.getTanxianData = function(uid,msg,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			if(!data.action)
				data.action = Date.now() - BEGIN_TIME
			for(var i in data)
				data[i] = Number(data[i])
			self.setObj(uid,main_name,"action",data.action)
			cb(true,data)
		})
	}
	//开始探险
	this.methods.beginTanxian = function(uid,msg,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				self.tanxianAtiontime(uid,function(flag,action) {
					if(!flag){
						next("体力不足")
						return
					}
					info.action = action
					self.incrbyObj(uid,main_name,"live",1,function(live) {
						info.live = live
						next()
					})
				})
			},
			function(next) {
				var index = util.getWeightedRandomBySort(taxianWeight)
				info.id = taxianList[index]["id"]
				// if(taxianList[index]["type"] == 1){
				// 	//遇到怪物
				// 	var lv = self.getLordLv()
				// 	info.atkTeam = self.getUserTeam(uid)
				// 	info.npcTeam = taxianList[index]["teams"][Math.floor(Math.random() * taxianList[index]["teams"].length)]
				// 	info.defTeam = self.fightContorl.getNPCTeamByType(main_name,info.npcTeam,lv)
				// 	info.winFlag = self.fightContorl.beginFight(info.atkTeam,info.defTeam,{seededNum:Date.now()})
				// 	if(!info.winFlag){
				// 		cb(false,info)
				// 		return
				// 	}
				// }
				info.rate = 1
				var rand = Math.random()
				if(rand < 0.05)
					info.rate = 8
				else if(rand < 0.2)
					info.rate = 4
				else if(rand < 0.6)
					info.rate = 2
				info.awardList = self.addItemStr(uid,taxianList[index]["award"],info.rate,"探险")
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取进度奖励
	this.methods.gainTanxianLiveAward = function(uid,msg,cb) {
		var index = msg.index
		var info = {}
		self.getObj(uid,main_name,"live",function(live) {
			var live = Number(live) || 0
			if(!tanxian_cfg["live_"+index]  || live < tanxian_cfg["live_"+index]["value"]){
				cb(false,"条件未达成")
				return
			}
			self.incrbyObj(uid,main_name,"live_"+index,1,function(data) {
				if(data !== 1){
					cb(false,"已领取")
					return
				}
				info["live_"+index] = data
				info.awardList = self.addItemStr(uid,tanxian_cfg["live_"+index]["award"],1,"探险进度")
				cb(true,info)
			})
		})
	}
	//消耗体力
	this.tanxianAtiontime = function(uid,cb) {
		self.getObj(uid,main_name,"action",function(action) {
			action = Number(action) || 0
			var diff = Date.now() - action
			if(diff < ONE_TIME){
				cb(false,"体力不足")
				return
			}
			if(diff > MAX_TIME)
				action = Date.now() - MAX_TIME
			action += ONE_TIME
			self.setObj(uid,main_name,"action",action)
			cb(true,action)
		})
	}
}