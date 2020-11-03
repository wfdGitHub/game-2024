//公会
const guild_cfg = require("../../../../config/gameCfg/guild_cfg.json")
const guild_lv = require("../../../../config/gameCfg/guild_lv.json")
const guild_sign = require("../../../../config/gameCfg/guild_sign.json")
const guild_skill = require("../../../../config/gameCfg/guild_skill.json")
const async = require("async")
const uuid = require("uuid")
const main_name= "guild"
const max_num = 20
const maxRecordNum = 20
const num_att = {"lv":1,"exp":1,"num":1,"id":1,"lead":1,"deputy":1}
const currency = guild_cfg["currency"]["value"]
module.exports = function() {
	var self = this
	var contributions = {}		//公会玩家贡献列表
	var guildList = {}			//公会信息列表
	var guideCooling = {}		//加入冷却
	var applyList = {}			//申请列表
	var applyMap = {}			//申请映射
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
	}
	//初始化公会
	this.initGuildSingle = function(guildId) {
		console.log("initGuildSingle "+guildId)
		self.redisDao.db.hgetall("guild:guildInfo:"+guildId,function(err,data) {
			for(var i in num_att){
				data[i] = Number(data[i])
			}
			guildList[guildId] = data
		})
		self.redisDao.db.hgetall("guild:contributions:"+guildId,function(err,data) {
			for(var i in data){
				data[i] = Number(data[i])
			}
			contributions[guildId] = data
		})
	}
	//设置公会属性
	this.setGuildInfo = function(guildId,key,value) {
		if(guildList[guildId]){
			guildList[guildId][key] = value
			self.redisDao.db.hset("guild:guildInfo:"+guildId,key,value)
		}
	}
	//增长公会属性
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
	//获取我的公会信息
	this.getMyGuild = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(guildId){
			self.getHMObj(uid,main_name,["sign","skill_1","skill_2","skill_3","skill_4"],function(data) {
				var info = Object.assign(guildList[guildId])
				info.sign = data[0]
				info.skill_1 = Number(data[1]) || 0
				info.skill_2 = Number([2]) || 0
				info.skill_3 = Number([3]) || 0
				info.skill_4 = Number([4]) || 0
				info.score = contributions[guildId][uid]
				cb(true,info)
			})
		}else{
			cb(true,{})
		}
	}
	//获取公会成员
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
						userInfos[i].ce = self.getCE(userInfos[i]["uid"])
						userInfos[i].online = true
					}
					userInfos[i].score = scores[i]
				}
				cb(true,userInfos)
			})
		}else{
			cb(false,"未加入公会")
		}
	}
	//创建公会
	this.createGuild = function(uid,name,cb) {
		async.waterfall([
			function(next) {
				//判断自身是否存在公会
				if(self.players[uid]["gid"])
					next("已加入公会")
				else
					next()
			},
			function(next) {
				//名字检测
				if(typeof(name) != "string" || name.length >= 12 || name.length < 2){
					next("name error "+name)
					return
				}
				self.redisDao.db.hexists("guild:guildNameMap",name,function(err,data) {
					if(data != 0)
						next("公会名称已存在")
					else
						next()
				})
			},
			function(next) {
				//扣除金额
				self.consumeItems(uid,"202:10000",1,"创建公会",function(flag,err) {
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
					console.log("guildId",guildId)
					//创建公会
					var guildInfo = {
						lv : 1,
						exp : 0,
						id : guildId,
						name : name,
						lead : uid,
						deputy : 0,
						num : 1,
						notify: ""
					}
					guildList[guildId] = guildInfo
					contributions[guildId] = {}
					contributions[guildId][uid] = 0
					self.chageLordData(uid,"gid",guildId)
					self.setAreaObj(main_name,guildId,name)
					self.redisDao.db.hset("guild:guildNameMap",name,guildId)
					self.redisDao.db.hmset("guild:guildInfo:"+guildId,guildList[guildId])
					self.redisDao.db.hmset("guild:contributions:"+guildId,contributions[guildId])
					self.addGuildLog(guildId,{type:"create"})
					cb(true,guildInfo)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//解散公会
	this.dissolveGuild = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是公会会长")
			return
		}
		for(var targetUid in contributions[guildId]){
			if(targetUid != uid){
				self.leaveGuild(guildId,targetUid)
			}
		}
		self.redisDao.db.hdel("guild:guildNameMap",guildList[guildId]["name"],guildId)
		self.delLordData(uid,"gid")
		self.delAreaObj(main_name,guildId)
		delete contributions[guildId]
		self.redisDao.db.del("guild:contributions:"+guildId)
		delete guildList[guildId]
		self.redisDao.db.del("guild:guildInfo:"+guildId)
		self.redisDao.db.del("guild:log:"+guildId)
		cb(true)
	}
	//设置成副会长
	this.setGuildDeputy = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		targetUid = Number(targetUid)
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是公会会长")
			return
		}
		if(guildList[guildId]["deputy"]){
			cb(false,"公会已有副会长")
			return
		}
		if(contributions[guildId][targetUid] == undefined){
			cb(false,"玩家不存在")
			return
		}
		self.getPlayerKeyByUid(targetUid,"name",function(name) {
			self.addGuildLog(guildId,{type:"deputy",uid:targetUid,name:name})
		})
		//todo  邮件通知
		self.setGuildInfo(guildId,"deputy",targetUid)
		cb(true)
	}
	//设置成普通成员
	this.setGuildNormal = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		targetUid = Number(targetUid)
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是公会会长")
			return
		}
		if(guildList[guildId]["deputy"] != targetUid){
			cb(false,"目标不是副会长")
			return
		}
		if(contributions[guildId][targetUid] == undefined){
			cb(false,"玩家不存在")
			return
		}
		//todo  邮件通知
		self.setGuildInfo(guildId,"deputy",0)
		cb(true)
	}
	//设置成会长
	this.setGuildLead = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		targetUid = Number(targetUid)
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是公会会长")
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
		//todo  邮件通知
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
	//获取公会列表
	this.getGuildList = function(uid,cb) {
		var info = {
			applys : applyMap[uid],
			guildList : guildList
		}
		cb(true,info)
	}
	//申请加入公会
	this.applyJoinGuild = function(uid,guildId,cb) {
		if(self.players[uid]["gid"]){
			cb(false,"已加入公会")
			return
		}
		if(!guildList[guildId]){
			cb(false,"公会不存在")
			return
		}
		if(!applyList[guildId])
			applyList[guildId] = {}
		applyList[guildId][uid] = self.getBaseUser(uid)
		if(!applyMap[uid])
			applyMap[uid] = {}
		applyMap[uid][guildId] = Date.now()
		cb(true,applyMap[uid])
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
		if(guildList[guildId] >= max_num){
			cb(false,"人数已达上限")
			return
		}
		self.getPlayerKeyByUid(targetUid,"gid",function(gid) {
			if(gid){
				delete applyList[guildId][targetUid]
				cb(false,"该玩家已加入其他公会")
				return
			}
			self.addGuildLog(guildId,{type:"join",uid:targetUid,name:applyList[guildId][targetUid]["name"]})
			for(var i in applyMap[targetUid]){
				delete applyList[i][targetUid]
			}
			delete applyMap[targetUid]
			self.chageLordData(targetUid,"gid",guildId)
			self.incrbyGuildInfo(guildId,"num",1)
			contributions[guildId][targetUid] = 0
			self.redisDao.db.hset("guild:contributions:"+guildId,targetUid,0)
			//todo 欢迎邮件
			cb(true)
		})
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
	//退出公会
	this.quitGuild = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
			return
		}
		if(guildList[guildId]["lead"] == uid){
			cb(false,"会长不能退出公会")
			return
		}
		self.leaveGuild(guildId,uid,cb)
	}
	//玩家离开
	this.leaveGuild = function(guildId,uid,cb) {
		if(guildList[guildId]["deputy"] == uid)
			self.setGuildInfo(guildId,"deputy",0)
		self.delLordData(uid,"gid")
		self.incrbyGuildInfo(guildId,"num",-1)
		delete contributions[guildId][uid]
		self.redisDao.db.hdel("guild:contributions:"+guildId,uid)
		self.getPlayerKeyByUid(uid,"name",function(name) {
			self.addGuildLog(guildId,{type:"quit",uid:uid,name:name})
		})
		if(cb)
			cb(true)
	}
	//添加日志
	this.addGuildLog = function(guildId,info) {
		info.time = Date.now()
		self.redisDao.db.rpush("guild:log:"+guildId,JSON.stringify(info),function(err,num) {
			if(num > maxRecordNum){
				self.redisDao.db.ltrim("player:user:"+atkUser.uid+":arenaRecord",-maxRecordNum,-1)
			}
		})
	}
	//获取公会日志
	this.getGuildLog = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
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
	//公会经验增加
	this.addGuildEXP = function(uid,guildId,value) {
		if(guildList[guildId]){
			self.incrbyGuildInfo(guildId,"exp",value)
			self.checkGuildUpgrade(guildId)
		}
	}
	//公会升级检查
	this.checkGuildUpgrade = function(guildId) {
		if(guildList[guildId]){
			var lv = guildList[guildId]["lv"]
			var exp = guildList[guildId]["exp"]
			if(guild_lv[lv]["exp"] && guild_lv[lv+1]){
				if(exp >= guild_lv[lv]["exp"]){
					self.incrbyGuildInfo(guildId,"exp",-guild_lv[lv]["exp"])
					self.incrbyGuildInfo(guildId,"lv",1)
					self.addGuildLog(guildId,{type:"upgrade",lv:guildList[guildId]["lv"]})
					this.checkGuildUpgrade(guildId)
				}
			}
		}
	}
	//增加帮贡
	this.addGuildScore = function(uid,guildId,value) {
		console.log("addGuildScore",uid,guildId,value)
		if(guildList[guildId]){
			if(contributions[guildId] && contributions[guildId][uid] !== undefined){
				contributions[guildId][uid] += value
				self.redisDao.db.hincrby("guild:contributions:"+guildId,uid,value)
			}
		}
		var awardList = self.addItemStr(uid,currency+":"+value,1,"公会签到")
		return awardList
	}
	//签到
	this.signInGuild = function(uid,sign,cb) {
		console.log("signInGuild!!!")
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
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
			self.consumeItems(uid,guild_sign[sign]["pc"],1,"公会签到",function(flag,err) {
				if(flag){
					self.setObj(uid,main_name,"sign",1)
					var awardList = self.addGuildScore(uid,guildId,guild_sign[sign]["score"])
					self.addGuildEXP(uid,guildId,guild_sign[sign]["exp"])
					cb(true,awardList)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//升级公会技能
	this.upGuildSkill = function(uid,career,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入公会")
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
					cb(false,"公会等级不足")
					return
				}
				self.consumeItems(uid,guild_skill[lv]["pc"],1,"升级公会技能",function(flag,err) {
					if(flag){
						self.incrbyObj(uid,main_name,"skill_"+career,1,function(data) {
							cb(true,data)
						})
					}else{
						cb(false,err)
					}
				})
			})
		}
	}
}