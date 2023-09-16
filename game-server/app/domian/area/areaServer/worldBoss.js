const world_boss_cfg = require("../../../../config/gameCfg/world_boss_cfg.json")
const world_boss_base = require("../../../../config/gameCfg/world_boss_base.json")
const util = require("../../../../util/util.js")
const async = require("async")
const main_name = "worldBoss"
const oneDayTime = 86400000
const oneHourTime = 3600000
var MAXBOSSID = 0
for(var i in world_boss_base)
	MAXBOSSID++
//世界BOSS
module.exports = function() {
	var self = this
	var local = {}
	var userRecords = {}        //挑战记录
	var state = -1 				//当前阶段
	var timeList = []			//时间列表
	var time = 0
	var timer = 0
	var bossIndex = 0
	var bossId = 0
	var bossTeam = []
	//玩法初始化
	this.worldBossInit = function() {
		local.resetTime()
		self.getAreaObj(main_name,"state",function(data) {
			state = Number(data) || 0
		})
	}
	//刷新
	this.worldBossUpdate = function() {
		if(state == -1)
			return
		if(Date.now() > timeList[state])
			local.worldNextState()
	}
	//重置时间
	local.resetTime = function() {
		timeList = []
		timeList[0] = util.getZeroTime() + world_boss_cfg["openTime"]["value"] * oneHourTime
		timeList[1] = timeList[0] + world_boss_cfg["challengeTime"]["value"] * oneHourTime
		timeList[2] = timeList[1] + world_boss_cfg["robTime"]["value"] * oneHourTime
		timeList[3] = util.getZeroTime() + oneDayTime
		bossIndex = (new Date()).getDay()
		bossIndex = bossIndex % MAXBOSSID
		bossId = world_boss_base[bossIndex]["bossId"]
		bossTeam = [0,0,0,0,bossId,0]
	}
	//状态改变
	local.worldNextState = function() {
		state = (state+1) % 4
		self.setAreaObj(main_name,"state",state)
		switch(state){
			case 0:
				//进入初始状态
				local.worldBossReset()
			break
			case 1:
				//开始挑战
				local.worldBossChallengeStage()
			break
			case 2:
				//开始抢夺
				local.worldBossRobStage()
			break
			case 3:
				//结算
				local.worldBossEnd()
			break
		}
	}
	//进入初始状态
	local.worldBossReset = function() {
		userRecords = {}
		self.delZset(main_name)
		self.delAreaObjAll(main_name)
		self.setAreaObj(main_name,"state",state)
		local.resetTime()
	}
	//进入挑战状态
	local.worldBossChallengeStage= function() {
		var notify = {
			type : "worldBossChallengeStage",
			state : state,
			time : timeList[state]
		}
		self.sendAllUser(notify)
	}
	//进入抢夺阶段
	local.worldBossRobStage = function() {
		var notify = {
			type : "worldBossRobStage",
			state : state,
			bossIndex : bossIndex,
			time : timeList[state]
		}
		self.sendAllUser(notify)
	}
	//进入结束阶段
	local.worldBossEnd = function() {
		var notify = {
			type : "worldBossEnd",
			state : state,
			bossIndex : bossIndex
		}
		self.sendAllUser(notify)
		//排行奖励
		var curbossIndex = bossIndex
		self.zrange(main_name,0,-1,function(list) {
			for(var i = 0;i < list.length;i++){
				var title = "世界BOSS奖励"
				var rank = list.length - i
				var text = "恭喜您在世界BOSS挑战中获得第"+rank+"名"
				var awardId = 0
				if(rank > 10){
					awardId = "rank_11"
				}else if(rank > 5){
					awardId = "rank_6"
				}else{
					awardId = "rank_"+rank
				}
				self.sendTextToMail(list[i],main_name,world_boss_base[curbossIndex][awardId],rank)
			}
		})
	}
	//积分改变
	local.worldBossScoreChange = function(uid,score,cb) {
    	self.incrbyZset(main_name,uid,score)
	    self.incrbyAreaObj(main_name,"score_"+uid,score,function(value) {
    		if(cb)
    			cb(value)
		})
	}
	//获取世界BOSS数据
	this.getWorldBossData = function(uid,cb) {
		var info = {
			state : state,
			bossIndex : bossIndex,
			bossId : bossId,
			time : timeList[state],
			record : userRecords[uid] || []
		}
		self.getAreaHMObj(main_name,["count_"+uid,"rob_"+uid,"loss_"+uid,"score_"+uid],function(list) {
			info.challengeCount = Number(list[0]) || 0
			info.robCount = Number(list[1]) || 0
			info.lossCount = Number(list[2]) || 0
			info.score = Number(list[3]) || 0
			cb(true,info)
		})
	}
	//挑战boss
	this.challengeWorldBoss = function(uid,cb) {
		if(state !== 1){
			cb(false,"当前不在挑战阶段")
			return
		}
		var info = {}
		async.waterfall([
			function(next) {
				//获取挑战次数
				self.incrbyAreaObj(main_name,"count_"+uid,1,function(count) {
					count = Number(count) || 0
					if(count >= world_boss_cfg["challengeCount"]["value"] + 1){
						next("挑战次数已达上限")
						return
					}
					next()
				})
			},
			function(next) {
				//战斗
				var atkTeam = self.getUserTeam(uid)
				var defTeam =  self.fightContorl.getNPCTeamByType(main_name,bossTeam,self.getLordLv(uid))
				defTeam[1].boss = true
				var fightOtps = {seededNum : Date.now(),maxRound:world_boss_cfg["fightRound"]["value"]}
				self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
			    info = {
			    	atkTeam : atkTeam,
			    	defTeam : defTeam,
			    	fightOtps : fightOtps
			    }
		    	var list = self.fightContorl.getFightRecord()
		    	var overInfo = list[list.length - 1]
		    	next(null,overInfo)
			},
			function(overInfo,next) {
				//奖励
		    	var allDamage = overInfo.atkDamage
		    	info.allDamage = allDamage
		    	self.taskUpdate(uid,"world_boss_damage",1,allDamage)
		    	var score = Math.ceil(allDamage*world_boss_cfg["score"]["value"]) || 1
		    	var coin = Math.ceil(allDamage*world_boss_cfg["coin"]["value"]) || 1
		    	if(coin > world_boss_cfg["coin_max"]["value"])
		    		coin = world_boss_cfg["coin_max"]["value"]
		    	info.score = score
				if(self.checkLimitedTime("saodang")){
			    	info.award =  self.addItemStr(uid,"201:"+coin,2,"世界BOSS")
			    	info.award = info.award.concat(self.openChestAward(uid,world_boss_cfg["chest"]["value"]))
			    	info.award = info.award.concat(self.openChestAward(uid,world_boss_cfg["chest"]["value"]))
				}else{
			    	info.award =  self.addItemStr(uid,"201:"+coin,1,"世界BOSS")
			    	info.award = info.award.concat(self.openChestAward(uid,world_boss_cfg["chest"]["value"]))
				}
		    	local.worldBossScoreChange(uid,score,function(value) {
		    		info.curScore = value
		    		cb(true,info)
		    	})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//抢夺玩家
	this.robWorldBossPlayer = function(uid,targetUid,cb) {
		if(state !== 2){
			cb(false,"当前不在抢夺阶段")
			return
		}
		if(uid == targetUid){
			cb(false,"不能抢夺自己")
			return
		}
		var targetScore = 0
		async.waterfall([
			function(next) {
				//判断次数
				self.getAreaHMObj(main_name,["loss_"+targetUid,"rob_"+uid,"score_"+targetUid],function(list) {
					var loss = Number(list[0]) || 0
					var count = Number(list[1]) || 0
					targetScore = Number(list[2]) || 0
					if(loss >= world_boss_cfg["lossCount"]["value"] + 1){
						next("被抢次数达到上限")
						return
					}
					if(count >= world_boss_cfg["robCount"]["value"] + 1){
						next("抢夺次数达到上限")
						return
					}
					next()
				})
			},
			function(next) {
				self.incrbyAreaObj(main_name,"rob_"+uid,1)
				//挑战
				var atkTeam = self.getUserTeam(uid)
				self.getDefendTeam(targetUid,function(defTeam) {
					if(!defTeam){
						cb(false,"获取玩家阵容失败")
						return
					}
				    var seededNum = Date.now()
				    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
					var info = {
						type : "robWorldBoss",
						winFlag : winFlag,
						time : seededNum,
						atkTeam : atkTeam,
						defTeam : defTeam,
						seededNum : seededNum
					}
					self.getPlayerInfoByUids([uid,targetUid],function(userInfos) {
						info.atk = userInfos[0]
						info.def = userInfos[1]
					    if(winFlag){
					    	self.incrbyAreaObj(main_name,"loss_"+targetUid,1)
							var score = Math.ceil(targetScore * 0.1) || 1
							local.worldBossScoreChange(targetUid,-score,function(value) {
								info.defScore = value
								local.worldBossScoreChange(uid,score,function(value) {
									info.atkScore = value
									info.score = score
									next(null,info)
								})
							})
					    }else{
							next(null,info)	
					    }
					})
				})
			},
			function(info,next) {
			    if(!userRecords[uid])
			    	userRecords[uid] = []
			    if(!userRecords[targetUid])
			    	userRecords[targetUid] = []
			    userRecords[uid].push(info)
			    userRecords[targetUid].push(info)
			    self.sendToUser(targetUid,info)
			    cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取排行榜
	this.getWorldBossRank = function(cb) {
		self.zrangewithscore(main_name,-100,-1,function(list) {
			var uids = []
			var scores = []
			for(var i = 0;i < list.length;i += 2){
				uids.push(list[i])
				scores.push(list[i+1])
			}
			self.getPlayerInfoByUids(uids,function(userInfos) {
				cb(true,{userInfos:userInfos,scores:scores})
			})
		})
	}
}