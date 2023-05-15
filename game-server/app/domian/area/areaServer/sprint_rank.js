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
const rankTypes = ["ce_rank","lv_rank","checkpoint_rank","ttt_rank","seas_rank","guild_rank","gift_rank","manor_rank"]
module.exports = function() {
	var self = this
	var curRankIndex = -1
	var settleTime = 0
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
			}
			curRankIndex = Number(data.index)
			settleTime = Number(data.time)
		})
	}
	//刷新
	this.sprintRankDayUpdate = function() {
		if((curRankIndex != -1) && sprint_rank[curRankIndex] && (Date.now() > settleTime))
			self.settleSprintRank()
	}
	//结算排行榜
	this.settleSprintRank = function() {
		if(sprint_rank[curRankIndex]){
			var index = curRankIndex
			var rankType = sprint_rank[index]["rank_type"]
			settleTime = Date.now() + rankTime
			self.setAreaObj(main_name,"time",settleTime)
			self.zrangewithscore(rankType,0,-1,function(list) {
				var rank = 0
				var saveDate = []
				for(var i = list.length - 2;i >= 0;i -= 2){
					rank++
					if(rank >= 11)
						rank = 11
					var score = Math.floor(list[i+1])
	                var award = ""
	                award = sprint_rank[index]["rank_"+rank]
	                if(score >= sprint_rank[index]["extra_premise"]){
	                    award += "&"+sprint_rank[index]["extra_award"]
	                }
					if(rank >= 11){
						self.sendTextToMail(list[i],"sprint_play",award)
					}else{
						self.incrbyZset(rankType+"_settle",list[i],score)
						self.sendTextToMail(list[i],"sprint_rank",award,rank)
					}
				}
				curRankIndex++
				if(!sprint_rank[curRankIndex])
					curRankIndex = -1
				self.setAreaObj(main_name,"index",curRankIndex)
				var notify = {
					type : "settleSprintRank",
					index : curRankIndex,
					time : settleTime
				}
				self.sendAllUser(notify)
			})
		}
	}
	//获取玩家排行数据
	this.getPlayerSprintRank = function(uid,rankType,cb) {
		self.zrangeScoreByKey(rankType,uid,function(data) {
			cb(true,data)
		})
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
					info.time = settleTime
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
					info.time = settleTime
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
		if(rank_type_day[rankType]){
			self.incrbyZset(rankType,uid,value,function(data) {
				data = Math.floor(data) + ((MAX_NUM - Date.now()) * 1e-14)
				self.addZset(rankType,uid,data)
			})
		}
	}
	//获取排行榜第一玩家
	this.getfirstRankUserList = function(cb) {
		var multiList = []
		for(var i = 0; i < rankTypes.length;i++){
			multiList.push(["zrange","area:area"+this.areaId+":zset:"+rankTypes[i],-1,-1,"WITHSCORES"])
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