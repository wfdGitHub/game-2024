//极限挑战
const extremity_award = require("../../../../config/gameCfg/extremity_award.json")
const extremity_cfg = require("../../../../config/gameCfg/extremity_cfg.json")
const heros = require("../../../../config/gameCfg/heros.json")
const species = require("../../../../config/gameCfg/species.json")
const bossId = extremity_cfg["bossId"]["value"]
const maxRound = extremity_cfg["maxRound"]["value"]
const main_name = "extremity"
const async = require("async")
var specieList = []
for(var i in species)
	specieList.push(i)
module.exports = function() {
	var self = this
	var teamId = -1
	var bossLv = 1
	var fightInfos = {}
	//每日更新
	this.extremityInit = function() {
		teamId =  specieList[self.areaDay % specieList.length]
		self.getAreaObj(main_name,"bossLv",function(data) {
			bossLv = Number(data) || 1
		})
	}
	//每日发放排行榜奖励
	this.extremityDayUpdate = function() {
		self.getAreaObj(main_name,"bossLv",function(data) {
			bossLv = Number(data) || 1
			self.zrangewithscore(main_name,-10,-1,function(list) {
				var count = 0
				var allDamage = 0
				for(var i = list.length-1;i >= 0;i -= 2){
					var uid = list[i-1]
					var damage = Number(list[i]) || 0
					count++
					var rankId = count > 11 ? 11 : count
					if(count <= 10){
						allDamage += damage
					}
					var award = extremity_award[bossLv]["rank_"+rankId]
					self.sendTextToMail(uid,"extremity_day",award,rankId)
				}
				if(allDamage >= extremity_award[bossLv]["hp"]){
					if(extremity_award[bossLv+1]){
						bossLv++
						self.incrbyAreaObj(main_name,"bossLv",1)
					}
				}else if(allDamage < extremity_award[bossLv]["hp"] * 0.7){
					if(extremity_award[bossLv-1]){
						bossLv--
						self.incrbyAreaObj(main_name,"bossLv",-1)
					}
				}
				self.delZset(main_name)
			})
		})
	}
	//玩家每日更新
	this.extremityUserUpdate = function(uid) {
		self.delObjAll(uid,main_name)
	}
	//获取极限挑战数据
	this.getExtremityData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			data.teamId = teamId
			data.bossLv = bossLv
			cb(true,data)
		})
	}
	//挑战BOSS
	this.extremityChallenge = function(uid,cb) {
		var atkTeam = this.getUserTeam(uid)
		async.waterfall([
			function(next) {
				//获取次数
				self.getObj(uid,main_name,"count",function(count) {
					count = Number(count) || 0
					if(count >= extremity_cfg["count"]["value"]){
						next("次数不足")
					}else{
						self.incrbyObj(uid,main_name,"count",1)
						next()
					}
				})
			},
			function(next) {
				self.taskUpdate(uid,"extremity",1)
				var level = extremity_award[bossLv]["lv"]
				var defTeam = self.fightContorl.getNPCTeamByType(main_name,[bossId],level)
				var fightOtps = {seededNum : Date.now(),maxRound:maxRound}
				defTeam[1].boss = true
			    atkTeam[0]["specieAdd"] = teamId
			    self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
		    	var list = self.fightContorl.getFightRecord()
		    	var allDamage = list[list.length - 1].atkDamage
		    	next(null,allDamage)
			},
			function(allDamage,next) {
				//记录伤害
				self.incrbyObj(uid,main_name,"damage",allDamage)
				self.addZset(main_name,uid,allDamage)
				//计算奖励
				var rate = 1
				var damageRate = allDamage / extremity_award[bossLv]["hp"]
				if(damageRate > 0.2)
					damageRate = 0.2
				rate += Number((extremity_cfg["damage_rate"]["value"] *  damageRate * 100).toFixed(2))
				var awardList = self.addItemStr(uid,extremity_award[bossLv]["award"],rate,"极限挑战")
				cb(true,{verify:self.fightContorl.getVerifyInfo(),allDamage:allDamage,awardList:awardList})
			},
		],function(err) {
			cb(false,err)
		})
	}
	//获取排行榜
	this.getExtremityRank = function(cb) {
		self.zrangewithscore(main_name,-10,-1,function(list) {
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