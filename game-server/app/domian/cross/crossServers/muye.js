//天命之战 3V3
const muye_cfg = require("../../../../config/gameCfg/muye_cfg.json")
const muye_rank = require("../../../../config/gameCfg/muye_rank.json")
const async = require("async")
var util = require("../../../../util/util.js")
var robotTeam = []
for(var i = 1;i <= 3;i++){
	robotTeam.push(JSON.parse(muye_cfg["default_team"+i]["value"]))
}
var camp_state = {
	"0" : "汉室",
	"1" : "黄巾"
}
module.exports = function() {
	var self = this
	var challenge_time = {}
	var challenge_free = {}
	var camps = {}				//阵营记录
	var honorList = []			//荣誉榜
	var likeUsers = {}			//点赞记录
	var likeMap = {}			//点赞榜
	var winCounts = {}			//挑战次数
	var look = true				//比赛中
	var weekStr = ""			//月份记录
	//初始化
	this.muyeInit = function() {
		self.redisDao.db.hgetall("cross:muye",function(err,data) {
			if(data){
				weekStr = data.week
				if(data.honorList)
					honorList = JSON.parse(data.honorList)
			}
			if(weekStr != util.getWeek())
				self.settleMuye()
			look = false
		})
		self.redisDao.db.hgetall("cross:muye:challenge_free",function(err,data) {
			if(data){
				for(var i in data){
					data[i] = Number(data[i])
				}
				challenge_free = data
			}
		})
		self.redisDao.db.hgetall("cross:muye:camps",function(err,data) {
			if(data){
				for(var i in data){
					data[i] = Number(data[i])
				}
				camps = data
			}
		})
		self.redisDao.db.hgetall("cross:muye:likeMap",function(err,data) {
			if(data){
				for(var i in data){
					data[i] = Number(data[i])
				}
				likeMap = data
			}
		})
		self.redisDao.db.hgetall("cross:muye:winCounts",function(err,data) {
			if(data){
				for(var i in data){
					data[i] = Number(data[i])
				}
				winCounts = data
			}
		})
	}
	//每日刷新
	this.muyeDayUpdate = function() {
		challenge_time = {}
		self.redisDao.db.hget("cross:muye","dayStr",function(err,data) {
			if(!data || self.dayStr != data){
				likeUsers = {}
				winCounts = {}
				challenge_free = {}
				self.redisDao.db.del("cross:muye:winCounts")
				self.redisDao.db.del("cross:muye:boxs")
				self.redisDao.db.del("cross:muye:challenge_free")
				self.redisDao.db.hset("cross:muye","dayStr",self.dayStr)
			}
		})
		if(weekStr != util.getWeek())
			self.settleMuye()
	}
	//旧赛季结算
	this.settleMuye = function() {
		console.log("天命新赛季开启")
		async.waterfall([
			function(next) {
				self.redisDao.db.zrevrange(["cross:muye:rank:camp0",0,-1,"WITHSCORES"],function(err,list) {
					var strList,sid,uid,score,glv
					var areaIds = []
					var uids = []
					var newRankList = ["cross:muye:rank:camp0"]
					var crossUids = []
					var rankIndex = 0
					var rankCount = 0
					for(var i = 0;i < list.length;i+=2){
						strList = list[i].split("|")
						sid = Number(strList[0])
						uid = Number(strList[1])
						score = Number(list[i+1])
						crossUids.push(list[i])
						if(uid > 10000){
							rankCount++
							if(rankCount > muye_rank[rankIndex]["count"])
								rankIndex++
							newRankList.push(0,list[i])
							self.sendMailByUid(uid,muye_rank[rankIndex]["title"],muye_rank[rankIndex]["text"],muye_rank[rankIndex]["award"])
							if(uids.length < 3){
								areaIds.push(sid)
								uids.push(uid)
							}
						}
					}
					self.getPlayerInfoByUids(areaIds,uids,function(userInfos) {
						honorList = []
						for(var i = 0;i < userInfos.length;i++){
							honorList.push({crossUid:crossUids[i],info:JSON.stringify(userInfos[i])})
						}
						next()
					})
				})
			},
			function(next) {
				self.redisDao.db.zrevrange(["cross:muye:rank:camp1",0,-1,"WITHSCORES"],function(err,list) {
					var strList,sid,uid,score,glv
					var areaIds = []
					var uids = []
					var newRankList = ["cross:muye:rank:camp1"]
					var crossUids = []
					var rankIndex = 0
					var rankCount = 0
					for(var i = 0;i < list.length;i+=2){
						strList = list[i].split("|")
						sid = Number(strList[0])
						uid = Number(strList[1])
						score = Number(list[i+1])
						crossUids.push(list[i])
						if(uid > 10000){
							rankCount++
							if(rankCount > muye_rank[rankIndex]["count"])
								rankIndex++
							newRankList.push(0,list[i])
							self.sendMailByUid(uid,muye_rank[rankIndex]["title"],muye_rank[rankIndex]["text"],muye_rank[rankIndex]["award"])
							if(uids.length < 3){
								areaIds.push(sid)
								uids.push(uid)
							}
						}
					}
					self.getPlayerInfoByUids(areaIds,uids,function(userInfos) {
						for(var i = 0;i < 3;i++){
							if(userInfos[i])
								honorList.push({crossUid:crossUids[i],info:JSON.stringify(userInfos[i])})
							else
								honorList.push(null)
						}
						self.redisDao.db.hset("cross:muye","honorList",JSON.stringify(honorList))
						next()
					})
				})
			},
			function(next) {
				self.newMuye()
			}
		],function(err) {
			console.error(err)
			self.newMuye()
		})
	}
	//新赛季开始
	this.newMuye = function() {
		likeUsers = {}
		winCounts = {}
		challenge_time = {}
		challenge_free = {}
		camps = {}
		weekStr = util.getWeek()
		self.redisDao.db.del("cross:muye:challenge_free")
		self.redisDao.db.del("cross:muye:winCounts")
		self.redisDao.db.del("cross:muye:boxs")
		self.redisDao.db.del("cross:muye:camps")
		self.redisDao.db.del("cross:muye:rank:camp0")
		self.redisDao.db.del("cross:muye:rank:camp1")
		self.redisDao.db.hset("cross:muye","week",weekStr)
	}
	//获取数据
	this.getMuyeData = function(crossUid,cb) {
		var info = {}
		info.winCount = winCounts[crossUid] || 0
		info.honorList = honorList
		info.likeList = []
		info.challengeTime = challenge_time[crossUid] || 0
		info.challengeFree = challenge_free[crossUid] || 0
		info.camp = camps[crossUid]
		for(var i = 0;i < honorList.length;i++){
			if(honorList[i])
				info.likeList.push(likeMap[honorList[i]["crossUid"]] || 0)
			else
				info.likeList.push(0)
		}
		info.likeInfo = likeUsers[crossUid] || {}
		async.waterfall([
			function(next) {
				var multiList = []
				for(var i = 1;i <= 3;i++){
					multiList.push(["hget","cross:muye:boxs",crossUid+"_"+i])
				}
				self.redisDao.multi(multiList,function(err,list) {
					info.boxs = list
					next()
				})
			},
			function(next) {
				self.redisDao.db.hget("cross:muye:fightTeam",crossUid,function(err,data) {
					info.hIds = data
					next()
				})
			},
			function(next) {
				if(info.camp == undefined){
					cb(true,info)
				}else{
					self.redisDao.db.zscore(["cross:muye:rank:camp"+info.camp,crossUid],function(err,score) {
						info.score = score || 0
						cb(true,info)
					})
				}
			}
		],function(err) {
			cb(false,err)
		})
	}
	//加入阵营
	this.muyeJoinCamp = function(crossUid,camp,cb) {
		if(camps[crossUid] != undefined){
			cb(false,"已加入阵营")
			return
		}
		if(!Number.isInteger(camp) || !camp_state[camp]){
			cb(false,"camp error")
			return
		}
		var defCamp = (camp + 1) % 2 
		camps[crossUid] = camp
		self.redisDao.db.hset("cross:muye:camps",crossUid,camp)
		self.redisDao.db.zrem(["cross:muye:rank:camp"+defCamp,crossUid])
		self.redisDao.db.zadd(["cross:muye:rank:camp"+camp,0,crossUid])
		cb(true,camp)
	}
	//随机阵营
	this.muyeRandCamp = function(crossUid,cb) {
		if(camps[crossUid] != undefined){
			cb(false,"已加入阵营")
			return
		}
		self.redisDao.db.zcard("cross:muye:rank:camp0",function(err,count0) {
			count0 = Number(count0) || 0
			self.redisDao.db.zcard("cross:muye:rank:camp1",function(err,count1) {
				count1 = Number(count1) || 0
				var camp = 0
				if(count1 < count0){
					camp = 1
				}
				var defCamp = (camp + 1) % 2 
				camps[crossUid] = camp
				self.redisDao.db.hset("cross:muye:camps",crossUid,camp)
				self.redisDao.db.zrem(["cross:muye:rank:camp"+defCamp,crossUid])
				self.redisDao.db.zadd(["cross:muye:rank:camp"+camp,0,crossUid])
				self.addItemStr(crossUid,muye_cfg["rand_camp"]["value"],1,"天命决战",function(flag,awardList) {
					var info = {
						awardList : awardList,
						camp : camp
					}
					cb(true,info)
				})
			})
		})
	}
	//设置阵容
	this.muyeSetFightTeams = function(crossUid,hIds,cb) {
		if(hIds.length != 18){
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
			self.redisDao.db.hset("cross:muye:fightTeam",crossUid,JSON.stringify(hIds))
    		cb(true)
    	})
	}
	//匹配战斗
	this.matchMuye = function(crossUid,cb) {
		var uid = self.players[crossUid]["uid"]
		var sid = self.players[crossUid]["areaId"]
		var camp = camps[crossUid]
		var defCamp = (camp + 1) % 2 
		if(camp == undefined){
			cb(false,"未加入阵营")
			return
		}
		if(!challenge_time[crossUid]){
			challenge_time[crossUid] = 0
		}
		if((new Date()).getHours() < 17){
			cb(false,"17:00之后可挑战")
			return
		}
		var atkTeams = []
		var defTeams = []
		var wins = []
		var seededNums = []
		var voidScore = false
		var targetcrossUid,targetInfo,targetSid,targetUid,targetScore,begin,end
		async.waterfall([
			function(next) {
				//获取攻方阵容
				self.heroDao.getFightBook(uid,function(flag,bookInfo) {
					if(!bookInfo)
						bookInfo = {}
					self.redisDao.db.hmget("player:user:"+uid+":guild",["skill_1","skill_2","skill_3","skill_4"],function(err,data) {
						if(data){
							bookInfo["g1"] = Number(data[0]) || 0
							bookInfo["g2"] = Number(data[1]) || 0
							bookInfo["g3"] = Number(data[2]) || 0
							bookInfo["g4"] = Number(data[3]) || 0
						}
						self.redisDao.db.hget("cross:muye:fightTeam",crossUid,function(err,data) {
							if(err || !data){
								cb(false,"未设置阵容")
								return
							}
							var hIds = JSON.parse(data)
					    	self.heroDao.getHeroList(uid,hIds,function(flag,heros) {
					    		atkTeams[0] = heros.splice(0,6)
					    		atkTeams[0][6] = bookInfo
					    		atkTeams[1] = heros.splice(0,6)
					    		atkTeams[1][6] = bookInfo
					    		atkTeams[2] = heros.splice(0,6)
					    		atkTeams[2][6] = bookInfo
					    		next()
					    	})
						})
					})
				})
			},
			function(next) {
				self.redisDao.db.zscore(["cross:muye:rank:camp"+camp,crossUid],function(err,score) {
					if(!score || score <= 0){
						defTeams = robotTeam.concat()
						targetInfo = {
							name : "士兵",
							head : "201010"
						}
						next(null,-1)
					}else{
						score = Number(score)
						begin = score-100
						end = score+100
						self.redisDao.db.zcount(["cross:muye:rank:camp"+defCamp,begin,end],function(err,zcount) {
							if(!zcount || zcount <= 0){
								begin = begin - 100
								end = end + 100
								voidScore = true
								self.redisDao.db.zcount(["cross:muye:rank:camp"+defCamp,begin,end],function(err,zcount) {
									if(!zcount || zcount <= 0){
										next("匹配不到合适的对手")
										return
									}
									next(null,zcount)
								})
							}else{
								next(null,zcount)
							}
						})
					}
				})
			},
			function(zcount,next) {
				if(zcount == -1){
					next()
				}else{
					var offset = Math.floor(zcount * Math.random()) 
					self.redisDao.db.zrangebyscore(["cross:muye:rank:camp"+defCamp,begin,end,"WITHSCORES","limit",offset,1],function(err,list) {
						if(list && list.length){
							targetcrossUid = list[0]
							var strList = targetcrossUid.split("|")
							targetSid = Number(strList[0])
							targetUid = Number(strList[1])
							targetScore = Number(list[1])
							self.heroDao.getFightBook(targetUid,function(flag,bookInfo) {
								if(!bookInfo)
									bookInfo = {}
								self.redisDao.db.hmget("player:user:"+targetUid+":guild",["skill_1","skill_2","skill_3","skill_4"],function(err,data) {
									if(data){
										bookInfo["g1"] = Number(data[0]) || 0
										bookInfo["g2"] = Number(data[1]) || 0
										bookInfo["g3"] = Number(data[2]) || 0
										bookInfo["g4"] = Number(data[3]) || 0
									}
								    self.redisDao.db.hget("cross:muye:fightTeam",targetcrossUid,function(err,data) {
								        var hIds = JSON.parse(data)
								        self.heroDao.getHeroList(targetUid,hIds,function(flag,heros) {
								            defTeams[0] = heros.splice(0,6)
								            defTeams[0][6] = bookInfo
								            defTeams[1] = heros.splice(0,6)
								            defTeams[1][6] = bookInfo
								            defTeams[2] = heros.splice(0,6)
								            defTeams[2][6] = bookInfo
								            self.getPlayerInfoByUid(targetUid,function(info) {
								                targetInfo = info
								                next()
								            })
								        })
								    })
								})
							})
						}else{
							console.error("zrangebyscore offset/zcount : "+offset+"/"+zcount,err,list)
							next("匹配出错")
						}
					})
				}
			},
			function(next) {
				if(!challenge_free[crossUid]){
					challenge_free[crossUid] = 0
				}
				if(challenge_free[crossUid] < 2){
					challenge_free[crossUid]++
					self.redisDao.db.hset("cross:muye:challenge_free",crossUid,challenge_free[crossUid])
				}else{
					if(Date.now() - challenge_time[crossUid] < 3600000){
						cb(false,"挑战冷却中")
						return
					}
					challenge_time[crossUid] = Date.now()
				}
				next()
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
				var change = 0
				for(var i = 0;i < 3;i++){
					if(wins[i])
						change += 10
					else
						change -= 10
				}
				var awardStr = ""
				if(change < 0){
					change = -10
					awardStr = muye_cfg["lose"]["value"]
				}else{
					if(!winCounts[crossUid])
						winCounts[crossUid] = 0
					winCounts[crossUid]++
					self.redisDao.db.hincrby("cross:muye:winCounts",crossUid,1)
					self.taskUpdate(crossUid,"muye_win",1)
					if(change == 30)
						awardStr = muye_cfg["victory"]["value"]
					else
						awardStr = muye_cfg["win"]["value"]
					if(winCounts[crossUid] <= 1){
						change *= 2
					}
				}
				if(voidScore)
					change = 0
				self.addItemStr(crossUid,awardStr,1,"天命决战",function(flag,awardList) {
					self.redisDao.db.zincrby(["cross:muye:rank:camp"+camp,change,crossUid],function(err,curScore) {
						var info = {
							atkTeams : atkTeams,
							defTeams : defTeams,
							seededNums : seededNums,
							wins : wins,
							change : change,
							curScore : curScore,
							awardList : awardList,
							targetScore : targetScore,
							targetInfo : targetInfo,
							camp : camp,
							time : Date.now()
						}
						self.redisDao.db.rpush("cross:muye:record:"+crossUid,JSON.stringify(info),function(err,num) {
							if(num > 3){
								self.redisDao.db.ltrim("cross:muye:record:"+crossUid,-3,-1)
							}
						})
						info.challengeTime = challenge_time[crossUid] || 0
						info.challengeFree = challenge_free[crossUid] || 0
						cb(true,info)
					})
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取历史挑战记录
	this.getMuyeRecord = function(crossUid,cb) {
		self.redisDao.db.lrange("cross:muye:record:"+crossUid,0,-1,function(err,list) {
			cb(true,list)
		})
	}
	//点赞
	this.muyeLike = function(crossUid,index,cb) {
		if(!likeUsers[crossUid])
			likeUsers[crossUid] = {}
		if(!honorList[index]){
			cb(false,"目标不存在")
			return
		}
		if(likeUsers[crossUid][index]){
			cb(false,"今日已点赞")
			return
		}
		likeUsers[crossUid][index] = 1
		var target = honorList[index]["crossUid"]
		if(!likeMap[target])
			likeMap[target] = 0
		likeMap[target]++
		self.redisDao.db.hincrby("cross:muye:likeMap",target,1)
		self.addItemStr(crossUid,"201:20000",1,"天命点赞",function(flag,data) {
			cb(flag,data)
		})
	}
	//领取宝箱
	this.gainMuyeBox = function(crossUid,index,cb) {
		if(!Number.isInteger(index) || index <= 0 || !muye_cfg["box_"+index]){
			cb(false,"宝箱不存在")
			return
		}
		if(!winCounts[crossUid] || winCounts[crossUid] < index){
			cb(false,"条件不足")
			return
		}
		self.redisDao.db.hget("cross:muye:boxs",crossUid+"_"+index,function(err,data) {
			if(data){
				cb(false,"今日已领取")
				return
			}
			self.redisDao.db.hset("cross:muye:boxs",crossUid+"_"+index,1)
			self.addItemStr(crossUid,muye_cfg["box_"+index]["value"],1,"天命宝箱"+index,function(flag,awardList) {
				cb(true,awardList)
			})
		})
	}
	//获取排行榜
	this.getMuyeRank = function(crossUid,camp,cb) {
		if(!Number.isInteger(camp) || !camp_state[camp]){
			cb(false,"camp error")
			return
		}
		self.redisDao.db.zrevrange(["cross:muye:rank:camp"+camp,0,19,"WITHSCORES"],function(err,list) {
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
				self.redisDao.db.zrange("cross:muye:rank:camp"+camp,crossUid,function(err,rank) {
					info.rank = rank
					cb(true,info)
				})
			})
		})
	}
}