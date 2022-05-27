//新公会攻城战
const main_name = "guild_city_boss"
const guild_city = require("../../../../config/gameCfg/guild_city.json")
const guild_city_boss = require("../../../../config/gameCfg/guild_city_boss.json")
const util = require("../../../../util/util.js")
const async = require("async")
const openTime = {"2":1,"4":1,"6":1}   //开启时间
const oneDayTime = 86400000
const fightTime = 5 //战斗开始时间
module.exports = function() {
	var self = this
	var city_boss = {dayStr : 0}
	// 每日刷新
	this.guildCityBossDayUpdate = function() {
		var day = (new Date()).getDay()
		self.getAreaObjAll(main_name,function(data) {
			if(!data)
				data = {}
			if(openTime[day]){
				if(data.dayStr != (new Date()).toDateString()){
					self.createGuildCityBoss()
				}else{
					city_boss = data
					for(var i in city_boss){
						if(i != "dayStr")
							city_boss[i] = Number(city_boss[i])
					}
				}
				city_boss.open = true
			}else{
				city_boss.open = false
			}
		})
	}
	//刷新初始BOSS
	this.createGuildCityBoss = function() {
		city_boss.dayStr = (new Date()).toDateString()
		for(var i in guild_city){
			if(!city_boss["boss_"+i+"_lv"]){
				city_boss["boss_"+i+"_lv"] = 1
			}else{
				if(city_boss["boss_"+i+"_hp"] <= 0){
					//已死亡则升级
					if(guild_city_boss[Number(city_boss["boss_"+i+"_lv"]) + 1]){
						city_boss["boss_"+i+"_lv"] = Number(city_boss["boss_"+i+"_lv"]) + 1
					}
				}else{
					//未死亡则降级
					if(guild_city_boss[Number(city_boss["boss_"+i+"_lv"]) - 1]){
						city_boss["boss_"+i+"_lv"] = Number(city_boss["boss_"+i+"_lv"]) - 1
					}
				}
			}
			city_boss["boss_"+i+"_hp"] = guild_city_boss[city_boss["boss_"+i+"_lv"]]["HP"]
			city_boss["boss_"+i+"_guild"] = -1
			self.delZset("guildCityBossUserRank:"+i)
			self.delZset("guildCityBossGuildRank:"+i)
		}
		self.delAreaObjAll(main_name+":count")
		self.delAreaObjAll(main_name)
		self.setAreaHMObj(main_name,city_boss)
	}
	//获取攻城战信息
	this.getGuildCityBossData = function(uid,cb) {
		var info = {}
		self.getAreaObj(main_name+":count",uid,function(data) {
			if(!data)
				data = 0
			info.count = data
			info.city_boss = city_boss
			cb(true,info) 
		})
	}
	//挑战攻城战BOSS
	this.challengeGuildCityBoss = function(uid,index,cb) {
		var day = (new Date()).getDay()
		if(!city_boss.open){
			cb(false,"今日未开放")
			return
		}
		if(!guild_city[index]){
			cb(false,"城池不存在")
			return
		}
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
			return
		}
		if((new Date()).getHours() < fightTime){
			cb(false,fightTime+"点之后可以挑战")
			return
		}
		self.getAreaObj(main_name+":count",uid,function(count) {
			count = Number(count) || 0
			if(count >= 5){
				cb(false,"今日挑战次数已满")
				return
			}
			if(city_boss["boss_"+index+"_guild"] != -1){
				cb(false,"该城池已被占领")
				return
			}
			count++
			self.incrbyAreaObj(main_name+":count",uid,1)
			var atkTeam = self.getUserTeam(uid)
			var bossInfo = guild_city_boss[city_boss["boss_"+index+"_lv"]]
			var defTeam = self.standardTeam(uid,[0,0,0,0,guild_city[index]["bossId"],0],"main",bossInfo["lv"])
			self.fightContorl.mergeData(defTeam[4],{amplify:bossInfo["amplify"],hitRate:bossInfo["hitRate"]})
			defTeam[4].boss = true
			var fightOtps = {seededNum : Date.now(),maxRound:5}
			var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
			var list = self.fightContorl.getFightRecord()
			var overInfo = list[list.length - 1]
			var allDamage = overInfo.atkDamage
			//保存挑战记录
			self.incrbyZset("guildCityBossUserRank:"+index,uid,allDamage)
			self.incrbyZset("guildCityBossGuildRank:"+index,guildId,allDamage)
			var gold = Math.min(Math.floor(allDamage * guild_city_boss[city_boss["boss_"+index+"_lv"]]["change_rate"]),guild_city_boss[city_boss["boss_"+index+"_lv"]]["max_gold"])
			var awardList = self.addItemStr(uid,"201:"+gold,1,"城池BOSS"+index)
			if(city_boss["boss_"+index+"_hp"] < allDamage){
				//击杀奖励
				self.killGuildCityBoss(uid,index,guildId)
				city_boss["boss_"+index+"_hp"] = 0
			}else{
				city_boss["boss_"+index+"_hp"] -= allDamage
			}
			self.setAreaObj(main_name,"boss_"+index+"_hp",city_boss["boss_"+index+"_hp"])
			cb(true,{fightInfo:{atkTeam:atkTeam,defTeam:defTeam,fightOtps:fightOtps},awardList:awardList,allDamage:allDamage,count:count})
		})
	}
	//击杀奖励
	this.killGuildCityBoss = function(uid,index,guildId) {
		var lv = city_boss["boss_"+index+"_lv"]
		//击杀奖励
		self.sendTextToMail(uid,"guildcity_kill",guild_city_boss[city_boss["boss_"+index+"_lv"]]["kill_award"],guild_city[index]["name"])
		//排名奖励
		self.zrange("guildCityBossUserRank:"+index,-3,-1,function(list) {
			var rank = 1
			for(var i = list.length - 1;i >= 0;i--){
				self.sendTextToMail(list[i],"guildcity_rank",guild_city_boss[city_boss["boss_"+index+"_lv"]]["damage_"+rank],rank)
				rank++
			}
		})
		//占领奖励
		self.zrange("guildCityBossGuildRank:"+index,-1,-1,function(list) {
			var win_id = list[0]
			//绑定占领公会
			self.addGuildEXP(win_id,500)
			self.addGuildGift(win_id,"【"+guild_city[index]["name"]+"】",10,guild_city_boss[city_boss["boss_"+index+"_lv"]]["red_award"],oneDayTime)
			self.redisDao.db.hget("guild:guildInfo:"+win_id,"name",function(err,data) {
				city_boss["boss_"+index+"_guild"] = data
				self.setAreaObj(main_name,"boss_"+index+"_guild",city_boss["boss_"+index+"_guild"])
			})
		})
	}
	//获取城池信息(个人排行榜,公会排行榜)
	this.getGuildCityBossInfo = function(uid,index,cb) {
		var info = {}
		info.bossHp = city_boss["boss_"+index+"_hp"]
		info.bossLv = city_boss["boss_"+index+"_lv"]
		self.zrangewithscore("guildCityBossUserRank:"+index,0,9,function(list) {
			var uids = []
			var userScores = []
			for(var i = 0;i < list.length;i += 2){
				uids.push(list[i])
				userScores.push(list[i+1])
			}
			self.getPlayerInfoByUids(uids,function(userInfos) {
				info.userInfos = userInfos
				info.userScores = userScores
				self.zrangewithscore("guildCityBossGuildRank:"+index,0,9,function(list) {
					var guildInfos = []
					var guildScores = []
					for(var i = 0;i < list.length;i += 2){
						guildInfos.push(self.getGuildName(list[i]))
						guildScores.push(list[i+1])
					}
					info.guildInfos = guildInfos
					info.guildScores = guildScores
					cb(true,info)
				})
			})
		})
	}
}