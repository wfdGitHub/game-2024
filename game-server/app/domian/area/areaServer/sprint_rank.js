//新服冲榜
const sprint_rank = require("../../../../config/gameCfg/sprint_rank.json")
const main_name = "sprint_rank"
const rankTime = 86400000
const MAX_NUM = 30000000000000
var rankCount = 0
var rank_type_day = {}
for(var i in sprint_rank){
	rankCount++
	rank_type_day[sprint_rank[i]["rank_type"]] = rankCount
}
module.exports = function() {
	var self = this
	var timer = 0
	var curRankIndex = -1
	var curTime = 0
	//初始化
	this.initSprintRank = function() {
		if(!self.newArea){
			return
		}
		self.getAreaObjAll(main_name,function(data) {
			if(!data){
				data = {
					index : 1,
					time : Date.now() + rankTime
				}
				self.setAreaHMObj(main_name,data)
				curRankIndex = data.index
				curTime = data.time
				timer = setTimeout(self.settleSprintRank.bind(this),rankTime)
			}else{
				curRankIndex = Number(data.index)
				curTime = Number(data.time)
				if(curRankIndex != -1){
					var dt = Number(data.time) - Date.now()
					timer = setTimeout(self.settleSprintRank.bind(this),dt)
				}
			}
		})
	}
	//结算排行榜
	this.settleSprintRank = function() {
		clearTimeout(timer)
		if(sprint_rank[curRankIndex]){
			var rankType = sprint_rank[curRankIndex]["rank_type"]
			self.zrangewithscore(rankType,0,-1,function(list) {
				var rank = 0
				var saveDate = []
				for(var i = list.length - 2;i >= 0;i -= 2){
					rank++
					if(rank >= 11)
						rank = 11
					var score = Math.floor(list[i+1])
	                var award = ""
	                award = sprint_rank[curRankIndex]["rank_"+rank]
	                if(score >= sprint_rank[curRankIndex]["extra_premise"]){
	                    award += "&"+sprint_rank[curRankIndex]["extra_award"]
	                }
					if(rank >= 11){
						self.sendTextToMail(list[i],"sprint_play",award)
					}else{
						self.incrbyZset(rankType+"_settle",list[i],score)
						self.sendTextToMail(list[i],"sprint_rank",award,rank)
					}
				}
				curRankIndex++
				var data = {}
				if(sprint_rank[curRankIndex]){
					data = {
						index : curRankIndex,
						time : Date.now() + rankTime
					}
					curRankIndex = data.index
					curTime = data.time
					self.setAreaHMObj(main_name,data)
					timer = setTimeout(self.settleSprintRank.bind(this),rankTime)
				}else{
					data = {
						index : -1,
						time : 0
					}
					curRankIndex = data.index
					curTime = data.time
					self.setAreaHMObj(main_name,data)
				}
				var notify = {
					type : "settleSprintRank",
					curRankIndex : data.index,
					time : data.time
				}
				self.sendAllUser(notify)
			})
		}
	}
	//获取当前排行榜
	this.getSprintRank = function(cb) {
		if(sprint_rank[curRankIndex]){
			self.zrangewithscore(sprint_rank[curRankIndex]["rank_type"],-10,-1,function(list) {
				var uids = []
				var scores = []
				for(var i = 0;i < list.length;i += 2){
					uids.push(list[i])
					scores.push(Math.floor(list[i+1]))
				}
				self.getPlayerInfoByUids(uids,function(userInfos) {
					var info = {}
					info.userInfos = userInfos
					info.scores = scores
					info.curRankIndex = curRankIndex
					info.time = curTime
					cb(true,info)
				})
			})
		}else{
			cb(false,"已结束")
			return
		}
	}
	//获取已结算排行榜
	this.getSprintSettleRank = function(rankType,cb) {
		if(rank_type_day[rankType]){
			self.zrangewithscore(rankType+"_settle",-10,-1,function(list) {
				var uids = []
				var scores = []
				for(var i = 0;i < list.length;i += 2){
					uids.push(list[i])
					scores.push(Math.floor(list[i+1]))
				}
				self.getPlayerInfoByUids(uids,function(userInfos) {
					var info = {}
					info.userInfos = userInfos
					info.scores = scores
					info.curRankIndex = curRankIndex
					info.time = curTime
					cb(true,info)
				})
			})
		}else{
			cb(false,"结算排行榜不存在")
			return
		}
	}
	//获取指定排行榜
	this.getTotalRank = function(rankType,cb) {
		self.zrangewithscore(rankType,-10,-1,function(list) {
			var uids = []
			var scores = []
			for(var i = 0;i < list.length;i += 2){
				uids.push(list[i])
				scores.push(Math.floor(list[i+1]))
			}
			self.getPlayerInfoByUids(uids,function(userInfos) {
				var info = {}
				info.userInfos = userInfos
				info.scores = scores
				cb(true,info)
			})
		})
	}
	//更新排行榜
	this.updateSprintRank = function(rankType,uid,value) {
		console.log("updateSprintRank111",rankType,uid,value)
		self.incrbyZset(rankType,uid,value,function(data) {
			data = Math.floor(data) + ((MAX_NUM - Date.now()) * 1e-14)
			console.log("updateSprintRank222",data)
			self.addZset(rankType,uid,data)
		})
	}
	//获取排行榜第一玩家
	this.getfirstRankUserList = function(cb) {
		var multiList = []
		for(var i in sprint_rank){
			multiList.push(["zrange","area:area"+this.areaId+":zset:"+sprint_rank[i]["rank_type"],-1,-1,"WITHSCORES"])
		}
		self.redisDao.multi(multiList,function(err,list) {
			var uids = []
			var scores = []
			for(var i = 0;i < list.length;i ++){
				if(list[i] && list[i].length){
					uids.push(list[i][0])
					scores.push(Math.floor(list[i][1]))
				}else{
					uids.push(null)
					scores.push(null)
				}
			}
			self.getPlayerInfoByUids(uids,function(userInfos) {
				var info = {}
				info.userInfos = userInfos
				info.scores = scores
				cb(true,info)
			})
		})
	}
}