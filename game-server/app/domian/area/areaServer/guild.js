//公会
const async = require("async")
const uuid = require("uuid")
const main_name= "guild"
const max_num = 20
const num_att = {"lv":1,"exp":1,"num":1,"id":1,"lead":1}
module.exports = function() {
	var self = this
	var contributions = {}		//公会玩家列表
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
			cb(true,guildList[guildId])
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
			self.getPlayerInfoByUids(uids,function(userInfos) {
				var info = {}
				info.userInfos = userInfos
				info.scores = scores
				cb(true,info)
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
				self.redisDao.db.incrby("guild:lastid",1,function(err,guildId) {
					console.log("guildId",guildId)
					//创建公会
					var guildInfo = {
						lv : 1,
						exp : 0,
						id : guildId,
						name : name,
						lead : uid,
						num : 1
					}
					guildList[guildId] = guildInfo
					contributions[guildId] = {}
					contributions[guildId][uid] = 0
					self.chageLordData(uid,"gid",guildId)
					self.setAreaObj(main_name,guildId,name)
					self.redisDao.db.hset("guild:guildNameMap",name,guildId)
					self.redisDao.db.hmset("guild:guildInfo:"+guildId,guildList[guildId])
					self.redisDao.db.hmset("guild:contributions:"+guildId,contributions[guildId])
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
				self.quitGuild(targetUid)
			}
		}
		self.redisDao.db.hdel("guild:guildNameMap",guildList[guildId]["name"],guildId)
		self.delLordData(uid,"gid")
		self.delAreaObj(main_name,guildId)
		delete contributions[guildId]
		self.redisDao.db.del("guild:contributions:"+guildId)
		delete guildList[guildId]
		self.redisDao.db.del("guild:guildInfo:"+guildId)
		cb(true)
	}
	//获取公会列表
	this.getGuildList = function(uid,cb) {
		cb(true,guildList)
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
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是公会会长")
			return
		}
		cb(true,applyList[guildId])
	}
	//同意申请
	this.agreeGuildApply = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是公会会长")
			return
		}
		if(!applyList[guildId][targetUid]){
			cb(false,"不存在该玩家申请")
			return
		}
		if(self.players[targetUid]["gid"]){
			delete applyList[guildId][targetUid]
			cb(false,"该玩家已加入公会")
			return
		}
		if(guildList[guildId] >= max_num){
			cb(false,"人数已达上限")
			return
		}
		delete applyList[guildId][targetUid]
		delete applyMap[targetUid][guildId]
		self.chageLordData(targetUid,"gid",guildId)
		self.incrbyGuildInfo(guildId,"num",1)
		contributions[guildId][targetUid] = 0
		self.redisDao.db.hset("guild:contributions:"+guildId,targetUid,0)
		//todo 欢迎邮件
		cb(true)
	}
	//拒绝申请
	this.refuseGuildApply = function(uid,targetUid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildList[guildId] || guildList[guildId]["lead"] != uid){
			cb(false,"不是公会会长")
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
		self.delLordData(uid,"gid")
		self.incrbyGuildInfo(guildId,"num",-1)
		delete contributions[guildId][uid]
		self.redisDao.db.hdel("guild:contributions:"+guildId,uid)
		cb(true)
	}
}