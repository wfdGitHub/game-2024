const main_name = "cross:guild_pk"
const async = require("async")
const guild_pk = require("../../../../config/gameCfg/guild_pk.json")
const guild_lv = require("../../../../config/gameCfg/guild_lv.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const openTime = {"3":1,"0":1}   //开启时间
const fightTime = 5 //战斗开始时间
const star_add = {
	"1" : {amplify : -0.3,reduction : -0.3},
	"2" : {amplify : -0.1,reduction : -0.1,self_maxHP_add : 0.3},
	"3" : {amplify : 0.15,reduction : 0.15,self_maxHP_add : 0.3}
}
//跨服同盟战
module.exports = function() {
	var self = this
	var pk_info = {}
	//每日首次刷新
	this.guildPKDayUpdate = function() {
		console.log("guildPKDayUpdate!!!")
		var day = (new Date()).getDay()
		self.redisDao.db.hgetall(main_name,function(err,data) {
			if(data && data.guildList){
				pk_info = data
				pk_info.guildList = JSON.parse(data.guildList)
				pk_info.guildInfos = JSON.parse(data.guildInfos)
				pk_info.parMap = JSON.parse(data.parMap)
				pk_info.table = JSON.parse(data.table)
				pk_info.open = Number(pk_info.open)
			}else{
				data = {}
			}
			if(data.dayStr != (new Date()).toDateString()){
				if(pk_info.open){
					//PK结算
					self.guildPkSettle()
				}else if(openTime[day]){
					//判断开启
					self.matchGuildPKRival()
				}
			}
		})
	}
	//匹配同盟
	this.matchGuildPKRival = function() {
		console.log("匹配同盟")
		async.waterfall([
			function(next) {
				//旧数据清理
				if(pk_info.guildList){
					for(var i = 0;i < pk_info.guildList.length;i++){
						self.redisDao.db.del(main_name+":"+pk_info.guildList[i])
						self.redisDao.db.del(main_name+":star:"+pk_info.guildList[i])
						self.redisDao.db.del(main_name+":team:"+pk_info.guildList[i])
						self.redisDao.db.del(main_name+":atkRank:"+pk_info.guildList[i])
						self.redisDao.db.del(main_name+":defRank:"+pk_info.guildList[i])
						self.redisDao.db.del(main_name+":userInfo:"+pk_info.guildList[i])
						for(var j = 0;j < 10;j++)
							self.redisDao.db.del(main_name+":record:"+pk_info.guildList[i]+":"+j)
					}
				}
				pk_info = {}
				self.redisDao.db.del(main_name)
				self.redisDao.db.del(main_name+":play")
				pk_info.dayStr = (new Date()).toDateString()
				self.redisDao.db.hset(main_name,"dayStr",pk_info.dayStr)
				next()
			},
			function(next) {
				//获取报名同盟
				self.redisDao.db.hgetall("guild_pk:apply",function(err,list) {
					var arr = []
					for(var guildId in list){
						arr.push(guildId)
					}
					if(arr.length > 1){
						pk_info.guildList = arr
						self.redisDao.db.hset(main_name,"guildList",JSON.stringify(pk_info.guildList))
						pk_info.open = 1
						self.redisDao.db.hset(main_name,"open",pk_info.open)
						next()
					}else{
						pk_info.open = 0
						self.redisDao.db.hset(main_name,"open",pk_info.open)
					}
				})
			},
			function(next) {
				//获取同盟信息
				var multiList = []
				for(var i = 0;i < pk_info.guildList.length;i++){
					multiList.push(["hgetall","guild:guildInfo:"+pk_info.guildList[i]])
				}
				self.redisDao.multi(multiList,function(err,list) {
					pk_info.guildInfos = {}
					for(var i = 0;i < list.length;i++){
						list[i]["exp"] = guild_lv[list[i]["lv"]]["exp"] + Number(list[i]["exp"])
						//随机波动
						list[i]["exp"] += Math.floor(list[i]["exp"] * Math.random() * 0.1)
						
					}
					//排序
					list.sort(function(a,b) {
						return a.exp < b.exp ? 1 : -1
					})
					if(list.length % 2 == 1){
						list.pop()
					}
					pk_info.parMap = {}
					pk_info.table = {}
					var tableIndex = 1
					for(var i = 0;i < list.length;i += 2){
						if(list[i+1]){
							//存在目标
							pk_info.parMap[list[i]["id"]] = list[i+1]["id"]
							pk_info.parMap[list[i+1]["id"]] = list[i]["id"]
							pk_info.table[tableIndex] = [list[i]["id"],list[i+1]["id"]]
						}
						tableIndex++
					}
					self.redisDao.db.hset(main_name,"parMap",JSON.stringify(pk_info.parMap))
					self.redisDao.db.hset(main_name,"table",JSON.stringify(pk_info.table))
					for(var i = 0;i < list.length;i++){
						pk_info.guildInfos[list[i]["id"]] = list[i]
						self.redisDao.db.hset(main_name,"guildInfos",JSON.stringify(pk_info.guildInfos))
						self.initGuildPKFight(list[i]["id"])
					}
				})
			}
		],function(err) {
			console.error(err)
		})
	}
	//初始化同盟出战列表
	this.initGuildPKFight = function(guildId) {
		self.redisDao.db.hset(main_name+":star:"+guildId,"total",0)
		self.redisDao.db.hgetall("guild:contributions:"+guildId,function(err,data) {
			if(!data)
				data = {}
			var multiList = []
			var guildUsers = []
			for(uid in data){
				guildUsers.push({uid : uid})
				multiList.push(["hgetall","player:user:"+uid+":playerInfo"])
			}
			self.redisDao.multi(multiList,function(err,list) {
				for(var i = 0;i < guildUsers.length;i++){
					guildUsers[i]["uid"] = list[i]["uid"]
					guildUsers[i]["name"] = list[i]["name"]
					guildUsers[i]["head"] = list[i]["head"]
					guildUsers[i]["figure"] = list[i]["figure"]
					guildUsers[i]["level"] = list[i]["level"]
					guildUsers[i]["CE"] = Number(list[i]["CE"])
				}
				guildUsers.sort(function(a,b) {
					return a["CE"] < b["CE"] ? 1 : -1
				})
				for(var i = 0;i < 10;i++){
					self.initGuildPKUser(guildId,guildUsers[i],i)
				}
			})
		})
	}
	//初始化同盟出战玩家
	this.initGuildPKUser = function(guildId,userInfo,index) {
		self.redisDao.db.hset(main_name+":star:"+guildId,index,0)
		if(userInfo){
			delete userInfo["CE"]
			//玩家存在
			self.getDefendTeam(userInfo.uid,function(team) {
				self.redisDao.db.hset(main_name+":"+guildId,"seat_"+index,JSON.stringify(userInfo))
				self.redisDao.db.hset(main_name+":team:"+guildId,index,JSON.stringify(team))
			})
		}else{
			//填充机器人
			var guildLv = pk_info.guildInfos[guildId]["lv"]
			userInfo = {
				uid : 0,
				name : "精锐战士",
				head : default_cfg["first_hero"]["value"],
				figure : default_cfg["first_hero"]["value"],
				level : guild_lv[guildLv]["level"]
			}
			self.redisDao.db.hset(main_name+":"+guildId,"seat_"+index,JSON.stringify(userInfo))
			var defTeam = self.fightContorl.getNPCTeamByType("guild_pk",guild_pk[guildLv]["npc_team"],userInfo.level)
			console.log(defTeam,guildLv,guild_pk[guildLv]["npc_team"],userInfo.level)
			self.redisDao.db.hset(main_name+":team:"+guildId,JSON.stringify(defTeam))
		}
	}
	//获取PK信息  双方阵容  排行榜   总星数
	this.getGuildPKInfo = function(crossUid,cb) {
		var uid = self.players[crossUid]["uid"]
		var sid = self.players[crossUid]["oriId"]
		var gid = self.players[crossUid]["playerInfo"]["gid"]
		if(!pk_info.guildInfos){
			cb(false,"玩法未开启")
			return
		}
		var targetGuildId = pk_info.parMap[gid]
		if(!targetGuildId || !pk_info.guildInfos[gid]){
			cb(false,"未参与该玩法")
			return
		}
		var info = {}
		info.open = pk_info.open
		info.myGuild = {info : pk_info.guildInfos[gid]}
		info.targetGuild = {info : pk_info.guildInfos[targetGuildId]}
		async.waterfall([
			function(next) {
				//获取挑战次数
				self.redisDao.db.hget(main_name+":play",crossUid,function(err,count) {
					info.count = Number(count) || 0
					next()
				})
			},
			function(next) {
				//获取我方出战信息
				var multiList = []
				for(var i = 0;i < 10;i++){
					multiList.push(["hget",main_name+":"+gid,"seat_"+i])
				}
				self.redisDao.multi(multiList,function(err,list) {
					info.myGuild.seats = list
					next()
				})
			},
			function(next) {
				//获取敌方出战信息
				var multiList = []
				for(var i = 0;i < 10;i++){
					multiList.push(["hget",main_name+":"+targetGuildId,"seat_"+i])
				}
				self.redisDao.multi(multiList,function(err,list) {
					info.targetGuild.seats = list
					next()
				})
			},
			function(next) {
				//获取我方星数
				self.redisDao.db.hgetall(main_name+":star:"+gid,function(err,list) {
					info.myGuild.stars = list
					next()
				})
			},
			function(next) {
				//获取敌方星数
				self.redisDao.db.hgetall(main_name+":star:"+targetGuildId,function(err,list) {
					info.targetGuild.stars = list
					next()
				})
			},
			function(next) {
				//获取我方排行榜
				self.redisDao.db.hgetall(main_name+":atkRank:"+gid,function(err,list) {
					info.myGuild.atkRank = list
					self.redisDao.db.hgetall(main_name+":defRank:"+gid,function(err,list) {
						info.myGuild.defRank = list
						next()
					})
				})
			},
			function(next) {
				//获取敌方排行榜
				self.redisDao.db.hgetall(main_name+":atkRank:"+targetGuildId,function(err,list) {
					info.targetGuild.atkRank = list
					self.redisDao.db.hgetall(main_name+":defRank:"+targetGuildId,function(err,list) {
						info.targetGuild.defRank = list
						next()
					})
				})
			},
			function(next) {
				//获取我方用户数据
				self.redisDao.db.hgetall(main_name+":userInfo:"+gid,function(err,list) {
					info.myGuild.userInfos = list
					next()
				})
			},
			function(next) {
				//获取敌方用户数据
				self.redisDao.db.hgetall(main_name+":userInfo:"+targetGuildId,function(err,list) {
					info.targetGuild.userInfos = list
					next()
				})
			},
			function(next) {
				//获取排行榜
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取挑战记录
	this.getGuildPKRecord = function(crossUid,guildId,index,cb) {
		var info = {}
		self.redisDao.db.hget(main_name+":team:"+guildId,index,function(err,defTeam) {
			if(!defTeam){
				cb(false,"玩家不存在")
			}else{
				info.defTeam = defTeam
				self.redisDao.db.lrange(main_name+":record:"+guildId+":"+index,0,-1,function(err,list) {
					info.list = list || []
					cb(true,info)
				})
			}
		})
	}
	//挑战对手
	this.challengeGuildPk = function(crossUid,index,star,cb){
		var uid = self.players[crossUid]["uid"]
		var name = self.players[crossUid]["playerInfo"]["name"]
		var head = self.players[crossUid]["playerInfo"]["head"]
		var figure = self.players[crossUid]["playerInfo"]["figure"]
		var sid = self.players[crossUid]["oriId"]
		var gid = self.players[crossUid]["playerInfo"]["gid"]
		if((new Date()).getHours() < fightTime){
			cb(false,fightTime+"点之后可以挑战")
			return
		}
		if(!Number.isInteger(index) || index < 0 || index > 9){
			cb(false,"index error "+index)
		}
		if(!pk_info.open || !pk_info.guildInfos){
			cb(false,"玩法未开启")
			return
		}
		var targetGuildId = pk_info.parMap[gid]
		if(!targetGuildId || !pk_info.guildInfos[gid]){
			cb(false,"未参与该玩法")
			return
		}
		var guildLv = pk_info.guildInfos[gid]["lv"]
		if(!star_add[star]){
			cb(false,"star error "+star)
			return
		}
		var fightInfo = {}
		fightInfo.star = star
		async.waterfall([
			function(next) {
				//获取对手信息
				fightInfo.atkInfo = {uid:uid,name:name,head:head,figure:figure}
				self.redisDao.db.hget(main_name+":"+targetGuildId,"seat_"+index,function(err,defInfo) {
					fightInfo.defInfo = JSON.parse(defInfo)
					next()
				})
			},
			function(next) {
				//获取对手星数
				self.redisDao.db.hget(main_name+":star:"+targetGuildId,index,function(err,curStar) {
					curStar = Number(curStar) || 0
					if(curStar >= 3 || curStar >= star){
						cb(false,"该星级已获胜")
						return
					}
					fightInfo.oldStar = curStar
					next()
				})
			},
			function(next) {
				//获取对手阵容
				self.redisDao.db.hget(main_name+":team:"+targetGuildId,index,function(err,defTeam) {
					if(!defTeam){
						cb(false,"玩家不存在")
					}else{
						fightInfo.atkTeam = self.userTeam(crossUid)
						fightInfo.defTeam = JSON.parse(defTeam)
						next()
					}
				})
			},
			function(next) {
				//获取挑战次数
				self.redisDao.db.hget(main_name+":play",crossUid,function(err,count) {
					count = Number(count) || 0
					if(count >= 2){
						cb(false,"挑战次数已满")
						return
					}
					self.redisDao.db.hincrby(main_name+":play",crossUid,1)
					next()
				})
			},
			function(next) {
				//挑战结算
				fightInfo.seededNum = Date.now()
				for(var i = 1;i < fightInfo.defTeam[i].length;i++){
					if(fightInfo.defTeam[i]){
						Object.assign(fightInfo.defTeam[i],star_add[star])
					}
				}
				fightInfo.winFlag = self.fightContorl.beginFight(fightInfo.atkTeam,fightInfo.defTeam,{seededNum : fightInfo.seededNum})
				self.redisDao.db.rpush(main_name+":record:"+targetGuildId+":"+index,JSON.stringify(fightInfo))
				//保存进攻方用户数据
				self.redisDao.db.hset(main_name+":userInfo:"+gid,fightInfo.atkInfo.uid,JSON.stringify(fightInfo.atkInfo))
				if(fightInfo.defInfo.uid){
					//保存进攻方用户数据
					self.redisDao.db.hset(main_name+":userInfo:"+targetGuildId,fightInfo.defInfo.uid,JSON.stringify(fightInfo.defInfo))
				}
				if(fightInfo.winFlag){
					self.redisDao.db.hincrby(main_name+":star:"+gid,"total",fightInfo.star - fightInfo.oldStar)
					self.redisDao.db.hincrby(main_name+":atkRank:"+gid,uid,fightInfo.star - fightInfo.oldStar)
					self.redisDao.db.hset(main_name+":star:"+targetGuildId,index,fightInfo.star)
					//发放奖励
					self.addItemStr(crossUid,guild_pk[guildLv]["star_"+star],1,"同盟PK",function(flag,awardList) {
						var info = {
							awardList : awardList,
							fightInfo : fightInfo
						}
						cb(true,info)
					})
				}else{
					if(fightInfo.defInfo.uid){
						self.redisDao.db.hincrby(main_name+":defRank:"+targetGuildId,fightInfo.defInfo.uid,1)
					}
					cb(true,{fightInfo:fightInfo})
				}
			},
		],function(err) {
			cb(false,err)
		})
	}
	//比赛结算
	this.guildPkSettle = function() {
		if(pk_info.open && pk_info.table){
			pk_info.open = 0
			self.redisDao.db.hset(main_name,"open",pk_info.open)
			for(var  i in pk_info.table){
				self.guildPkSettleSingle(pk_info.table[i][0],pk_info.table[i][1])
			}
		}
	}
	//单组同盟胜利判断
	this.guildPkSettleSingle = function(guildId1,guildId2) {
		var star1 = 0
		var star2 = 0
		var guildLv1 = pk_info.guildInfos[guildId1]["lv"]
		var guildLv2 = pk_info.guildInfos[guildId2]["lv"]
		self.redisDao.db.hget(main_name+":star:"+guildId1,"total",function(err,data) {
			star1 = Number(data) || 0
			self.redisDao.db.hget(main_name+":star:"+guildId2,"total",function(err,data) {
				star2 = Number(data) || 0
				if(star1 >= 30 || star1 > star2){
					//同盟1获胜
					self.sendMailByGuildId(guildId1,"guild_pk_win",guild_pk[guildLv1]["win_award"])
				}else{
					//同盟1失败
					self.sendMailByGuildId(guildId1,"guild_pk_lose",guild_pk[guildLv1]["lose_award"])
				}
				if(star2 >= 30 || star2 > star1){
					//同盟2获胜
					self.sendMailByGuildId(guildId2,"guild_pk_win",guild_pk[guildLv2]["win_award"])
				}else{
					//同盟2失败
					self.sendMailByGuildId(guildId2,"guild_pk_lose",guild_pk[guildLv2]["lose_award"])
				}
			})
		})
	}
}