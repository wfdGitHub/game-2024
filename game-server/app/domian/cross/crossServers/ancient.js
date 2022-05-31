//远古战场
const ancient_cfg = require("../../../../config/gameCfg/ancient_cfg.json")
const ancient_rank = require("../../../../config/gameCfg/ancient_rank.json")
const ancient_robot = require("../../../../config/gameCfg/ancient_robot.json")
const main_rank = "cross:ancient:rank"
const real_rank = "cross:ancient:realRank"
const util = require("../../../../util/util.js")
const async = require("async")
const boxs = [2,5,10,15]
for(var i in ancient_robot){
	ancient_robot[i]["team1"] = JSON.parse(ancient_robot[i]["team1"])
	ancient_robot[i]["team2"] = JSON.parse(ancient_robot[i]["team2"])
	ancient_robot[i]["team3"] = JSON.parse(ancient_robot[i]["team3"])
}
module.exports = function() {
	var self = this
	var local = {}
	var timeMap = {}			//刷新冷却
	//每日刷新
	this.ancientDayUpdate = function() {
		timeMap = {}
		self.redisDao.db.del("cross:ancient:count")
		self.redisDao.db.hget("cross:ancient","week",function(err,data) {
			if(!data || data != util.getWeek())
				self.settleAncient()
		})
	}
	//旧赛季结算
	this.settleAncient = function() {
		self.redisDao.db.zrevrange([real_rank,0,-1],function(err,list) {
			var strList,sid,uid,glv
			var areaIds = []
			var uids = []
			var crossUids = []
			var rankIndex = 0
			var rankCount = 0
			for(var i = 0;i < list.length;i++){
				crossUids.push(list[i])
				strList = list[i].split("|")
				sid = Number(strList[0])
				uid = Number(strList[1])
				rankCount++
				if(rankCount > ancient_rank[rankIndex]["count"])
					rankIndex++
				self.sendTextToMailById(uid,"ancient_"+rankIndex,ancient_rank[rankIndex]["award"])
				if(uids.length < 3){
					areaIds.push(sid)
					uids.push(uid)
				}
			}
			self.getPlayerInfoByUids(areaIds,uids,function(userInfos) {
				var honorList = []
				for(var i = 0;i < userInfos.length;i++){
					honorList.push({crossUid:crossUids[i],info:JSON.stringify(userInfos[i])})
				}
				self.redisDao.db.hset("cross:ancient","honorList",JSON.stringify(honorList))
			})
			self.newAncient()
		})
	}
	//新赛季开始
	this.newAncient = function() {
		console.log("远古战场新赛季开始")
		self.redisDao.db.del(real_rank)
		self.redisDao.db.del(main_rank)
		self.redisDao.db.del("cross:ancient:wins")
		self.redisDao.db.del("cross:ancient:award")
		self.redisDao.db.hset("cross:ancient","week",util.getWeek())
		self.redisDao.db.get("area:lastid",function(err,lastid) {
			lastid = Number(lastid) || 0
			var rankList = [main_rank]
			for(var i in ancient_robot){
				rankList.push(ancient_robot[i].score,(Math.floor(Math.random()*lastid) + 1)+"|"+i)
			}
			self.redisDao.db.zadd(rankList)
		})
	}
	//获取数据
	this.getAncientData = function(crossUid,cb) {
		var uid = self.players[crossUid]["uid"]
		var sid = self.players[crossUid]["oriId"]
		var info = {
			score : 0,
			count : 0,
			rank : -1,
			wins : 0,
			hIds : [],
			ancient_award_list : [],
			honorList : []
		}
		async.waterfall([
			function(next) {
				self.redisDao.db.hget("cross:ancient:fightTeam",uid,function(err,data) {
					if(data)
						info.hIds = data
					next()
				})
			},
			function(next) {
				self.redisDao.db.hget("cross:ancient","honorList",function(err,data) {
					if(data)
						info.honorList = JSON.parse(data)
					next()
				})
			},
			function(next) {
				self.redisDao.db.zscore([real_rank,crossUid],function(err,score) {
					if(score)
						info.score = Number(score)
					next()
				})
			},
			function(next) {
				self.redisDao.db.zrevrank([real_rank,crossUid],function(err,rank) {
					if(rank != null)
						info.rank = Number(rank) + 1
					next()
				})
			},
			function(next) {
				self.redisDao.db.hget("cross:ancient:count",crossUid,function(err,count) {
					if(count)
						info.count = Number(count)
					next()
				})
			},
			function(next) {
				self.redisDao.db.hget("cross:ancient:wins",crossUid,function(err,wins) {
					if(wins)
						info.wins = Number(wins)
					next()
				})
			},
			function(next) {
				var list = []
				for(var i = 0;i < boxs.length;i++)
					list.push(crossUid+"_"+boxs[i])
				self.redisDao.db.hmget("cross:ancient:award",list,function(err,data) {
					info.ancient_award_list = data
					next()
				})
			},
			function(next) {
				self.redisDao.db.lrange("cross:ancient:record:"+crossUid,0,-1,function(err,list) {
					info.recordList = list
					cb(true,info)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//设置阵容
	this.ancientSetFightTeams = function(crossUid,hIds,cb) {
		if(!Array.isArray(hIds) || hIds.length != 6){
			cb(false,"hids error")
			return
		}
		var hIdMap = {}
		for(var i = 0;i < hIds.length;i++){
			if(hIds[i] && hIdMap[hIds[i]]){
				cb(false,"hid重复 " +hIds[i])
				return
			}
			hIdMap[hIds[i]] = 1
		}
		var uid = crossUid.split("|")[1]
    	self.heroDao.getHeroList(uid,hIds,function(flag,list) {
			var heroMap = {}
			for(var i = 0;i < list.length;i++){
				if(list[i]){
					if(heroMap[list[i].id]){
						cb(false,"英雄重复 " +list[i].id)
						return
					}
					heroMap[list[i].id] = 1
				}
			}
			self.redisDao.db.hset("cross:ancient:fightTeam",uid,JSON.stringify(hIds))
    		cb(true)
    	})
	}
	//获取目标列表
	this.ancientGetTargetList = function(crossUid,cb) {
		if(timeMap[crossUid] && timeMap[crossUid] > Date.now()){
			cb(false,"刷新过快")
			return
		}
		timeMap[crossUid] = Date.now() + 10000
		var targets = []
		async.waterfall([
			function(next) {
				self.redisDao.db.zrank([main_rank,crossUid],function(err,rank) {
					if(rank === null){
						rank = 0
					}
					var begin = rank - 10
					if(begin < 0)
						begin = 0
					var end = rank + 10
					self.redisDao.db.zrange([main_rank,begin,end,"WITHSCORES"],function(err,list) {
						for(var i = 0;i < list.length;i += 2){
							if(list[i] != crossUid){
								var info = {crossUid : list[i],score : Number(list[i+1])}
								targets.push(info)
							}
						}
						targets = util.getRandomArray(targets,3)
						if(targets.length != 3){
							console.error("targets.length != 3",crossUid,targets)
							return
						}
						for(var i = 0;i < targets.length;i++){
							var strList = targets[i]["crossUid"].split("|")
							var targetSid = Number(strList[0])
							var targetUid = Number(strList[1])
							var targetScore = targets[i]["score"]
							if(targetUid < 10000){
								//机器人
								defTeam = ancient_robot[targetUid]["team"]
								targetInfo = {
									uid : targetUid,
									name : self.namespace.getName(),
									head : 105010,
									figure : 105010,
									sex : Math.floor(Math.random() * 2) + 1
								}
								next()
							}else{
								//玩家
								self.getDefendTeam(targetUid,function(team) {
									defTeam = team
									self.getPlayerInfoByUid(targetUid,function(info) {
										targetInfo = info
										next()
									})
								})
							}
						}
					})
				})
			},
			function(next) {
				var strList = targets[0]["crossUid"].split("|")
				var targetSid = Number(strList[0])
				var targetUid = Number(strList[1])
				local.getFightTeam(targetUid,function(fightTeams,userInfo) {
					targets[0]["fightTeams"] = fightTeams
					targets[0]["userInfo"] = userInfo
					next()
				})
			},
			function(next) {
				var strList = targets[1]["crossUid"].split("|")
				var targetSid = Number(strList[0])
				var targetUid = Number(strList[1])
				local.getFightTeam(targetUid,function(fightTeams,userInfo) {
					targets[1]["fightTeams"] = fightTeams
					targets[1]["userInfo"] = userInfo
					next()
				})
			},
			function(next) {
				var strList = targets[2]["crossUid"].split("|")
				var targetSid = Number(strList[0])
				var targetUid = Number(strList[1])
				local.getFightTeam(targetUid,function(fightTeams,userInfo) {
					targets[2]["fightTeams"] = fightTeams
					targets[2]["userInfo"] = userInfo
					next()
				})
			},
			function(next) {
				cb(true,targets)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取战斗阵容
	local.getFightTeam = function(uid,cb) {
		var fightTeams = []
		if(uid < 10000){
			//机器人
			fightTeams.push(ancient_robot[uid]["team1"])
			fightTeams.push(ancient_robot[uid]["team2"])
			fightTeams.push(ancient_robot[uid]["team3"])
			userInfo = {uid : uid,name : self.namespace.getName(),head : 105010,figure : 105010,sex : Math.floor(Math.random() * 2) + 1}
			cb(fightTeams,userInfo)
		}else{
			//玩家
			self.redisDao.db.hget("cross:ancient:fightTeam",uid,function(err,hIds) {
				if(!hIds)
					hIds = []
				else
					hIds = JSON.parse(hIds)
		    	self.heroDao.getHeroList(uid,hIds,function(flag,list) {
		    		fightTeams.push([0,list[0],0,0,0,0])
		    		fightTeams.push([0,list[1],0,0,list[2],0])
		    		fightTeams.push([0,0,0,list[3],list[4],list[5]])
		    		self.getPlayerInfoByUid(uid,function(userInfo) {
		    			cb(fightTeams,userInfo)
		    		})
		    	})
			})
		}
	}
	//开始挑战
	this.ancientChallenge = function(crossUid,targetUid,targetInfo,cb) {
		var atkTeams = []
		var defTeams = []
		var wins = []
		var seededNums = []
		var defInfo = {}
		async.waterfall([
			function (next) {
				//判断次数
				self.redisDao.db.hget("cross:ancient:count",crossUid,function(err,count) {
					count = Number(count) || 0
					if(count >= ancient_cfg["free_count"]["value"])
						next("无挑战次数")
					else
						next()
				})
			},
			function(next) {
				//判断目标存在
				self.redisDao.db.zrank([main_rank,targetUid],function(err,rank) {
					if(!Number.isInteger(rank)){
						next("目标不存在")
					}else{
						next()
					}
				})
			},
			function(next) {
				//获取进攻方信息
				var uid = crossUid.split("|")[1]
				local.getFightTeam(uid,function(fightTeams,userInfo) {
					atkTeams = fightTeams
					next()
				})
			},
			function(next) {
				//获取防守方信息
				var uid = targetUid.split("|")[1]
				local.getFightTeam(uid,function(fightTeams,userInfo) {
					if(userInfo.uid < 10000)
						defInfo = targetInfo
					else
						defInfo = userInfo
					defTeams = fightTeams
					next()
				})
			},
			function(next) {
				//开始战斗
				for(var i = 0;i < 3;i++){
					seededNums[i] = Date.now()
					wins[i] = self.fightContorl.beginFight(atkTeams[i],defTeams[i],{seededNum : seededNums[i]})
				}
				next()
			},
			function(next) {
				delete timeMap[crossUid]
				//结算
				var change = 0
				var wincount = 0
				var awardStr = ""
				for(var i = 0;i < 3;i++)
					if(wins[i])
						wincount++
				if(wincount >= 2){
					change = Math.floor(Math.random() * 20) + 10
					awardStr = ancient_cfg["win"]["value"]
					self.redisDao.db.hincrby("cross:ancient:wins",crossUid,1)
					self.taskUpdate(crossUid,"ancient_win",1)
				}else{
					change = -Math.floor(Math.random() * 20) -5
					awardStr = ancient_cfg["lose"]["value"]
				}
				self.redisDao.db.hincrby("cross:ancient:count",crossUid,1)
				self.addItemStr(crossUid,awardStr,1,"远古战场",function(flag,awardList) {
					self.redisDao.db.zincrby([real_rank,change,crossUid],function(err,curScore) {
						self.redisDao.db.zadd([main_rank,curScore,crossUid])
						var info = {
							atkTeams : atkTeams,
							defTeams : defTeams,
							seededNums : seededNums,
							wins : wins,
							change : change,
							curScore : curScore,
							awardList : awardList,
							targetInfo : defInfo,
							time : Date.now()
						}
						self.redisDao.db.rpush("cross:ancient:record:"+crossUid,JSON.stringify(info),function(err,num) {
							if(num > 3){
								self.redisDao.db.ltrim("cross:ancient:record:"+crossUid,-3,-1)
							}
						})
						cb(true,info)
					})
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//领取周战胜宝箱
	this.gainAncientBox = function(crossUid,index,cb) {
		if(!ancient_cfg["box_"+index]){
			cb(false,"宝箱不存在")
			return
		}
		self.redisDao.db.hget("cross:ancient:wins",crossUid,function(err,wins) {
			wins = Number(wins) || 0
			if(wins < index){
				cb(false,"条件未完成")
				return
			}
			self.redisDao.db.hget("cross:ancient:award",crossUid+"_"+index,function(err,data) {
				if(data){
					cb(false,"已领取")
				}else{
					self.redisDao.db.hset("cross:ancient:award",crossUid+"_"+index,1)
					self.addItemStr(crossUid,ancient_cfg["box_"+index]["value"],1,"远古周宝箱",function(flag,awardList) {
						cb(true,awardList)
					})
				}
			})
		})
	}
	//获取排行榜
	this.getAncientRank = function(crossUid,cb) {
		self.redisDao.db.zrevrange([real_rank,0,19,"WITHSCORES"],function(err,list) {
			var strList,sid,uid,score
			var areaIds = []
			var uids = []
			var scores = []
			for(var i = 0;i < list.length;i+=2){
				strList = list[i].split("|")
				sid = Number(strList[0])
				uid = Number(strList[1])
				score = Number(list[i+1])
				areaIds.push(sid)
				uids.push(uid)
				scores.push(score)
			}
			self.getPlayerInfoByUids(areaIds,uids,function(userInfos) {
				var info = {
					userInfos : userInfos,
					scores : scores
				}
				self.redisDao.db.zrange(real_rank,crossUid,function(err,rank) {
					info.rank = rank
					cb(true,info)
				})
			})
		})
	}
	//获取挑战记录
	this.getAncientRecord = function(crossUid,cb) {
		self.redisDao.db.lrange("cross:ancient:record:"+crossUid,0,-1,function(err,list) {
			cb(true,list)
		})
	}
}