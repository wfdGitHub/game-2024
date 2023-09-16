const grading_cfg = require("../../../../config/gameCfg/grading_cfg.json")
const grading_lv = require("../../../../config/gameCfg/grading_lv.json")
const grading_robot = require("../../../../config/gameCfg/grading_robot.json")
const recruit_list = require("../../../../config/gameCfg/recruit_list.json")
const battle_cfg = require("../../../../config/gameCfg/battle_cfg.json")
const hero_list = recruit_list["hero_5"]["heroList"]
const util = require("../../../../util/util.js")
const mainName = "grading"
const async = require("async")
var max_score = 0
var grading_lv_list = []
for(var i in grading_lv){
	grading_lv_list.push(grading_lv[i]["score"])
	max_score = grading_lv[i]["score"]
}
//跨服段位赛
var gradingEntity = function(self,theatreId) {
	var self = self
	var theatreId = theatreId
	var main_name = "cross:"+theatreId+":grading"
	var local = {}
	//每日刷新
	this.gradingDayUpdate = function() {
		console.log("跨服段位赛  每日刷新")
		self.redisDao.db.hget(main_name,"dayStr",function(err,data) {
			if(!data || self.dayStr != data){
				self.redisDao.db.hset(main_name,"dayStr",self.dayStr)
				self.redisDao.db.del(main_name+":count")
				self.redisDao.db.hgetall(main_name,function(err,data) {
					if(!data){
						local.newGrading()
					}else{
						if(data["month"] != util.getMonth())
							local.settleGrading()
					}
				})
			}
		})
	}
	//旧赛季结算
	local.settleGrading = function() {
		console.log("跨服段位赛旧赛季结算")
		var newRankList = []
		async.waterfall([
			function(next) {
				self.redisDao.db.zrevrange([main_name+":realRank",0,-1,"WITHSCORES"],function(err,list) {
					var strList,sid,uid,score,glv
					var areaIds = []
					// var uids = []
					for(var i = 0;i < list.length;i+=2){
						strList = list[i].split("|")
						sid = Number(strList[0])
						uid = Number(strList[1])
						score = Number(list[i+1])
						glv = util.binarySearchIndex(grading_lv_list,score)
						if(grading_lv[glv]["next_id"])
							newRankList.push(grading_lv[grading_lv[glv]["next_id"]]["score"],list[i])
						self.sendTextToMailById(uid,"grading_dwjl",grading_lv[glv]["season_award"],grading_lv[glv]["name"])
						// if(uids.length < 6){
						// 	areaIds.push(sid)
						// 	uids.push(uid)
						// 	self.sendTextToMailById(uid,"grading_zsd",grading_cfg["award_"+uids.length]["value"],curSeasonId)
						// }
					}
					// self.getPlayerInfoByUids(areaIds,uids,function(userInfos) {
					// 	self.redisDao.db.hset(main_name+":honor",curSeasonId,JSON.stringify(userInfos))
					// 	next()
					// })
					next()
				})
			},
			function(next) {
				//更新排名
				local.newGrading(newRankList)
			}
		],function(err) {
			console.error(err)
			local.newGrading()
		})
	}
	this.newGrading = function(newRankList) {
		local.newGrading(newRankList)
	}
	//新赛季开始
	local.newGrading = function(newRankList) {
		console.log("跨服段位赛新赛季开始")
		self.redisDao.db.hset(main_name,"month",util.getMonth())
		self.redisDao.db.del(main_name+":realRank")
		self.redisDao.db.del(main_name+":rank")
		self.redisDao.db.del(main_name+":award")
		self.redisDao.db.get("area:lastid",function(err,lastid) {
			lastid = Number(lastid) || 0
			var rankList = [main_name+":rank"]
			for(var i in grading_robot){
				for(var j = 0;j < 10;j++){
					rankList.push(Math.floor(grading_robot[i].score * (1 + j * 0.1)),(Math.floor(Math.random()*lastid) + 1)+"|"+i+"|"+j)
				}
			}
			if(newRankList && newRankList.length){
				rankList = rankList.concat(newRankList)
				var realRankList = [main_name+":realRank"]
				realRankList = realRankList.concat(newRankList)
				self.redisDao.db.zadd(realRankList)
				realRankList = ["cross:grading:realRank"]
				realRankList = realRankList.concat(newRankList)
				self.redisDao.db.zadd(realRankList)
			}
			self.redisDao.db.zadd(rankList)
		})
	}
	//获取跨服段位赛数据
	this.getGradingData = function(crossUid,cb) {
		var uid = self.players[crossUid]["uid"]
		var sid = self.players[crossUid]["oriId"]
		var info = {
			score : 0,
			grading_award_list : [],
			count : 0,
			recordList : [],
			rank : -1
		}
		async.waterfall([
			function(next) {
				self.redisDao.db.zscore([main_name+":rank",crossUid],function(err,score) {
					if(score)
						info.score = Number(score)
					next()
				})
			},
			function(next) {
				self.redisDao.db.zrevrank([main_name+":realRank",crossUid],function(err,rank) {
					if(rank != null)
						info.rank = Number(rank) + 1
					next()
				})
			},
			function(next) {
				self.redisDao.db.hget(main_name+":count",crossUid,function(err,count) {
					if(count)
						info.count = Number(count)
					next()
				})
			},
			function(next) {
				var list = []
				for(var glv in grading_lv)
					list.push(crossUid+"_"+glv)
				self.redisDao.db.hmget(main_name+":award",list,function(err,data) {
					info.grading_award_list = data
					next()
				})
			},
			function(next) {
				self.redisDao.db.lrange("cross:grading:record:"+crossUid,0,-1,function(err,list) {
					info.recordList = list
					cb(true,info)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//使用挑战券
	this.useGradingItem = function(crossUid,cb) {
		var uid = self.players[crossUid]["uid"]
		var sid = self.players[crossUid]["oriId"]
		self.consumeItems(crossUid,grading_cfg["item"]["value"]+":"+1,1,"使用挑战券",function(flag,err) {
			if(flag){
				self.redisDao.db.hincrby(main_name+":count",crossUid,-1,function(err,value) {
					cb(true,value)
				})
			}else{
				cb(false,err)
			}
		})
	}
	//匹配战斗
	this.matchGrading = function(crossUid,cb) {
		var uid = self.players[crossUid]["uid"]
		var sid = self.players[crossUid]["oriId"]
		var glv,targetSid,targetUid,targetScore,targetInfo,atkTeam,defTeam,curScore,change,seededNum,winFlag,firstFlag
		async.waterfall([
			function(next) {
				self.redisDao.db.hget(main_name+":count",crossUid,function(err,count) {
					if(count && count >= grading_cfg["free_count"]["value"])
						next("次数不足")
					else{
						self.redisDao.db.hincrby(main_name+":count",crossUid,1)
						next()
					}
				})
			},
			function(next) {
				self.redisDao.db.zrank([main_name+":rank",crossUid],function(err,rank) {
					if(rank === null){
						firstFlag = true
						rank = 0
					}
					var begin = rank - 5
					if(begin < 0)
						begin = 0
					var end = rank + 5
					self.redisDao.db.zrange([main_name+":rank",begin,end,"WITHSCORES"],function(err,list) {
						for(var i = 0;i < list.length;i += 2){
							if(list[i] == crossUid){
								list.splice(i,2)
								break
							}
						}
						var index = Math.floor(Math.random() * list.length / 2)
						if(!list[index*2]){
							next("匹配失败")
							self.redisDao.db.hincrby(main_name+":count",crossUid,-1)
							return
						}
						var strList = list[index*2].split("|")
						targetSid = Number(strList[0])
						targetUid = Number(strList[1])
						targetScore = Number(list[index*2 + 1])
					})
				})
			},
			function(next) {
				//atkTeam
				self.heroDao.getTeamByType(uid,battle_cfg[mainName]["team"],function(flag,teams) {
					atkTeam = teams
					next()
				})
			},
			function(next) {
				//defTeam
				if(targetUid < 10000){
					//机器人
					defTeam = self.fightContorl.getNPCTeamByType(main_name,grading_robot[targetUid]["team"],grading_robot[targetUid]["lv"])
					targetInfo = {
						uid : targetUid,
						name : self.namespace.getName(),
						head : hero_list[Math.floor(Math.random() * hero_list.length)]
					}
					next()
				}else{
					//玩家
					self.heroDao.getTeamByType(targetUid,battle_cfg[mainName]["team"],function(flag,teams) {
						defTeam = teams
						self.getPlayerInfoByUid(targetUid,function(info) {
							targetInfo = info
							next()
						})
					})
				}
			},
			function(next) {
				seededNum = Date.now()
				winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				self.taskUpdate(crossUid,"grading",1)
				if(winFlag){
					self.taskUpdate(crossUid,"grading_win",1)
					if(targetScore > max_score)
						change = 1
					else
						change = Math.floor(Math.random() * 15) + 20
				}else{
					change = -Math.floor(Math.random() * 15) - 15
				}
				self.redisDao.db.zincrby([main_name+":rank",change,crossUid],function(err,value) {
					curScore = value
					if(value < 0){
						curScore = 0
						self.redisDao.db.zadd([main_name+":rank",0,crossUid])
					}
					self.redisDao.db.zadd([main_name+":realRank",curScore,crossUid])
					self.redisDao.db.zadd(["cross:grading:realRank",curScore,crossUid])
					if(firstFlag)
						self.redisDao.db.hincrby("game:areaActives",self.players[crossUid]["areaId"],1)
					next()
				})
			},
			function(next) {
				glv = util.binarySearchIndex(grading_lv_list,curScore)
				self.addItemStr(crossUid,grading_lv[glv]["challenge_award"],1,"跨服匹配",function(flag,awardList) {
					var info = {
						winFlag : winFlag,
						atkTeam : atkTeam,
						defTeam : defTeam,
						seededNum : seededNum,
						awardList : awardList,
						targetSid : targetSid,
						targetScore : targetScore,
						targetInfo : targetInfo,
						curScore : curScore,
						time : Date.now(),
						change : change
					}
					self.redisDao.db.rpush("cross:grading:record:"+crossUid,JSON.stringify(info),function(err,num) {
						if(num > 10){
							self.redisDao.db.ltrim("cross:grading:record:"+crossUid,-10,-1)
						}
					})
					self.redisDao.db.zrevrank([main_name+":realRank",crossUid],function(err,rank) {
						if(rank != null)
							info.rank = Number(rank) + 1
						cb(true,info)
					})
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//领取段位奖励
	this.gainGradingAward = function(crossUid,glv,cb) {
		var uid = self.players[crossUid]["uid"]
		var sid = self.players[crossUid]["oriId"]
		if(!grading_lv[glv] || !grading_lv[glv]["grading_award"]){
			cb(false,"段位不存在")
			return
		}
		self.redisDao.db.zscore([main_name+":rank",crossUid],function(err,score) {
			if(!score)
				score = 0
			if(score < grading_lv[glv]["score"]){
				cb(false,"未达到指定段位")
				return
			}
			self.redisDao.db.hget(main_name+":award",crossUid+"_"+glv,function(err,data) {
				if(data){
					cb(false,"已领取")
					return
				}
				self.redisDao.db.hset(main_name+":award",crossUid+"_"+glv,1)
				var awardList = self.addItemStr(crossUid,grading_lv[glv]["grading_award"],1,"段位奖励"+glv)
				cb(true,awardList)
			})
		})
	}
}
module.exports = function() {
	var gradingList = {}
	var self = this
	//战区初始化
	this.gradingInit = function(theatreNum) {
		gradingList = {}
		for(var i = 0; i < theatreNum;i++){
			gradingList[i] = new gradingEntity(this,i)
		}
	}
	//每日刷新
	this.gradingDayUpdate = function(){
		for(var i in gradingList)
			gradingList[i].gradingDayUpdate()
	}
	//获取跨服段位赛数据
	this.getGradingData = function(crossUid,cb){
		var theatreId = self.players[crossUid].theatreId
		gradingList[theatreId].getGradingData(crossUid,cb)
	}
	//使用挑战券
	this.useGradingItem = function(crossUid,cb){
		var theatreId = self.players[crossUid].theatreId
		gradingList[theatreId].useGradingItem(crossUid,cb)
	}
	//匹配战斗
	this.matchGrading = function(crossUid,cb){
		var theatreId = self.players[crossUid].theatreId
		gradingList[theatreId].matchGrading(crossUid,cb)
	}
	//领取段位奖励
	this.gainGradingAward = function(crossUid,glv,cb){
		var theatreId = self.players[crossUid].theatreId
		gradingList[theatreId].gainGradingAward(crossUid,glv,cb)
	}
	//新赛季
	this.newGrading = function(theatreId,newRankList) {
		var rankList = ["cross:"+theatreId+":grading:realRank"]
		if(newRankList){
			rankList = rankList.concat(newRankList)
			self.redisDao.db.zadd(rankList)
		}
		gradingList[theatreId].newGrading(newRankList)
	}
}