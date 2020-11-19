//宗族攻城战
const guild_city = require("../../../../config/gameCfg/guild_city.json")
const main_name = "guild_city"
const async = require("async")
const teamNumLv = {"0" : 0,"1" : 90,"2" : 120,"3" : 150,"4" : 180}
const oneDayTime = 86400000
const endHours = 19		//战斗时间
for(var i in guild_city){
	guild_city[i]["team"] = JSON.parse(guild_city[i]["team"])
}
//刷新时间
var fightTime = {"2":1,"4":1,"6":1}
var refreshTime = {"3":1,"5":1,"0":1}
module.exports = function() {
	var self = this
	//每日刷新
	this.guildCityDayUpdate = function() {
		var day = (new Date()).getDay()
		if(fightTime[day]){
			//定时到战斗时间开始战斗
			var d1 = new Date()
			d1.setHours(endHours,0,0,0)
			var dt = d1.getTime() - Date.now()
			if(dt < 10000)
				dt = 10000
			console.log("guildCityBeginFight 倒计时 ",dt)
			self.setTimeout(self.guildCityBeginFight,dt)
		}
	}
	//每日首次刷新
	this.guildCityFirstUpdate = function() {
		var day = (new Date()).getDay()
		if(refreshTime[day]){
			self.delAreaObjAll(main_name+":apply")
		}
	}
	//获取攻城战数据
	this.getGuildCityData = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		var info = {}
		async.waterfall([
			function(next) {
				//奖励领取记录
				self.getObj(uid,main_name,"dayAward",function(data) {
					info.dayAward = data
					next()
				})
			},
			function(next) {
				//获取城池列表
				self.getAreaObjAll(main_name+":cityLord",function(data) {
					info.citys = {}
					for(var i in data){
						info.citys[i] = self.getGuildInfo(data[i])
					}
					next()
				})
			},
			function(next) {
				//获取本宗族报名数据
				self.getAreaObj(main_name+":apply",guildId,function(data) {
					info.apply = data
					next()
				})
			},
			function(next) {
				//获取我的派遣队伍
				var arr = []
				for(var i in teamNumLv)
					arr.push(uid+"_"+i)
				console.log(arr)
				self.getAreaHMObj(main_name+":sends",arr,function(data) {
					info.sendTeams = data
					cb(true,info)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取城池数据
	this.getGuildCityRecord = function(uid,cityId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		var info = {}
		async.waterfall([
			function(next) {
				//基础信息
				self.redisDao.db.get("area:area"+self.areaId+":"+main_name+":baseInfo:"+cityId,function(err,data) {
					info.baseInfo = data
					next()
				})
			},
			function(next) {
				//简易战报
				self.redisDao.db.lrange("area:area"+self.areaId+":"+main_name+":simpleRecord:"+cityId,0,-1,function(err,data) {
					info.record = data
					next()
				})
			},
			function(next) {
				//本宗族队伍
				self.getAreaObjAll(main_name+":city:"+cityId,function(data) {
					var list = []
					var uids = []
					for(var key in data){
					    var strList = key.split("_")
					    var guildTeamInfo = {
					    	guildId : Number(strList[0]),
					    	uid : Number(strList[1]),
					    	teamId : Number(strList[2])
					    }
					    if(guildTeamInfo.guildId == guildId){
					    	uids.push(guildTeamInfo.uid)
					    	list.push(guildTeamInfo)
					    }
					}
					var multiList = []
					for(var i = 0;i < list.length;i++){
						multiList.push(["hget","player:user:"+list[i]["uid"]+":guild_team",list[i]["teamId"]])
					}
					self.redisDao.multi(multiList,function(err,hIds) {
						self.heroDao.getMultiHeroList(uids,hIds,function(flag,data) {
							for(var i = 0;i < list.length;i++){
								list[i]["team"] = data[i]
							}
							info.guildTeams = list
							next()
						})
					})
				})
			},
			function(next) {
				//个人排名
				self.zrangewithscore(main_name+":userDamageRank:"+cityId,-10,-1,function(list) {
					var uids = []
					var scores = []
					for(var i = 0;i < list.length;i += 2){
						uids.push(list[i])
						scores.push(list[i+1])
					}
					self.getPlayerInfoByUids(uids,function(userInfos) {
						var userRank = {}
						userRank.userInfos = userInfos
						userRank.scores = scores
						info.userRank = userRank
						next()
					})
				})
			},
			function(next) {
				//宗族排名
				self.zrangewithscore(main_name+":guildDamageRank:"+cityId,-10,-1,function(list) {
					var guilds = []
					var scores = []
					for(var i = 0;i < list.length;i += 2){
						guilds.push(self.getGuildInfo(list[i]))
						scores.push(list[i+1])
					}
					var guildRank = {}
					guildRank.guilds = guilds
					guildRank.scores = scores
					info.guildRank = guildRank
					cb(true,info)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取战斗数据
	this.getGuildCityFight = function(uid,cityId,index,cb) {
		self.redisDao.db.lindex("area:area"+self.areaId+":"+main_name+":fightRecordList:"+cityId,index,function(err,data) {
			cb(true,data)
		})
	}
	//报名参赛
	this.applyGuildCity = function(uid,cityId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		var guildInfo = self.getGuildInfo(guildId)
		if(!guildInfo){
			cb(false,guildInfo)
			return
		}
		if(guildInfo.lead != uid && guildInfo.deputy != uid){
			cb(false,"权限不足")
			return
		}
		//检测参数合法性
		if(!guild_city[cityId]){
			cb(false,"cityId error "+cityId)
			return
		}
		//检测是否在报名时间
		var day = (new Date()).getDay()
		var hours = (new Date()).getHours()
		if(fightTime[day] && hours >= endHours){
			cb(false)
			return
		}
		async.waterfall([
			function(next) {
				//检测是否已报名
				self.getAreaObj(main_name+":apply",guildId,function(data) {
					if(data)
						next("已报名")
					else
						next()
				})
			},
			function(next) {
				//检测报名目标是否已被自己占领
				self.getAreaObj(main_name+":cityLord",cityId,function(data) {
					if(data && data == guildId)
						next("已占领")
					else
						next()
				})
			},
			function(next) {
				//报名
				self.setAreaObj(main_name+":apply",guildId,cityId)
				cb(true)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//组建队伍
	this.buildGuildTeam = function(uid,hIds,cb) {
		if(!hIds || !hIds.length ||  !Number.isInteger(hIds.length/6)){
			cb(false,"hids error")
			return
		}
		var teamNum = Math.ceil(hIds.length/6) - 1
		var level = self.players[uid]["level"]
		if(teamNumLv[teamNum] == undefined || level < teamNumLv[teamNum]){
			cb(false,"等级不足")
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
			var teams = {}
			for(var i = 0;i <= teamNum;i++)
				teams[i] = JSON.stringify(hIds.splice(0,6))
			self.delObjAll(uid,"guild_team")
			self.setHMObj(uid,"guild_team",teams)
    		cb(true,teams)
    	})
	}
	//获取我的队伍列表
	this.getGuildTeam = function(uid,cb) {
		self.getObjAll(uid,"guild_team",function(data) {
			cb(true,data)
		})
	}
	//派出队伍
	this.sendGuildCityTeam = function(uid,cityId,teamId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		//检测时间
		var day = (new Date()).getDay()
		var hours = (new Date()).getHours()
		if(fightTime[day] && hours >= endHours){
			cb(false,"endHours "+endHours)
			return
		}
		async.waterfall([
			function(next) {
				//检测已占领或已报名
				self.getAreaObj(main_name+":apply",guildId,function(data) {
					if(data){
						next()
					}else{
						self.getAreaObjAll(main_name+":holdCitys:"+guildId,function(data) {
							if(data && data[cityId])
								next()
							else
								next("该城池不可派遣")
						})
					}
				})
			},
			function(next) {
				//检测是否可派遣
				self.getObj(uid,"guild_team",teamId,function(hIds) {
					if(!hIds){
						next("队伍不存在")
						return
					}
					hIds = JSON.parse(hIds)
			    	self.heroDao.getHeroList(uid,hIds,function(flag,list) {
			    		var num = 0
						for(var i = 0;i < list.length;i++){
							if(list[i]){
								num++
							}
						}
						if(num == 0){
							next("队伍为空")
							return
						}
			    		next()
			    	})
				})
			},
			function(next) {
				//检测队伍是否已派遣
				self.getAreaObj(main_name+":sends",uid+"_"+teamId,function(data) {
					if(data){
						cb(false,"队伍已派遣")
						return
					}
					next()
				})
			},
			function(next) {
				//派遣队伍
				self.setAreaObj(main_name+":sends",uid+"_"+teamId,cityId)
				self.setAreaObj(main_name+":city:"+cityId,guildId+"_"+uid+"_"+teamId,1)
				cb(true)
			},
		],function(err) {
			cb(false,err)
		})
	}
	//撤回队伍
	this.cancelGuildCityTeam = function(uid,teamId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		//检测队伍是否已派遣
		self.getAreaObj(main_name+":sends",uid+"_"+teamId,function(cityId) {
			if(!cityId){
				cb(false,"未派遣")
			}else{
				self.delAreaObj(main_name+":sends",uid+"_"+teamId)
				self.delAreaObj(main_name+":city:"+cityId,guildId+"_"+uid+"_"+teamId)
				cb(true)
			}
		})
	}
	//领取每日奖励
	this.gainGuildCityAward = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		//检测时间
		var hours = (new Date()).getHours()
		if(hours < endHours){
			cb(false,"未到领取时间 "+endHours)
			return
		}
		self.getObj(uid,main_name,"dayAward",function(data) {
			if(data){
				cb(false,"已领取")
				return
			}
			self.getAreaObjAll(main_name+":holdCitys:"+guildId,function(data) {
				var awardList = []
				for(var cityId in data){
					awardList = awardList.concat(self.addItemStr(uid,guild_city[cityId]["award"],1,"城池"+cityId))
				}
				self.setObj(uid,main_name,"dayAward",1)
				cb(true,awardList)
			})
		})
	}
	//城池战斗
	this.guildCityBeginFight = function() {
		var curDayStr = (new Date()).toDateString()
		self.getAreaObj(main_name,"dayStr",function(data) {
			if(data != curDayStr){
				self.setAreaObj(main_name,"dayStr",curDayStr)
				for(var cityId in guild_city){
					self.guildOneCityFight(cityId)
				}
			}
		})
	}
	//单城池战斗
	this.guildOneCityFight = function(cityId) {
		var atkTeams = []
		var defTeams = []
		var oldGuildId = 0			//原城主宗族
		var winGuildId = 0			//攻城胜利者
		var atkList = []
		var defList = []
		var atkUids = []
		var defUids = []
		var atkNum = 0
		var defNum = 0
		var guildDamageRank = {}
		var userDamageRank = {}
		var fightRecordList = []
		var simpleRecord = []
		async.waterfall([
			function(next) {
				//清除初始数据
				self.redisDao.db.del("area:area"+self.areaId+":"+main_name+":baseInfo:"+cityId)
				self.redisDao.db.del("area:area"+self.areaId+":"+main_name+":simpleRecord:"+cityId)
				self.redisDao.db.del("area:area"+self.areaId+":"+main_name+":fightRecordList:"+cityId)
				self.delZset(main_name+":userDamageRank:"+cityId)
				self.delZset(main_name+":guildDamageRank:"+cityId)
				next()
			},
			function(next) {
				//获取防守方
				self.getAreaObj(main_name+":cityLord",cityId,function(data) {
					if(data)
						oldGuildId = data
					next()
				})
			},
			function(next) {
				//获取城池队伍
				self.getAreaObjAll(main_name+":city:"+cityId,function(data) {
					for(var key in data){
					    var strList = key.split("_")
					    var info = {
					    	guildId : Number(strList[0]),
					    	uid : Number(strList[1]),
					    	teamId : Number(strList[2])
					    }
					    if(info.guildId == oldGuildId)
					    	defList.push(info)
					    else
					    	atkList.push(info)
						self.delAreaObj(main_name+":sends",info.uid+"_"+info.teamId)
						self.delAreaObj(main_name+":city:"+cityId,key)
					}
					atkList.sort(function(){return Math.random() > 0.5?1:-1})
					defList.sort(function(){return Math.random() > 0.5?1:-1})
					for(var i = 0;i < atkList.length;i++)
						atkUids.push(atkList[i].uid)
					for(var i = 0;i < defList.length;i++)
						defUids.push(defList[i].uid)
					next()
				})
			},
			function(next) {
				//获取攻方玩家信息
				self.getPlayerInfoByUids(atkUids,function(data) {
					for(var i = 0;i < atkList.length;i++){
						atkList[i]["info"] = data[i]
					}
					next()
				})
			},
			function(next) {
				//获取守方玩家信息
				self.getPlayerInfoByUids(defUids,function(data) {
					for(var i = 0;i < defList.length;i++){
						defList[i]["info"] = data[i]
					}
					next()
				})
			},
			function(next) {
				//获取攻方队伍阵容
				if(atkList.length){
					var multiList = []
					for(var i = 0;i < atkList.length;i++){
						multiList.push(["hget","player:user:"+atkList[i]["uid"]+":guild_team",atkList[i]["teamId"]])
					}
					self.redisDao.multi(multiList,function(err,list) {
						self.heroDao.getMultiHeroList(atkUids,list,function(flag,data) {
							atkTeams = data
							next()
						})
					})
				}else{
					next()
				}
			},
			function(next) {
				//获取守方队伍阵容
				if(oldGuildId){
					if(defList.length){
						var multiList = []
						for(var i = 0;i < defList.length;i++){
							multiList.push(["hget","player:user:"+defList[i]["uid"]+":"+main_name,defList[i]["teamId"]])
						}
						self.redisDao.multi(multiList,function(err,list) {
							self.heroDao.getMultiHeroList(atkUids,list,function(flag,data) {
								defTeams = data
								next()
							})
							next()
						})
					}else{
						next()
					}
				}else{
					for(var i = 0;i < guild_city[cityId]["count"];i++){
						defList[i] = {
							"guildId":0,
							"uid":0,
							"info":{"uid":0,"name":"遗迹守卫"}
						}
						defTeams.push(guild_city[cityId]["team"])
					}
					next()
				}
			},
			function(next) {
				//开始战斗
				var atkSurplus = [1,1,1,1,1,1]
				var defSurplus = [1,1,1,1,1,1]
				var atkWin = true
				for(var i = 0;i < atkList.length;i++){
					var guildId = atkList[i]["guildId"]
			    	if(!guildDamageRank[guildId])
			    		guildDamageRank[guildId] = 0
				}
				while(atkTeams[atkNum] && defTeams[defNum]){
					var atkTeam = atkTeams[atkNum]
					var defTeam = defTeams[defNum]
					for(var i = 0;i < 6;i++){
						if(atkTeam[i])
							atkTeam[i]["surplus_health"] = atkSurplus[i]
						if(defTeam[i])
							defTeam[i]["surplus_health"] = defSurplus[i]
					}
					var seededNum = Date.now()
					var record = {atkTeam:atkTeam,defTeam,defTeam,seededNum:seededNum}
					record.atkIndex = atkNum
					record.defIndex = defNum
					record.winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
					var overInfo = self.fightContorl.getOverInfo()
					var guildId = atkList[atkNum]["guildId"]
			    	var atkDamage = 0
			    	for(var i = 0;i < overInfo.atkTeam.length;i++)
			    		if(overInfo.atkTeam[i])
			    			atkDamage += overInfo.atkTeam[i].totalDamage
			    	var defDamage = 0
			    	for(var i = 0;i < overInfo.defTeam.length;i++)
			    		if(overInfo.defTeam[i])
			    			defDamage += overInfo.defTeam[i].totalDamage
			    	if(!guildDamageRank[guildId])
			    		guildDamageRank[guildId] = 0
			    	guildDamageRank[guildId] += atkDamage
			    	if(atkList[atkNum] && atkList[atkNum]["uid"]){
				    	if(!userDamageRank[atkList[atkNum]["uid"]])
				    		userDamageRank[atkList[atkNum]["uid"]] = 0
						userDamageRank[atkList[atkNum]["uid"]] += atkDamage
			    	}
			    	if(defList[defNum] && defList[defNum]["uid"]){
				    	if(!userDamageRank[defList[defNum]["uid"]])
				    		userDamageRank[defList[defNum]["uid"]] = 0
						userDamageRank[defList[defNum]["uid"]] += defDamage
			    	}
					atkSurplus = [1,1,1,1,1,1]
					defSurplus = [1,1,1,1,1,1]
					if(record.winFlag){
						//攻方赢
						for(var i = 0;i < 6;i++){
							if(overInfo.atkTeam[i])
								atkSurplus[i] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
						}
						defNum++
						atkWin = true
					}else{
						//守方赢
						for(var i = 0;i < 6;i++){
							if(overInfo.defTeam[i])
								defSurplus[i] = overInfo.defTeam[i].hp/overInfo.defTeam[i].maxHP
						}
						atkNum++
						atkWin = false
					}
					fightRecordList.push(JSON.stringify(record))
					simpleRecord.push(JSON.stringify({atkIndex : record.atkIndex,defIndex : record.defIndex,winFlag : record.winFlag}))
					if(atkNum >= 200 || defNum >= 200){
						break
					}
				}
				if(atkWin){
					for(var guildId in guildDamageRank){
						if(!winGuildId || guildDamageRank[guildId] > guildDamageRank[winGuildId]){
							winGuildId = guildId
						}
					}
				}
				next()
			},
			function(next) {
				//记录数据
				var info = {
					atkList : atkList,
					defList : defList,
					oldGuildId : oldGuildId,
					winGuildId : winGuildId,
					time : Date.now()
				}
				self.redisDao.db.set("area:area"+self.areaId+":"+main_name+":baseInfo:"+cityId,JSON.stringify(info))
				if(simpleRecord.length){
					self.redisDao.db.rpush("area:area"+self.areaId+":"+main_name+":simpleRecord:"+cityId,simpleRecord)
					self.redisDao.db.rpush("area:area"+self.areaId+":"+main_name+":fightRecordList:"+cityId,fightRecordList)
				}
				for(var i in userDamageRank)
					self.addZset(main_name+":userDamageRank:"+cityId,i,userDamageRank[i])
				for(var i in guildDamageRank)
					self.addZset(main_name+":guildDamageRank:"+cityId,i,guildDamageRank[i])
				next()
			},
			function(next) {
				var uidMap = {}
				//发放奖励
				for(var i = 0;i < atkList.length;i++){
					if(!uidMap[atkList[i]["uid"]])
						self.sendMail(atkList[i]["uid"],"远古遗迹参与奖励","您参与本次宗族活动【远古遗迹】，挑战【"+guild_city[cityId]["name"]+"】时获得了参与奖励",guild_city[cityId]["play"])
					uidMap[atkList[i]["uid"]] = 1
				}
				//排名奖励
				self.zrange(main_name,-3,-1,function(list) {
					var rank = 0
					for(var i = list.length - 1;i >= 0;i--){
						rank++
						self.sendMail(list[i],"远古遗迹排名奖励","您参与本次宗族活动【远古遗迹】，挑战【"+guild_city[cityId]["name"]+"】时获得了获得了伤害第"+rank+"名，获得了排名奖励",guild_city[cityId]["damage_"+rank])
					}
				})
				next()
			},
			function(next) {
				//占领城池
				console.log("winGuildId",winGuildId)
				if(winGuildId){
					self.addGuildGift(winGuildId,"【"+guild_city[cityId]["name"]+"】成功占领",guild_city[cityId]["gift"],10,oneDayTime)
					self.delAreaObj(main_name+":holdCitys:"+winGuildId,cityId)
					self.setAreaObj(main_name+":holdCitys:"+winGuildId,cityId,1)
					self.setAreaObj(main_name+":cityLord",cityId,winGuildId)
				}
			}
		],function(err) {
			cb(false,err)
		})
	}
	//离开宗族后撤销派遣
	this.cancelGuildCityAllTeam = function(guildId,uid) {
		//检测队伍是否已派遣
		var arr = []
		for(var i in teamNumLv)
			arr.push(uid+"_"+i)
		self.getAreaHMObj(main_name+":sends",arr,function(data) {
			for(var i = 0;i < data.length;i++){
				if(data[i]){
					self.delAreaObj(main_name+":sends",uid+"_"+i)
					self.delAreaObj(main_name+":city:"+data[i],guildId+"_"+uid+"_"+i)
				}
			}
		})
	}
}