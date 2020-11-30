//宗族
const guild_cfg = require("../../../../config/gameCfg/guild_cfg.json")
const guild_lv = require("../../../../config/gameCfg/guild_lv.json")
const guild_sign = require("../../../../config/gameCfg/guild_sign.json")
const guild_skill = require("../../../../config/gameCfg/guild_skill.json")
const async = require("async")
const uuid = require("uuid")
const main_name= "guild"
const oneDayTime = 86400000
const max_num = 20
const maxRecordNum = 20
const num_att = {"lv":1,"exp":1,"num":1,"id":1,"lead":1,"deputy":1,"audit":1,"lv_limit":1,"dayCtb":1}
const currency = guild_cfg["currency"]["value"]
module.exports = function() {
	var self = this
	var contributions = {}		//宗族玩家贡献列表
	var guildList = {}			//宗族信息列表
	var guideCooling = {}		//加入冷却
	var applyList = {}			//申请列表
	var applyMap = {}			//申请映射
	var giftInfoList = {}		//宗族红包
	//初始化
	this.initGuild = function() {
		self.getAreaObjAll(main_name,function(data) {
			if(data){
				for(var guildId in data){
					self.initGuildSingle(guildId)
				}
			}
		})
	}
	//玩家每日更新
	this.guildRefresh = function(uid) {
		self.delObj(uid,main_name,"sign")
		self.delObj(uid,"guild_fb","count")
		self.delObj(uid,"guild_fb","buy")
		self.delObj(uid,"guild_treasure","play")
		self.delObj(uid,"guild_city","dayAward")
	}
	//宗族每日更新
	this.guildDayUpdate = function() {
		for(var guildId in guildList){
			self.guildCheckGift(guildId)
		}
		//定时到六点发放红包
		var d1 = new Date()
		d1.setHours(18,0,0,0)
		var dt = d1.getTime() - Date.now()
		if(dt < 10000)
			dt = 10000
		self.setTimeout(self.guildGiveGift,dt)
	}
	//宗族每日首次更新
	this.guildFirstUpdate = function(argument) {
		self.getAreaObjAll(main_name,function(data) {
			// console.log("guildFirstUpdate",data)
			if(data){
				for(var guildId in data){
					self.setGuildInfo(guildId,"dayCtb",0)
				}
			}
		})
	}
	//宗族红包定时发放
	this.guildGiveGift = function() {
		// console.log("宗族红包定时发放")
		var curDayStr = (new Date()).toDateString()
		var arr = []
		for(var guildId in guildList){
			arr.push(guildId)
		}
		if(arr.length){
			self.redisDao.db.hmget("guild:guildGiftState",arr,function(err,list) {
				for(var i = 0;i < list.length;i++){
					var str = list[i]
					var guildId = arr[i]
					if(!str || str !== curDayStr){
						var lv = guildList[guildId]["lv"]
						var ctb = guildList[guildId]["dayCtb"]
						self.redisDao.db.hset("guild:guildGiftState",guildId,curDayStr)
						if(ctb){
							var index = 0
							for(var j = 1;j <= 3;j++){
								if(ctb >= guild_lv[lv]["ctb_"+j])
									index = j
								else
									break
							}
							self.addGuildGift(guildId,"每日红包",guild_lv[lv]["member"],guild_lv[lv]["gift_"+index],oneDayTime)
						}
					}
				}
			})
		}
	}
	this.guildCheckGift = function(guildId) {
		self.redisDao.db.hgetall("guild:giftmap:"+guildId,function(err,data) {
			for(var giftId in data){
				data[giftId] = Number(data[giftId])
				if(data[giftId] < Date.now())
					self.removeGuildGift(guildId,giftId)
			}
		})
	}
	//初始化宗族
	this.initGuildSingle = function(guildId) {
		self.redisDao.db.hgetall("guild:guildInfo:"+guildId,function(err,data) {
			for(var i in num_att){
				data[i] = Number(data[i])
			}
			guildList[guildId] = data
			self.redisDao.db.hgetall("guild:contributions:"+guildId,function(err,data) {
				for(var i in data){
					data[i] = Number(data[i])
				}
				contributions[guildId] = data || {}
			})
		})
	}
	//设置宗族属性
	this.setGuildInfo = function(guildId,key,value) {
		if(guildList[guildId]){
			guildList[guildId][key] = value
			self.redisDao.db.hset("guild:guildInfo:"+guildId,key,value)
		}
	}
	//增长宗族属性
	this.incrbyGuildInfo = function(guildId,key,value) {
		if(guildList[guildId]){
			if(!guildList[guildId][key])
				guildList[guildId][key] = 0
			guildList[guildId][key] += value
			self.redisDao.db.hincrby("guild:guildInfo:"+guildId,key,value)
		}
	}
	//增长玩家总贡献度
	this.incrbyContributions = function(guildId,uid,value) {
		if(contributions[guildId]){
			if(!contributions[guildId][uid])
				contributions[guildId][uid] = 0
			contributions[guildId][uid] += value
			self.redisDao.db.hincrby("guild:contributions:"+guildId,uid,value)
		}
	}
	//获取我的宗族信息
	this.getMyGuild = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(guildId && guildList[guildId]){
			self.getHMObj(uid,main_name,["sign","skill_1","skill_2","skill_3","skill_4"],function(data) {
				var info = Object.assign(guildList[guildId])
				info.sign = data[0]
				info.skill_1 = Number(data[1]) || 0
				info.skill_2 = Number(data[2]) || 0
				info.skill_3 = Number(data[3]) || 0
				info.skill_4 = Number(data[4]) || 0
				info.score = contributions[guildId][uid]
				self.getPlayerInfoByUids([info.lead],function(data) {
					info.leadInfo = data[0]
					cb(true,info)
				})
			})
		}else{
			cb(true,{})
		}
	}
	//获取宗族成员
	this.getMyGuildUsers = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(guildId){
			var uids = []
			var scores = []
			for(var i in contributions[guildId]){
				uids.push(i)
				scores.push(contributions[guildId][i])
			}
			self.getPlayerBaseByUids(uids,function(userInfos) {
				userInfos = userInfos
				for(var i = 0;i < userInfos.length;i++){
					if(self.players[userInfos[i]["uid"]]){
						userInfos[i].online = true
					}
					userInfos[i].score = scores[i]
				}
				cb(true,userInfos)
			})
		}else{
			cb(false,"未加入宗族")
		}
	}
	//创建宗族
	this.createGuild = function(uid,name,audit,lv_limit,cb) {
		audit = audit == 1 ? 1 : 0
		if(!Number.isInteger(lv_limit) || lv_limit < 0 || lv_limit > 255)
			lv_limit = 0
		async.waterfall([
			function(next) {
				//判断自身是否存在宗族
				if(self.players[uid]["gid"])
					next("已加入宗族")
				else
					next()
			},
			function(next) {
				self.getObj(uid,main_name,"cd",function(cd) {
					cd = Number(cd) || 0
					var curTime = Date.now()
					if(cd > curTime){
						next("退出宗族冷却中,"+Math.ceil((cd - curTime)/60000)+"分钟后可创建")
						return
					}
					next()
				})
			},
			function(next) {
				//名字检测
				if(typeof(name) != "string" || name.length >= 12 || name.length < 2){
					next("name error "+name)
					return
				}
				self.redisDao.db.hexists("guild:guildNameMap",name,function(err,data) {
					if(data != 0)
						next("宗族名称不可用")
					else
						next()
				})
			},
			function(next) {
				//扣除金额
				self.consumeItems(uid,guild_cfg["create"]["value"],1,"创建宗族",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				for(var i in applyMap[uid]){
					delete applyList[i][uid]
				}
				delete applyMap[uid]
				self.redisDao.db.incrby("guild:lastid",1,function(err,guildId) {
					//创建宗族
					var guildInfo = {
						lv : 1,
						exp : 0,
						id : guildId,
						name : name,
						lead : uid,
						dayCtb : 0,
						deputy : 0,
						num : 1,
						audit : audit,
						lv_limit : lv_limit,
						notify: ""
					}
					guildList[guildId] = guildInfo
					contributions[guildId] = {}
					contributions[guildId][uid] = 0
					self.chageLordData(uid,"gid",guildId)
					self.chageLordData(uid,"gname",name)
					self.setAreaObj(main_name,guildId,name)
					self.redisDao.db.hset("guild:guildNameMap",name,guildId)
					self.redisDao.db.hmset("guild:guildInfo:"+guildId,guildList[guildId])
					self.redisDao.db.hmset("guild:contributions:"+guildId,contributions[guildId])
					self.addGuildLog(guildId,{type:"create"})
					self.getPlayerInfoByUids([uid],function(userInfos) {
						guildInfo.leadInfo = userInfos[0]
						cb(true,guildInfo)
					})
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//设置审核状态
	this.setGuildAudit = function(uid,audit,lv_limit,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || (guildList[guildId]["lead"] != uid  && guildList[guildId]["deputy"] != uid)){
			cb(false,"没有权限")
			return
		}
		if(audit !== 1)
			audit = 0
		if(!Number.isInteger(lv_limit) || lv_limit < 0){
			cb(false,"lv_limit error")
			return
		}
		this.setGuildInfo(guildId,"audit",audit)
		this.setGuildInfo(guildId,"lv_limit",lv_limit)
		cb(true)
	}
	//解散宗族
	this.dissolveGuild = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是宗族族长")
			return
		}
		for(var targetUid in contributions[guildId]){
			self.leaveGuild(guildId,targetUid)
		}
		self.redisDao.db.hdel("guild:guildNameMap",guildList[guildId]["name"],guildId)
		self.delAreaObj(main_name,guildId)
		self.redisDao.db.del("guild:log:"+guildId)
		self.redisDao.db.zrem("area:area"+self.areaId+":zset:guild",guildId)
		delete guildList[guildId]
		self.redisDao.db.del("guild:guildInfo:"+guildId)
		self.redisDao.db.hgetall("guild:giftmap:"+guildId,function(err,map) {
			for(var giftId in map)
				self.removeGuildGift(guildId,giftId)
			self.redisDao.db.del("guild:giftmap:"+guildId)
		})
		self.removeGuildFBdata(guildId)
		self.redisDao.db.del("guild_treasure:play:"+guildId)
		self.redisDao.db.del("guild_treasure:"+guildId)
		self.delAreaObj("guild_city:apply",guildId)
		self.releaseGuildCity(guildId)
		cb(true)
	}
	//设置成副族长
	this.setGuildDeputy = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		targetUid = Number(targetUid)
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是宗族族长")
			return
		}
		if(guildList[guildId]["deputy"]){
			cb(false,"宗族已有副族长")
			return
		}
		if(contributions[guildId][targetUid] == undefined){
			cb(false,"玩家不存在")
			return
		}
		self.getPlayerKeyByUid(targetUid,"name",function(name) {
			self.addGuildLog(guildId,{type:"deputy",uid:targetUid,name:name})
		})
		self.sendMail(targetUid,"成为副族长","您已被任命为【"+guildList[guildId]["name"]+"】的副族长")
		self.setGuildInfo(guildId,"deputy",targetUid)
		cb(true)
	}
	//设置成普通成员
	this.setGuildNormal = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		targetUid = Number(targetUid)
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是宗族族长")
			return
		}
		if(guildList[guildId]["deputy"] != targetUid){
			cb(false,"目标不是副族长")
			return
		}
		if(contributions[guildId][targetUid] == undefined){
			cb(false,"玩家不存在")
			return
		}
		self.sendMail(targetUid,"卸任副族长","您已不是【"+guildList[guildId]["name"]+"】的副族长")
		self.setGuildInfo(guildId,"deputy",0)
		cb(true)
	}
	//设置成族长
	this.setGuildLead = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		targetUid = Number(targetUid)
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是宗族族长")
			return
		}
		if(guildList[guildId]["deputy"] == targetUid || guildList[guildId]["lead"] == targetUid){
			cb(false,"目标有职务在身")
			return
		}
		if(contributions[guildId][targetUid] == undefined){
			cb(false,"玩家不存在")
			return
		}
		self.getPlayerKeyByUid(targetUid,"name",function(name) {
			self.addGuildLog(guildId,{type:"lead",uid:targetUid,name:name})
		})
		self.sendMail(targetUid,"成为族长","您已被任命为【"+guildList[guildId]["name"]+"】的族长")
		self.setGuildInfo(guildId,"lead",targetUid)
		cb(true)
	}
	//设置公告
	this.setGuildNotify = function(uid,notify,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || (guildList[guildId]["lead"] != uid  && guildList[guildId]["deputy"] != uid)){
			cb(false,"没有权限")
			return
		}
		if(typeof(notify) != "string" || notify.length > 256){
			cb(false,"notify error")
			return
		}
		self.setGuildInfo(guildId,"notify",notify)
		cb(true)
	}
	//请离玩家
	this.kickGuildNormal = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || (guildList[guildId]["lead"] != uid  && guildList[guildId]["deputy"] != uid)){
			cb(false,"没有权限")
			return
		}
		if((guildList[guildId]["lead"] == targetUid  || guildList[guildId]["deputy"] == targetUid)){
			cb(false,"目标有职务在身")
			return
		}
		if(contributions[guildId][targetUid] == undefined){
			cb(false,"玩家不存在")
			return
		}
		self.leaveGuild(guildId,targetUid,cb)
	}
	//获取宗族列表
	this.getGuildList = function(uid,cb) {
		var info = {
			applys : applyMap[uid],
			guildList : guildList,
			leadInfos : {}
		}
		var uids = []
		for(var guildId in guildList){
			uids.push(guildList[guildId]["lead"])
		}
		self.getPlayerInfoByUids(uids,function(userInfos) {
			info.leadInfos = userInfos
			cb(true,info)
		})
	}
	//获取宗族
	this.getGuildInfo = function(guildId) {
		return guildList[guildId]
	}
	//获取宗族名称
	this.getGuildName = function(guildId) {
		if(guildList[guildId])
			return guildList[guildId]["name"]
		else
			return ""
	}
	//获取宗族列表
	this.getGuildInfoList = function() {
		return guildList
	}
	//申请加入宗族
	this.applyJoinGuild = function(uid,guildId,cb) {
		if(self.players[uid]["gid"]){
			cb(false,"已加入宗族")
			return
		}
		if(!guildList[guildId]){
			cb(false,"宗族不存在")
			return
		}
		if(self.getLordLv(uid) < guildList[guildId]["lv_limit"]){
			cb(false,"该宗族需要"+guildList[guildId]["lv_limit"]+"级可加入")
			return
		}
		var lv = guildList[guildId]["lv"]
		if(guildList[guildId]["num"] >= guild_lv[lv]["member"]){
			cb(false,"宗族已满员")
			return
		}
		self.getObj(uid,main_name,"cd",function(cd) {
			cd = Number(cd) || 0
			var curTime = Date.now()
			if(cd > curTime){
				cb(false,"退出宗族冷却中,"+Math.ceil((cd - curTime)/60000)+"分钟后可申请")
				return
			}
			if(!applyList[guildId])
				applyList[guildId] = {}
			applyList[guildId][uid] = self.getBaseUser(uid)
			if(!applyMap[uid])
				applyMap[uid] = {}
			applyMap[uid][guildId] = Date.now()
			if(!guildList[guildId]["audit"]){
				self.joinGuild(uid,guildId,cb)
			}else{
				cb(true,applyMap[uid])
			}
		})
	}
	//获得申请列表
	this.getGuildApplyList = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || (guildList[guildId]["lead"] != uid  && guildList[guildId]["deputy"] != uid)){
			cb(false,"没有权限")
			return
		}
		cb(true,applyList[guildId])
	}
	//同意申请
	this.agreeGuildApply = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || (guildList[guildId]["lead"] != uid  && guildList[guildId]["deputy"] != uid)){
			cb(false,"没有权限")
			return
		}
		if(!applyList[guildId][targetUid]){
			cb(false,"不存在该玩家申请")
			return
		}
		this.joinGuild(targetUid,guildId,cb)
	}
	//拒绝申请
	this.refuseGuildApply = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || (guildList[guildId]["lead"] != uid  && guildList[guildId]["deputy"] != uid)){
			cb(false,"没有权限")
			return
		}
		if(!applyList[guildId][targetUid]){
			cb(false,"不存在该玩家申请")
			return
		}
		delete applyList[guildId][targetUid]
		delete applyMap[targetUid][guildId]
		cb(true)
	}
	//退出宗族
	this.quitGuild = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		if(guildList[guildId]["lead"] == uid){
			cb(false,"族长不能退出宗族")
			return
		}
		self.leaveGuild(guildId,uid,cb)
	}
	//玩家加入
	this.joinGuild = function(uid,guildId,cb) {
		var lv = guildList[guildId]["lv"]
		var gname = guildList[guildId]["name"]
		if(guildList[guildId]["num"] >= guild_lv[lv]["member"]){
			cb(false,"宗族已满员")
			return
		}
		self.getPlayerKeyByUid(uid,"gid",function(gid) {
			if(gid){
				delete applyList[guildId][uid]
				cb(false,"该玩家已加入其他宗族")
				return
			}
			self.chageLordData(uid,"gid",guildId)
			self.chageLordData(uid,"gname",gname)
			self.incrbyGuildInfo(guildId,"num",1)
			contributions[guildId][uid] = 0
			self.redisDao.db.hset("guild:contributions:"+guildId,uid,0)
			self.sendMail(uid,"加入宗族","您已成功加入【"+gname+"】")
			self.addGuildLog(guildId,{type:"join",uid:uid,name:applyList[guildId][uid]["name"]})
			self.sendToGuild(guildId,{type:"joinGuild",guildId:guildId,userName:applyList[guildId][uid]["name"],uid:uid,name:gname})
			for(var i in applyMap[uid]){
				delete applyList[i][uid]
			}
			delete applyMap[uid]
			cb(true)
		})
	}
	//玩家离开
	this.leaveGuild = function(guildId,uid,cb) {
		if(guildList[guildId]["deputy"] == uid)
			self.setGuildInfo(guildId,"deputy",0)
		self.delLordData(uid,"gid")
		self.delLordData(uid,"gname")
		self.incrbyGuildInfo(guildId,"num",-1)
		delete contributions[guildId][uid]
		self.redisDao.db.hdel("guild:contributions:"+guildId,uid)
		self.getPlayerKeyByUid(uid,"name",function(name) {
			self.addGuildLog(guildId,{type:"quit",uid:uid,name:name})
		})
		self.setObj(uid,main_name,"cd",Date.now()+86400000)
		self.sendMail(uid,"退出宗族","您已离开【"+guildList[guildId]["name"]+"】")
		self.sendToUser(uid,{type:"leaveGuild",guildId : guildId,name:guildList[guildId]["name"]})
		self.cancelGuildCityAllTeam(guildId,uid)
		self.cancelGuildPKAllTeam(guildId,uid)
		if(cb)
			cb(true)
	}
	//添加日志
	this.addGuildLog = function(guildId,info) {
		info.time = Date.now()
		self.redisDao.db.rpush("guild:log:"+guildId,JSON.stringify(info),function(err,num) {
			if(num > maxRecordNum){
				self.redisDao.db.ltrim("guild:log:"+guildId,-maxRecordNum,-1)
			}
		})
	}
	//获取宗族日志
	this.getGuildLog = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		self.redisDao.db.lrange("guild:log:"+guildId,0,-1,function(err,list) {
			if(err || !list){
				cb(true,[])
			}else{
				cb(true,list)
			}
		})
	}
	//宗族经验增加
	this.addGuildEXP = function(guildId,value) {
		if(guildList[guildId]){
			self.incrbyZset(main_name,guildId,value)
			self.incrbyGuildInfo(guildId,"exp",value)
			self.checkGuildUpgrade(guildId)
		}
	}
	//获取宗族排行榜
	this.getGuildRank = function(uid,cb) {
		self.zrangewithscore(main_name,-10,-1,function(list) {
			var guilds = []
			var scores = []
			var uids = []
			var info = {}
			for(var i = 0;i < list.length;i += 2){
				uids.push(guildList[list[i]]["lead"])
				guilds.push(guildList[list[i]])
				scores.push(list[i+1])
			}
			info.guilds = guilds
			info.scores = scores
			self.getPlayerInfoByUids(uids,function(data) {
				info.leadInfo = data
				cb(true,info)
			})
		})
	}
	//宗族升级检查
	this.checkGuildUpgrade = function(guildId) {
		if(guildList[guildId]){
			var lv = guildList[guildId]["lv"]
			var exp = guildList[guildId]["exp"]
			if(guild_lv[lv]["exp"] && guild_lv[lv+1]){
				if(exp >= guild_lv[lv]["exp"]){
					self.incrbyGuildInfo(guildId,"exp",-guild_lv[lv]["exp"])
					self.incrbyGuildInfo(guildId,"lv",1)
					lv++
					self.addGuildLog(guildId,{type:"upgrade",lv:lv,exp:guild_lv[lv]["exp"]})
					self.addGuildGift(guildId,"宗族升级红包",guild_lv[lv]["member"],guild_lv[lv]["gift_up"],oneDayTime)
					self.sendToGuild(guildId,{type:"guildUpgrade",lv:lv})
					this.checkGuildUpgrade(guildId)
				}
			}
		}
	}
	//增加帮贡
	this.addGuildScore = function(uid,guildId,value,reason) {
		if(guildList[guildId]){
			if(contributions[guildId] && contributions[guildId][uid] !== undefined){
				contributions[guildId][uid] += value
				self.redisDao.db.hincrby("guild:contributions:"+guildId,uid,value)
			}
			self.incrbyGuildInfo(guildId,"dayCtb",value)

		}
		var awardList = self.addItemStr(uid,currency+":"+value,1,reason || "宗族活动")
		return awardList
	}
	//签到
	this.signInGuild = function(uid,sign,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		if(!guild_sign[sign]){
			cb(false,"sign error")
			return
		}
		self.getObj(uid,main_name,"sign",function(data) {
			if(data){
				cb(false,"今日已签到")
				return
			}
			self.consumeItems(uid,guild_sign[sign]["pc"],1,"宗族签到",function(flag,err) {
				if(flag){
					self.setObj(uid,main_name,"sign",1)
					var awardList = self.addGuildScore(uid,guildId,guild_sign[sign]["score"],"签到")
					self.addGuildEXP(guildId,guild_sign[sign]["exp"])
					cb(true,awardList)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//升级宗族技能
	this.upGuildSkill = function(uid,career,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		if(!guild_cfg["career_"+career]){
			cb(false,"career error")
			return
		}
		if(guildList[guildId]){
			var guildLv = guildList[guildId].lv
			self.getObj(uid,main_name,"skill_"+career,function(lv) {
				lv = Number(lv) || 0
				lv += 1
				if(!guild_skill[lv]){
					cb(false,"已升满")
					return
				}
				if(lv > guild_lv[guildLv]["skill"]){
					cb(false,"宗族等级不足")
					return
				}
				self.consumeItems(uid,guild_skill[lv]["pc"],1,"升级宗族技能",function(flag,err) {
					if(flag){
						self.incrbyGuildCareerSkill(uid,career)
						cb(true,lv)
					}else{
						cb(false,err)
					}
				})
			})
		}
	}
	//宗族通知
	this.sendToGuild = function(guildId,notify) {
		for(var uid in contributions[guildId]){
			if(this.connectorMap[uid]){
				this.channelService.pushMessageByUids('onMessage', notify, [{
			      uid: uid,
			      sid: this.connectorMap[uid]
			    }])
			}
		}
	}
	//添加宗族红包
	this.addGuildGift = function(guildId,title,maxNum,amount,time) {
		// console.log("addGuildGift",guildId,title,maxNum,amount,time)
		var giftInfo = {
			id : uuid.v1(),
			guildId : guildId,
			title : title,
			maxNum : maxNum,
			curNum : 0,
			amount : amount,
			time : Date.now() + time
		}
		var list = []
		var weights = []
		var allWeight = 0
		for(var i = 0;i < maxNum;i++){
			var weight = Math.ceil(Math.random() * 100 + 10)
			if(Math.random() < 0.15)
				weight += 100
			allWeight += weight
			weights.push(weight)
		}
		var curNum = 0
		for(var i = 0;i < maxNum - 1;i++){
			var value = Math.round((weights[i] / allWeight) * amount)
			curNum += value
			list.push(value)
		}
		list.push(amount - curNum)
		for(var i = 0;i < maxNum;i++){
			giftInfo["user_"+i] = ""
			giftInfo["amount_"+i] = list[i]
		}
		self.redisDao.db.hset("guild:giftmap:"+guildId,giftInfo.id,giftInfo.time)
		self.redisDao.db.hmset("guild:giftinfo:"+giftInfo.id,giftInfo)
		self.sendToGuild(guildId,{type:"guildGift",giftInfo:[giftInfo.id,giftInfo.title,giftInfo.maxNum,giftInfo.curNum,giftInfo.time]})
	}
	//删除宗族红包
	this.removeGuildGift = function(guildId,giftId) {
		self.redisDao.db.hdel("guild:giftmap:"+guildId,giftId)
		self.redisDao.db.del("guild:giftinfo:"+giftId)
	}
	//获取宗族红包列表
	this.getGuildGiftList = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		self.redisDao.db.hgetall("guild:giftmap:"+guildId,function(err,map) {
			var multiList = []
			for(var id in map){
				multiList.push(["hmget","guild:giftinfo:"+id,["id","title","maxNum","curNum","time","uid_"+uid]])
			}
			if(multiList.length == 0){
				cb(true,[])
				return
			}
			self.redisDao.multi(multiList,function(err,list) {
				cb(true,list)
			})
		})
	}
	//获取红包详情
	this.getGuildGiftDetails = function(uid,giftId,cb) {
		self.redisDao.db.hgetall("guild:giftinfo:"+giftId,function(err,giftinfo) {
			cb(true,giftinfo)
		})
	}
	//领取宗族红包
	this.gainGuildGift = function(uid,giftId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		self.redisDao.db.hgetall("guild:giftinfo:"+giftId,function(err,giftInfo) {
			if(giftInfo["uid_"+uid] !== undefined){
				cb(false,"已领取")
				return
			}
			if(giftInfo.guildId != guildId){
				cb(false,"红包不存在")
				return
			}
			giftInfo.time = Number(giftInfo.time)
			if(Date.now() >= giftInfo.time){
				cb(false,"红包已过期")
				return
			}
			giftInfo.maxNum = Number(giftInfo.maxNum)
			giftInfo.curNum = Number(giftInfo.curNum)
			if(giftInfo.curNum >= giftInfo.maxNum){
				cb(false,"红包已领完")
				return
			}
			self.redisDao.db.hincrby("guild:giftinfo:"+giftId,"curNum",1,function(err,num) {
				if(num > giftInfo.maxNum){
					self.redisDao.db.hincrby("guild:giftinfo:"+giftId,"curNum",-1)
					cb(false,"红包已领完")
					return
				}
				giftInfo.curNum++
				num = Number(num) - 1
				self.redisDao.db.hset("guild:giftinfo:"+giftId,"uid_"+uid,giftInfo["amount_"+num])
				var info = self.getSimpleUser(uid)
				info.time = Date.now()
				giftInfo["user_"+num] = JSON.stringify(info)
				self.redisDao.db.hset("guild:giftinfo:"+giftId,"user_"+num,giftInfo["user_"+num])
				var awardList = self.addItemStr(uid,currency+":"+giftInfo["amount_"+num],1,"宗族红包")
				cb(true,{giftInfo : giftInfo,awardList : awardList})
			})
		})
	}
}