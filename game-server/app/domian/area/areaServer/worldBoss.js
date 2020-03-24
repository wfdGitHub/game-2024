const world_boss_cfg = require("../../../../config/gameCfg/world_boss_cfg.json")
const world_boss_base = require("../../../../config/gameCfg/world_boss_base.json")
var util = require("../../../../util/util.js")
//世界BOSS
module.exports = function() {
	var self = this
	var local = {}
	var userCounts = {}
	var userScores = {}
	var robCounts = {}
	var lossCounts = {}
	var userInfos = {}
	var userRecords = {}
	var state = 0
	var time = 0
	var timer = 0
	var round = 0
	var bossIndex = 0
	var bossId = 0
	var bossTeam = []
	//检测时间BOSS玩法开启
	this.worldBossCheck = function() {
		let curMilliseconds = util.getDayMilliseconds()
		let tmpTime = 0
		bossIndex = (new Date()).getDay() * 2
		if(curMilliseconds < world_boss_cfg["openTime1"]["value"]){
			//设定时间至第一场开启
			round = 1
			tmpTime = world_boss_cfg["openTime1"]["value"] - curMilliseconds
		}else if(curMilliseconds < world_boss_cfg["openTime2"]["value"]){
			//设定时间至第二场开启
			round = 2
			bossIndex += 1
			tmpTime = world_boss_cfg["openTime2"]["value"] - curMilliseconds
		}else{
			//设定至第二天第一场
			round = 1
			bossIndex += 2
			tmpTime = 86400000 - curMilliseconds + world_boss_cfg["openTime1"]["value"]
		}
		bossIndex = bossIndex % 15
		bossId = world_boss_base[bossIndex]["bossId"]
		bossTeam = [0,0,0,0,bossId,0]
		tmpTime = 10000
		time = Date.now() + tmpTime
		console.log("开启时间:",tmpTime)
		clearTimeout(timer)
		timer = setTimeout(this.worldBossChallengeStage.bind(this),tmpTime)
	}
	//世界BOSS玩法开启  开始挑战
	this.worldBossChallengeStage= function() {
		console.log("世界BOSS玩法开启 开始挑战")
		this.delZset("worldBoss")
		state = 1
		time = Date.now() + world_boss_cfg["challengeTime"]["value"]
		userCounts = {}
		userScores = {}
		robCounts = {}
		lossCounts = {}
		userInfos = {}
		userRecords = {}
		let notify = {
			type : "worldBossChallengeStage",
			state : state,
			time : time
		}
		this.sendAllUser(notify)
		clearTimeout(timer)
		timer = setTimeout(this.worldBossRobStage.bind(this),world_boss_cfg["challengeTime"]["value"])
	}
	//进入抢夺阶段
	this.worldBossRobStage = function() {
		console.log("世界BOSS玩法 进入抢夺阶段")
		state = 2
		time = Date.now() + world_boss_cfg["robTime"]["value"]
		let notify = {
			type : "worldBossRobStage",
			state : state,
			bossIndex : bossIndex,
			time : time
		}
		this.sendAllUser(notify)
		clearTimeout(timer)
		timer = setTimeout(this.worldBossEnd.bind(this),world_boss_cfg["robTime"]["value"])
	}
	//世界BOSS玩法结束
	this.worldBossEnd = function() {
		state = 0
		let notify = {
			type : "worldBossEnd",
			state : state
		}
		this.sendAllUser(notify)
		//排行奖励
		let curbossIndex = bossIndex
		this.zrange("worldBoss",0,-1,function(list) {
			for(var i = 0;i < list.length;i++){
				let info = JSON.parse(list[i])
				let title = "世界BOSS奖励"
				let rank = list.length - i
				let text = "恭喜您在世界BOSS挑战中获得第"+rank+"名"
				let awardId = 0
				if(rank > 10){
					awardId = "rank_11"
				}else if(rank > 5){
					awardId = "rank_6"
				}else{
					awardId = "rank_"+rank
				}
				self.sendMail(info.uid,title,text,world_boss_base[curbossIndex][awardId])
			}
		})
		this.worldBossCheck()
	}
	//获取世界BOSS数据
	this.getWorldBossData = function(uid,cb) {
		let notify = {
			state : state,
			bossIndex : bossIndex,
			bossId : bossId,
			time : time,
			challengeCount : userCounts[uid],
			robCount : robCounts[uid],
			lossCount : lossCounts[uid],
			score : userScores[uid],
			record : userRecords[uid] || []
		}
		cb(true,notify)
	}
	//挑战boss
	this.challengeWorldBoss = function(uid,cb) {
		if(state !== 1){
			cb(false,"当前不在挑战阶段")
			return
		}
		if(!userCounts[uid]){
			userCounts[uid] = 0
			userInfos[uid] = this.getSimpleUser(uid)
		}
		if(userCounts[uid] >= world_boss_cfg["challengeCount"]["value"]){
			cb(false,"挑战次数已达上限")
			return
		}
		let atkTeam = this.getUserTeam(uid)
		userCounts[uid]++
	    let seededNum = Date.now()
	    let defTeam = bossTeam.concat([])
		defTeam = this.standardTeam(uid,defTeam,5)
		defTeam[4].maxHP = 999999999
		let fightRound = world_boss_cfg["fightRound"]["value"]
		let fightOtps = {seededNum : seededNum,maxRound:fightRound}
	    self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
	    let info = {
	    	atkTeam : atkTeam,
	    	defTeam : defTeam,
	    	fightOtps : fightOtps
	    }
    	let list = self.fightContorl.getFightRecord()
    	let overInfo = list[list.length - 1]
    	let allDamage = 0
    	for(var i = 0;i < overInfo.atkTeam.length;i++)
    		if(overInfo.atkTeam[i])
    			allDamage += overInfo.atkTeam[i].totalDamage
    	info.allDamage = allDamage
    	let score = Math.ceil(allDamage*world_boss_cfg["score"]["value"])
    	let coin = Math.ceil(allDamage*world_boss_cfg["coin"]["value"])
    	if(coin > world_boss_cfg["coin_max"]["value"])
    		coin = world_boss_cfg["coin_max"]["value"]
    	info.score = score
    	this.scoreChange(uid,score)
    	info.curScore = userScores[uid]
    	info.award =  self.addItemStr(uid,"201:"+coin)
    	cb(true,info)
	}
	this.scoreChange = function(uid,score) {
    	if(!userScores[uid])
    		userScores[uid] = 0
    	userScores[uid] += score
    	this.addZset("worldBoss",uid,userScores[uid])
	}
	//抢夺玩家
	this.robWorldBossPlayer = function(uid,targetUid,cb) {
		if(!userInfos[uid]){
			userInfos[uid] = this.getSimpleUser(uid)
		}
		if(!userInfos[targetUid]){
			cb(false,"目标不存在")
			return
		}
		if(!robCounts[uid])
			robCounts[uid] = 0
		if(robCounts[uid] >= world_boss_cfg["robCount"]["value"]){
			cb(false,"抢夺次数达到上限")
			return
		}
		if(!lossCounts[targetUid])
			lossCounts[targetUid] = 0
		if(lossCounts[targetUid] >= world_boss_cfg["lossCount"]["value"]){
			cb(false,"被抢次数达到上限")
			return
		}
		let atkTeam = this.getUserTeam(uid)
		this.getDefendTeam(targetUid,function(defTeam) {
			if(!defTeam){
				cb(false,"获取玩家阵容失败")
				return
			}
			robCounts[uid]++
		    let seededNum = Date.now()
		    let winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			let info = {
				type : "robWorldBoss",
				winFlag : winFlag,
				time : seededNum,
				atkTeam : atkTeam,
				defTeam : defTeam,
				seededNum : seededNum,
				atk : userInfos[uid],
				def : userInfos[targetUid]
			}
		    if(winFlag){
				lossCounts[targetUid]++
				let score = Math.ceil(userScores[targetUid] * 0.1)
				self.scoreChange(targetUid,-score)
				self.scoreChange(uid,score)
				info.score = score
				info.atkScore = userScores[uid]
				info.defScore = userScores[targetUid]
				self.sendToUser(targetUid,info)
		    }
		    if(!userRecords[uid])
		    	userRecords[uid] = []
		    if(!userRecords[targetUid])
		    	userRecords[targetUid] = []
		    userRecords[uid].push(info)
		    userRecords[uid].push(targetUid)
		    cb(true,info)
		})
	}
	//获取排行榜
	this.getWorldBossRank = function(cb) {
		self.zrangewithscore("worldBoss",-100,-1,function(uids) {
			self.getPlayerInfoByUids(uids,function(userInfos) {
				cb(true,userInfos)
			})
		})
	}
}