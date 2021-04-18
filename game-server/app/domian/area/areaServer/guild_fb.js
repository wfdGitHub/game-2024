//公会副本
const async = require("async")
const guild_cfg = require("../../../../config/gameCfg/guild_cfg.json")
const guild_fb = require("../../../../config/gameCfg/guild_fb.json")
const guild_lv = require("../../../../config/gameCfg/guild_lv.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const main_name = "guild_fb"
const oneDayTime = 86400000
const currency = guild_cfg["currency"]["value"]
for(var i in guild_fb){
	guild_fb[i]["team"] = JSON.parse(guild_fb[i]["team"])
	for(var j = 0;j < 6;j++){
		if(guild_fb[i]["team"][j])
			guild_fb[i]["team"][j].boss = true
	}
}
module.exports = function() {
	var self = this
	//获取当前副本数据
	this.getGuildFBData = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
			return
		}
		var info = {}
		self.getHMObj(uid,main_name,["count","buy"],function(list) {
			info.count = Number(list[0]) || 0
			info.buy = Number(list[1]) || 0
			self.redisDao.db.hget(main_name+":"+guildId,"curFB",function(err,fbId) {
				info.fbId = Number(fbId) || 0
				cb(true,info)
			})
		})
	}
	//获取历史副本数据
	this.getHistoryGuildFB =function(uid,fbId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
			return
		}
		if(!guild_fb[fbId]){
			cb(false,"fbId 不存在")
			return
		}
		var info = {}
		info.fbId = fbId
		self.redisDao.db.hget(main_name+":"+guildId,"damage_"+fbId,function(err,damage) {
			info.damage = Number(damage) || 0
			self.redisDao.db.zrange(main_name+":"+guildId+":"+fbId,0,-1,"WITHSCORES",function(err,list) {
				var uids = []
				var scores = []
				for(var i = 0;i < list.length;i += 2){
					uids.push(list[i])
					scores.push(list[i+1])
				}
				self.getPlayerInfoByUids(uids,function(userInfos) {
					info.userInfos = userInfos
					info.scores = scores
					cb(true,info)
				})
			})
		})
	}
	//挑战副本
	this.challengeGuildFB = function(uid,fbId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
			return
		}
		var guildInfo = self.getGuildInfo(guildId)
		if(!guildInfo){
			cb(false,guildInfo)
			return
		}
		var lv = guildInfo.lv
		if(!Number.isInteger(fbId) || !guild_fb[fbId] || fbId > guild_lv[lv]["fb"]){
			cb(false,"等级限制 "+fbId+"/"+guild_lv[lv]["fb"])
			return
		}
		var killFlag = false
		var allDamage = 0
		var info = {}
		async.waterfall([
			function(next) {
				//检查副本是否开启
				self.redisDao.db.hget(main_name+":"+guildId,"curFB",function(err,data) {
					if(!data)
						data = 0
					if(fbId > data)
						next("fbId error "+fbId+"/"+data)
					else
						next()
				})
			},
			function(next) {
				//检查挑战次数
				self.getHMObj(uid,main_name,["count","buy"],function(list) {
					var count = Number(list[0]) || 0
					var buy = Number(list[1]) || 0
					if(count >= guild_cfg["guild_fb_free"]["value"] + buy)
						next("次数不足")
					else{
						self.incrbyObj(uid,main_name,"count",1)
						next()
					}
				})
			},
			function(next) {
				//挑战BOSS
				var atkTeam = self.getUserTeam(uid)
				var seededNum = Date.now()
				var defTeam = guild_fb[fbId]["team"]
				var fightOtps = {seededNum : seededNum,maxRound:5}
			    info = {
			    	atkTeam : atkTeam,
			    	defTeam : defTeam,
			    	fightOtps : fightOtps
			    }
			    self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
			    var overInfo = self.fightContorl.getOverInfo()
			    allDamage = overInfo.atkDamage
		    	next()
			},
			function(next) {
				//更新BOSS信息
				self.redisDao.db.hget(main_name+":"+guildId,"damage_"+fbId,function(err,damage) {
					damage = Number(damage) || 0
					if(damage < guild_fb[fbId]["hp"]){
						//总伤害
						self.redisDao.db.hincrby(main_name+":"+guildId,"damage_"+fbId,allDamage)
						//排行榜
						self.redisDao.db.zincrby(main_name+":"+guildId+":"+fbId,allDamage,uid)
						if((damage + allDamage) >= guild_fb[fbId]["hp"]){
							//击杀
							killFlag = true
							self.sendMail(uid,"击杀宗族BOSS","恭喜您,成功击杀宗族BOSS。",currency+":"+guild_fb[fbId]["kill"])
							self.addGuildEXP(guildId,guild_fb[fbId]["exp"])
							self.addGuildGift(guildId,"洪荒异兽【"+(fbId+1)+"】",10,guild_fb[fbId]["gift"],oneDayTime)
							self.redisDao.db.hincrby(main_name+":"+guildId,"curFB",1)
							self.redisDao.db.zrange(main_name+":"+guildId+":"+fbId,-3,-1,function(err,list) {
								var rank = 0
								for(var i = list.length - 1;i >= 0;i--){
									rank++
									if(list[i]){
										var text = "恭喜您在宗族BOSS伤害排名中获得"+rank+"名，获得排名奖励，祝您游戏愉快！"
										self.sendMail(list[i],"宗族BOSS伤害第"+rank+"名",text,guild_fb[fbId]["damage_"+rank])
									}
								}
							})
						}
						next()
					}else{
						//已击杀不处理数据
						next()
					}
				})
			},
			function(next) {
				info.allDamage = allDamage
				info.killFlag = killFlag
				//奖励
				info.awardList = self.addGuildScore(uid,guildId,guild_fb[fbId]["ctb"],"宝藏BOSS")
				info.awardList = info.awardList.concat(self.addItemStr(uid,"201:"+guild_fb[fbId]["coin"],1,"宝藏BOSS"))
				if(self.checkLimitedTime("fuben")){
					info.awardList = info.awardList.concat(self.addGuildScore(uid,guildId,guild_fb[fbId]["ctb"],"宝藏BOSS"))
					info.awardList = info.awardList.concat(self.addItemStr(uid,"201:"+guild_fb[fbId]["coin"],1,"宝藏BOSS"))
				}
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//购买公会副本挑战次数
	this.buyGuildFBCount = function(uid,cb) {
		self.getObj(uid,main_name,"buy",function(buy) {
			buy = Number(buy) || 0
			if(buy >= guild_cfg["guild_fb_buy"]["value"]){
				cb(false,"购买次数已达上限")
				return
			}
			self.consumeItems(uid,default_cfg["default_pc_1"]["value"],1,"公会副本次数",function(flag,err) {
				if(flag){
					self.incrbyObj(uid,main_name,"buy",1,function(data) {
						cb(true,data)
					})
				}
				else{
					cb(false,err)
				}
			})
		})
	}
	//删除公会副本数据
	this.removeGuildFBdata = function(guildId) {
		self.redisDao.db.del(main_name+":"+guildId)
		for(var fbId in guild_fb)
			self.redisDao.db.del(main_name+":"+guildId+":"+fbId)
	}
}