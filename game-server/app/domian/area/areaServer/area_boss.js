const area_boss_cfg = require("../../../../config/gameCfg/area_boss_cfg.json")
const area_boss_base = require("../../../../config/gameCfg/area_boss_base.json")
var util = require("../../../../util/util.js")
const main_name = "area_boss"
var maxBoss = 0
for(var i in area_boss_base){
	area_boss_base[i]["less_1"] = Math.ceil(area_boss_base[i]["hp"] * 0.2)
	area_boss_base[i]["less_2"] = Math.ceil(area_boss_base[i]["hp"] * 0.4)
	area_boss_base[i]["less_3"] = Math.ceil(area_boss_base[i]["hp"] * 0.6)
	area_boss_base[i]["less_4"] = Math.ceil(area_boss_base[i]["hp"] * 0.8)
	area_boss_base[i]["less_5"] = area_boss_base[i]["hp"]
	maxBoss++
}
//全服BOSS
module.exports = function() {
	var self = this
	var area_data = {
		bossIndex : -1,
		less_hp : 0
	}
	//全服BOSS每日更新
	this.areaBossDayUpdate = function() {
		if(self.newArea){
			self.redisDao.db.hmget("area:area"+self.areaId+":"+main_name,["bossIndex","less_hp"],function(err,list) {
				area_data.bossIndex = Number(list[0]) || 0
				area_data.less_hp = Number(list[1]) || 0
				//发放排行榜奖励
				if(area_data.bossIndex != -1 && self.areaDay <= maxBoss + 1){
					var curId = self.areaDay - 1
					if(area_boss_base[curId]){
						self.zrangewithscore(main_name,0,-1,function(list) {
							var rank = 0
							for(var i = list.length - 2;i >= 0;i -= 2){
								rank++
								if(rank >= 11){
									rank = 11
									self.sendTextToMail(list[i],"area_boss_play",area_boss_base[curId]["rank_"+rank])
								}else{
									self.sendTextToMail(list[i],"area_boss_rank",area_boss_base[curId]["rank_"+rank],rank)
								}
							}
							self.delZset(main_name)
						})
					}
				}
				if(!area_data.bossIndex || area_data.bossIndex < self.areaDay){
					if(area_boss_base[self.areaDay]){
						self.redisDao.db.del("area:area"+self.areaId+":"+main_name)
						area_data.bossIndex = self.areaDay
						area_data.less_hp = 0
						self.redisDao.db.hmset("area:area"+self.areaId+":"+main_name,area_data)
					}else{
						area_data.bossIndex = -1
						area_data.less_hp = 0
					}
				}
			})
		}
	}
	//全服BOSS初始化
	this.areaBossInit = function() {
		if(self.newArea){
			self.redisDao.db.hmget("area:area"+self.areaId+":"+main_name,["bossIndex","less_hp"],function(err,list) {
				area_data.bossIndex = Number(list[0]) || 0
				area_data.less_hp = Number(list[1]) || 0
				if(!area_boss_base[area_data.bossIndex] || area_data.bossIndex < self.areaDay){
					area_data.bossIndex = -1
					area_data.less_hp = 0
				}
			})
		}
	}
	//获取全服BOSS数据
	this.getAreaBossData = function(uid,cb) {
		if(!self.newArea){
			cb(true,area_data)
			return
		}
		self.redisDao.db.hmget("area:area"+self.areaId+":"+main_name,["play_"+uid,"buy_"+uid,"up_"+uid,"box1_"+uid,"box2_"+uid,"box3_"+uid,"box4_"+uid,"box5_"+uid],function(err,list) {
			if(err){
				cb(false,err)
			}else{
				var info = {
					bossIndex : area_data.bossIndex,
					less_hp : area_data.less_hp,
					play : Number(list[0]) || 0,
					buy :  Number(list[1]) || 0,
					up :  Number(list[2]) || 0,
					box1 :  Number(list[3]) || 0,
					box2 :  Number(list[4]) || 0,
					box3 :  Number(list[5]) || 0,
					box4 :  Number(list[6]) || 0,
					box5 :  Number(list[7]) || 0
				}
				cb(true,info)
			}
		})
	}
	//挑战全服BOSS
	this.challengeAreaBoss = function(uid,cb) {
		if(!area_boss_base[area_data.bossIndex]){
			cb(false,"已结束")
			return
		}
		self.redisDao.db.hmget("area:area"+self.areaId+":"+main_name,["play_"+uid,"buy_"+uid,"up_"+uid],function(err,list) {
			if(err){
				cb(false,err)
			}else{
				var play = Number(list[0]) || 0
				var buy = Number(list[1]) || 0
				var up = Number(list[2]) || 0
				if(play >= area_boss_cfg["free_count"]["value"] + buy){
					cb(false,"挑战次数不足")
					return
				}
				self.redisDao.db.hincrby("area:area"+self.areaId+":"+main_name,"play_"+uid,1)
				var atkTeam = self.getUserTeam(uid)
				var seededNum = Date.now()
				var defTeam = self.fightContorl.getNPCTeamByType(main_name,area_boss_base[area_data.bossIndex]["team"],self.getLordLv(uid))
				for(var i = 1;i < defTeam.length;i++)
					if(defTeam[i])
						defTeam[i].boss = true
				var fightOtps = {seededNum : seededNum,maxRound:10}
			    var info = {
			    	atkTeam : atkTeam,
			    	defTeam : defTeam,
			    	fightOtps : fightOtps
			    }
				if(up){
					fightOtps.atkTeamAdds = {atk : up*0.05}
				}
			    self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
		    	var list = self.fightContorl.getFightRecord()
		    	var overInfo = list[list.length - 1]
		    	var allDamage = overInfo.atkDamage
		    	//击杀奖励
		    	if(area_data.less_hp < area_boss_base[area_data.bossIndex]["hp"] && (area_data.less_hp + allDamage >= area_boss_base[area_data.bossIndex]["hp"])){
		    		self.sendTextToMail(uid,"area_boss_kill",area_boss_cfg["kill_award"]["value"])
		    	}
		    	info.allDamage = allDamage
		    	area_data.less_hp += allDamage
		    	info.less_hp = area_data.less_hp
		    	self.redisDao.db.hincrby("area:area"+self.areaId+":"+main_name,"less_hp",allDamage)
		    	var score = Math.ceil(allDamage*area_boss_cfg["score"]["value"])
		    	var coin = Math.ceil(allDamage*area_boss_cfg["coin"]["value"])
		    	if(coin > area_boss_cfg["coin_max"]["value"])
		    		coin = area_boss_cfg["coin_max"]["value"]
		    	info.score = score
		    	self.incrbyZset(main_name,uid,score)
		    	info.awardList = self.addItemStr(uid,"201:"+coin,1,"全服BOSS挑战")
			    cb(true,info)
			}
		})
	}
	//购买全服BOSS挑战次数
	this.buyAreaBossCount = function(uid,cb) {
		if(!area_boss_base[area_data.bossIndex]){
			cb(false,"已结束")
			return
		}
		self.redisDao.db.hget("area:area"+self.areaId+":"+main_name,"buy_"+uid,function(err,data) {
			var buy = Number(data) || 0
			if(buy >= area_boss_cfg["buy_count"]["value"]){
				cb(false,"购买次数限制")
			}else{
				self.consumeItems(uid,area_boss_cfg["buy_pc"]["value"],1,"全服BOSS次数",function(flag,err) {
					if(flag){
						self.redisDao.db.hincrby("area:area"+self.areaId+":"+main_name,"buy_"+uid,1)
						cb(true,buy+1)
					}else{
						cb(false,err)
					}
				})
			}
		})
	}
	//购买全服BOSS伤害增加
	this.buyAreaBossUp = function(uid,cb) {
		if(!area_boss_base[area_data.bossIndex]){
			cb(false,"已结束")
			return
		}
		self.redisDao.db.hget("area:area"+self.areaId+":"+main_name,"up_"+uid,function(err,data) {
			var up = Number(data) || 0
			if(up >= 10){
				cb(false,"购买次数限制")
			}else{
				up++
				if(!area_boss_cfg["up_"+up]){
					cb(false,"购买上限")
					return
				}
				self.consumeItems(uid,area_boss_cfg["up_"+up]["value"],1,"全服BOSS加成",function(flag,err) {
					if(flag){
						self.redisDao.db.hincrby("area:area"+self.areaId+":"+main_name,"up_"+uid,1)
						cb(true,up)
					}else{
						cb(false,err)
					}
				})
			}
		})
	}
	//领取全服BOSS宝箱奖励
	this.gainAreaBossBox = function(uid,index,cb) {
		if(!area_boss_base[area_data.bossIndex]){
			cb(false,"已结束")
			return
		}
		if(!area_boss_base[area_data.bossIndex]["box"+index]){
			cb(false,"宝箱不存在")
			return
		}
		if(area_data.less_hp < area_boss_base[area_data.bossIndex]["less_"+index]){
			cb(false,"未达成条件")
			return
		}
		self.redisDao.db.hget("area:area"+self.areaId+":"+main_name,"box"+index+"_"+uid,function(err,data) {
			if(data){
				cb(false,"已领取")
			}else{
				self.redisDao.db.hset("area:area"+self.areaId+":"+main_name,"box"+index+"_"+uid,1)
				var awardList = self.addItemStr(uid,area_boss_base[area_data.bossIndex]["box"+index],1,"全服BOSS宝箱_"+area_data.bossIndex+"_"+index)
				cb(true,awardList)
			}
		})
	}
	//获取排行榜
	this.getAreaBossRank = function(uid,cb) {
		if(!area_boss_base[area_data.bossIndex]){
			cb(false,"已结束")
			return
		}
		self.zrangewithscore(main_name,-10,-1,function(list) {
			var uids = []
			var scores = []
			for(var i = 0;i < list.length;i += 2){
				uids.push(list[i])
				scores.push(list[i+1])
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