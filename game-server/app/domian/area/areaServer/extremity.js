//极限挑战
const extremity_award = require("../../../../config/gameCfg/extremity_award.json")
const extremity_cfg = require("../../../../config/gameCfg/extremity_cfg.json")
const heros = require("../../../../config/gameCfg/heros.json")
const bossList = JSON.parse(extremity_cfg["bossList"]["value"])
const main_name = "extremity"
const async = require("async")
module.exports = function() {
	var self = this
	var bossId = -1
	var teamId = -1
	var fightInfos = {}
	//每日更新
	this.extremityInit = function() {
		var day = Math.ceil((new Date()-new Date(new Date().getFullYear().toString()))/86400000)
		bossId = bossList[day % bossList.length]
		teamId = day % 4 + 1
	}
	//每日发放排行榜奖励
	this.extremityDayUpdate = function() {
		self.zrange(main_name,-10,-1,function(list) {
			var count = 0
			for(var i = list.length-1;i >= 0;i--){
				count++
				var rankId = count > 11 ? 11 : count
				var award = extremity_cfg["rank_"+rankId]["value"]
				self.sendMail(list[i],extremity_cfg["name"]["value"]+"排名奖励","恭喜您在"+extremity_cfg["name"]["value"]+"中获得第"+count+"名!",award)
			}
			self.delZset(main_name)
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
				data = {damage : 0}
			data.damage = Number(data.damage)
			data.bossId = bossId
			data.teamId = teamId
			cb(true,data)
		})
	}
	//获取极限挑战战斗数据
	this.getExtremityFight = function(uid,cb) {
		var atkTeam = this.getUserTeam(uid)
		if(atkTeam){
			var level = self.getLordLv(uid)
			var defTeam = self.standardTeam(uid,[0,0,0,0,bossId,0],"main",level)
			defTeam[4].boss = true
		    for(var i = 0;i < 6;i++){
		    	if(atkTeam[i] && heros[atkTeam[i]["id"]] && heros[atkTeam[i]["id"]]["realm"] == teamId)
		    		atkTeam[i]["self_atk_add"] = 0.5
		    }
			var fightOtps = {seededNum : Date.now(),maxRound:5}
			fightInfos[uid] = {atkTeam : atkTeam,defTeam : defTeam,fightOtps : fightOtps}
			cb(true,fightInfos[uid])
		}else{
			cb(false)
		}
	}
	//挑战BOSS
	this.extremityChallenge = function(uid,cb) {
		var oldDamage = 0
		var allDamage = 0
		async.waterfall([
			function(next){
				//获取伤害
				self.getObj(uid,main_name,"damage",function(data) {
					if(data)
						oldDamage = Number(data)
					next()
				})
			},
			function(next) {
				var fightInfo = fightInfos[uid]
				if(!fightInfo){
					next("未准备")
					return
				}
				delete fightInfos[uid]
			    var atkTeam = fightInfo.atkTeam
			    var defTeam = fightInfo.defTeam
			    var fightOtps = fightInfo.fightOtps
			    self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
		    	var list = self.fightContorl.getFightRecord()
		    	allDamage = list[list.length - 1].atkDamage
		    	next()
			},
			function(next) {
				if(oldDamage >= allDamage){
					console.error("伤害未超过之前记录 "+oldDamage+"/"+allDamage)
					next("伤害未超过之前记录 "+oldDamage+"/"+allDamage)
					return
				}
				var awardList = []
				for(var i in extremity_award){
					if(allDamage < extremity_award[i]["value"])
						break
					if(oldDamage < extremity_award[i]["value"] && allDamage >= extremity_award[i]["value"]){
						for(var j = 0;j < extremity_award[i]["count"];j++)
							awardList = self.openChestAward(uid,extremity_cfg["box_award"]["value"])
					}
				}
				self.setObj(uid,main_name,"damage",allDamage)
				self.addZset(main_name,uid,allDamage)
				var info = {
					damage : allDamage,
					awardList : awardList
				}
				cb(true,info)
			}
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