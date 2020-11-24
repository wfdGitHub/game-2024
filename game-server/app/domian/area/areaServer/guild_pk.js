//宗族PK
const async = require("async")
const main_name = "guild_pk"
const endHours = 19
const teamNumLv = {"0" : 0,"1" : 90,"2" : 120,"3" : 150,"4" : 180}
module.exports = function() {
	var self = this
	//获取PK数据
	this.getGuildPKData = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		var info = {}
		async.waterfall([
			function(next) {
				//获取报名信息
				self.redisDao.db.hget(main_name+":apply",guildId,function(err,data) {
					if(data)
						info.apply = true
					next()
				})
			},
			function(next) {
				//获取公会出战队伍
				self.redisDao.db.hgetall(main_name+":"+guildId,function(data) {
					var atkList = []
					var atkUids = []
					for(var key in data){
					    var strList = key.split("_")
					    var info = {
					    	uid : Number(strList[0]),
					    	teamId : Number(strList[1]),
					    	path : data[key]
					    }
					    atkUids.push(info.uid)
					    atkList.push(info)
					}
					self.getPlayerInfoByUids(atkUids,function(data) {
						for(var i = 0;i < atkList.length;i++){
							atkList[i]["info"] = data[i]
						}
						next()
					})
				})
			},
			function(next) {
				//获取本轮对手
				self.redisDao.db.hget(main_name+":parMap",guildId,function(err,tableIndex) {
					if(tableIndex){
						info.tableIndex = tableIndex
						self.redisDao.db.hget(main_name+":table",tableIndex,function(err,data) {
							if(data)
								info.table = JSON.parse(data)
							next()
						})
					}else{
						next()
					}
				})
			},
			function(next) {
				//获取上轮战报
				self.redisDao.db.hget(main_name+":history",guildId,function(err,tableIndex) {
					if(tableIndex){
						self.redisDao.db.get(main_name+":baseInfo:"+tableIndex,function(err,data) {
							info.history = data
							next()
						})
					}else{
						next()
					}
				})
			},
			function(next) {
				//获取我的派遣队伍
				var arr = []
				for(var i in teamNumLv)
					arr.push(uid+"_"+i)
				self.redisDao.db.hmget(main_name+":"+guildId,arr,function(err,data) {
					info.sendTeams = data || []
					cb(true,info)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取单路数据
	this.getGuildPKRecord = function(uid,path,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		self.redisDao.db.hget(main_name+":history",guildId,function(err,tableIndex) {
			if(tableIndex){
				self.redisDao.db.lrange(main_name+":simpleRecord:"+tableIndex+":"+path,0,-1,function(err,data) {
					cb(true,data)
				})
			}else{
				cb(false,"无历史数据")
			}
		})
	}
	//获取战斗数据
	this.getGuildPKFight = function(uid,path,index,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		self.redisDao.db.hget(main_name+":history",guildId,function(err,tableIndex) {
			if(tableIndex){
				self.redisDao.db.lindex(main_name+":fightRecordList:"+tableIndex+":"+path,index,function(err,data) {
					cb(true,data)
				})
			}else{
				cb(false,"无历史数据")
			}
		})
	}
	//报名
	this.applyGuildPK = function(uid,cb) {
		var day = (new Date()).getDay()
		// if(day == 0){
		// 	cb(false,"周日不可报名")
		// 	return
		// }
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
		self.redisDao.db.hget(main_name+":apply",guildId,function(err,data) {
			if(data){
				cb(false,"已报名")
			}else{
				self.redisDao.db.hset(main_name+":apply",guildId,1)
				cb(true)
			}
		})
	}
	//派遣队伍
	this.sendGuildPKTeam = function(uid,teamId,path,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		var day = (new Date()).getDay()
		if(day !== 0){
			cb(false,"仅周日可派遣")
			return
		}
		if(path !== 1 && path !== 2 && path !== 3){
			cb(false,"path error "+path)
			return
		}
		//检测时间
		var hours = (new Date()).getHours()
		if(hours >= endHours){
			cb(false,"endHours "+endHours)
			return
		}
		async.waterfall([
			function(next) {
				//检测对手信息
				self.redisDao.db.hget(main_name+":parMap",guildId,function(err,tableIndex) {
					if(tableIndex){
						next()
					}else{
						next("不可派遣")
					}
				})
			},
			function(next) {
				//检测是否已报名
				self.redisDao.db.hget(main_name+":apply",guildId,function(err,data) {
					if(data)
						next()
					else
						next("未报名")
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
				self.redisDao.db.hget(main_name+":"+guildId,uid+"_"+teamId,function(err,data) {
					if(data){
						cb(false,"队伍已派遣")
						return
					}
					next()
				})
			},
			function(next) {
				//派遣队伍
				self.redisDao.db.hset(main_name+":"+guildId,uid+"_"+teamId,path)
				cb(true)
			},
		],function(err) {
			cb(false,err)
		})
	}
	//撤回队伍
	this.cancelGuildPKTeam = function(uid,teamId,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		self.redisDao.db.hget(main_name+":"+guildId,uid+"_"+teamId,function(err,data) {
			if(!data){
				cb(false,"未派遣")
				return
			}else{
				self.redisDao.db.hdel(main_name+":"+guildId,uid+"_"+teamId)
				cb(true)
			}
		})
	}
	//离开宗族后撤销派遣
	this.cancelGuildPKAllTeam = function(guildId,uid) {
		//检测队伍是否已派遣
		var arr = []
		for(var i in teamNumLv)
			arr.push(uid+"_"+i)
		self.redisDao.db.hmget(main_name+":"+guildId,arr,function(data) {
			for(var i = 0;i < data.length;i++){
				if(data[i]){
					self.redisDao.db.hdel(main_name+":"+guildId,uid+"_"+i)
				}
			}
		})
	}
}