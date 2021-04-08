//宗族宝藏BOSS
const async = require("async")
const guild_cfg = require("../../../../config/gameCfg/guild_cfg.json")
const guild_lv = require("../../../../config/gameCfg/guild_lv.json")
const guild_auction = require("../../../../config/gameCfg/guild_auction.json")
const main_name = "guild_treasure"
const fightTime = 17
const auctionTime = 19
const endTime = 20
const currency = guild_cfg["currency"]["value"]
for(var i in guild_lv){
	for(var j = 1;j <= 4;j++){
		guild_lv[i]["team"+j] = JSON.parse(guild_lv[i]["team"+j])
		for(var k = 0;k < 6;k++){
			if(guild_lv[i]["team"+j][k])
				guild_lv[i]["team"+j][k].self_maxHP_add = guild_lv[i]["hpAdd"]
		}
	}
}
var qualitys = {}
for(var i in guild_auction){
	var lv = guild_auction[i]["lv"]
	if(!qualitys[lv])
		qualitys[lv] = []
	for(var j = 0;j < guild_auction[i]["count"];j++)
		qualitys[lv].push(guild_auction[i])
}
module.exports = function() {
	var self = this
	var local = {}
	//宝藏BOSS每日首次更新
	this.guildTreasureFirstUpdate = function() {
		self.getAreaObjAll("guild",function(data) {
			if(data){
				for(var guildId in data){
					self.redisDao.db.hdel(main_name,guildId)
					self.redisDao.db.del(main_name+":rank:"+guildId)
					self.redisDao.db.del(main_name+":play:"+guildId)
					self.redisDao.db.del(main_name+":"+guildId)
				}
			}
		})
	}
	//宝藏BOSS每日更新
	this.guildTreasureDayUpdate = function() {
		var d1 = new Date()
		var day = d1.getDay()
		if(day != 1 && day != 3 && day != 5){
			return
		}
		d1.setHours(endTime,0,0,0)
		var dt = d1.getTime() - Date.now()
		if(dt < 10000)
			dt = 10000
		self.setTimeout(function() {
			var guildList = self.getGuildInfoList()
			for(var guildId in guildList){
				self.guildTreasureAuctionEnd(guildId)
			}
		},dt)
	}
	//获取宝藏BOSS数据
	this.getAuctionData = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		var info = {}
		var d = new Date()
		var day = d.getDay()
		if(day != 1 && day != 3 && day != 5){
			cb(false,"周一、周三、周五开启")
			return
		}
		info.surplus_health = [1,1,1,1,1,1]
		info.bossId = Math.floor((d.getDate() % 4) + 1)
		self.redisDao.db.lrange(main_name+":play:"+guildId,0,-1,function(err,data) {
			info.num = 0
			if(data && data.length)
				info.num = data.length
			self.getObj(uid,main_name,"play",function(data) {
				info.play = data
				self.redisDao.db.hget(main_name,guildId,function(err,data) {
					if(data){
						info.surplus_health = JSON.parse(data)
					}
					self.redisDao.db.zrange(main_name+":rank:"+guildId,0,-1,"WITHSCORES",function(err,list) {
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
			})
		})
	}
	//宝藏BOSS竞拍结束
	this.guildTreasureAuctionEnd = function(guildId) {
		var curDayStr = (new Date()).toDateString()
		self.redisDao.db.hget(main_name+":state",guildId,function(err,data) {
			if(data != curDayStr){
				self.redisDao.db.hset(main_name+":state",guildId,curDayStr)
				self.redisDao.db.hgetall(main_name+":"+guildId,function(err,list) {
					if(list){
						var allValue = 0
						for(var i in list){
							list[i] = JSON.parse(list[i])
							if(list[i]["uid"] && list[i]["uid"] > 10000)
								self.sendMail(list[i]["uid"],"宗族竞拍成功","恭喜您竞拍成功，这是您的竞拍物品。",list[i]["item"])
							allValue += list[i]["cur"]
						}
						self.redisDao.db.lrange(main_name+":play:"+guildId,0,-1,function(err,data) {
							if(!err && data && data.length){
								var oneValue = Math.ceil(allValue / data.length)
								for(var i = 0;i < data.length;i++){
									self.sendMail(data[i],"宗族竞拍分红","您获得了来自宗族竞拍的分红奖励",currency+":"+oneValue)
								}
							}
						})
					}
				})
			}
		})
	}
	//挑战宝藏BOSS
	this.challengeTreasureBoss = function(uid,cb) {
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
		var lv = guildInfo.lv
		var d = new Date()
		var day = d.getDay()
		if(day != 1 && day != 3 && day != 5){
			cb(false,"今日未开启")
			return
		}
		var bossId = Math.floor((d.getDate() % 4) + 1)
		// var hours = d.getHours()
		// if(hours < fightTime || hours >= auctionTime){
		// 	cb(false,"hours error "+hours)
		// 	return
		// }
		var surplus_health = [1,1,1,1,1,1]
		var noFight = false
		var info = {}
		var allDamage = 0
		async.waterfall([
			function(next) {
				//判断次数
				self.getObj(uid,main_name,"play",function(data) {
					if(data){
						next("已挑战")
					}else{
						next()
					}
				})
			},
			function(next) {
				//获取剩余生命值
				self.redisDao.db.hget(main_name,guildId,function(err,data) {
					if(data){
						surplus_health = JSON.parse(data)
					}
					next()
				})
			},
			function(next) {
				if(surplus_health[0] === 0 && surplus_health[1] === 0 && surplus_health[2] === 0 && surplus_health[3] === 0 && surplus_health[4] === 0 && surplus_health[5] === 0){
					noFight = true
					next()
				}else{
					//获取阵容
					var atkTeam = self.getUserTeam(uid)
					var seededNum = Date.now()
					var defTeam = guild_lv[lv]["team"+bossId]
					for(var i = 0;i < 6;i++){
						if(defTeam[i])
							defTeam[i]["surplus_health"] = surplus_health[i]
					}
					var fightOtps = {seededNum : seededNum,maxRound:5}
				    info = {
				    	atkTeam : atkTeam,
				    	defTeam : defTeam,
				    	fightOtps : fightOtps
				    }
				    self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
				    var overInfo = self.fightContorl.getOverInfo()
				    surplus_health = []
				    var diedNum = 0
					for(var i = 0;i < 6;i++){
						if(defTeam[i] && overInfo.defTeam[i]){
							surplus_health[i] = overInfo.defTeam[i].hp/overInfo.defTeam[i].maxHP
						}else{
							surplus_health[i] = 0
						}
						if(surplus_health[i] <= 0)
							diedNum++
			    		if(overInfo.atkTeam[i])
			    			allDamage += overInfo.atkTeam[i].totalDamage
					}
					self.redisDao.db.hset(main_name,guildId,JSON.stringify(surplus_health))
					if(diedNum == 6){
						//击杀目标
						local.createTreasureAuction(guildId,lv)
					}
				    next()
				}
			},
			function(next) {
				//排行榜
				self.redisDao.db.zincrby(main_name+":rank:"+guildId,allDamage,uid)
				//获取奖励
				self.redisDao.db.rpush(main_name+":play:"+guildId,uid)
				self.setObj(uid,main_name,"play",1)
				info.awardList = self.addGuildScore(uid,guildId,guild_lv[lv]["auction_ctb"],"宝藏BOSS")
				info.awardList = info.awardList.concat(self.addItemStr(uid,"201:"+guild_lv[lv]["auction_award"],1,"宝藏BOSS"))
				info.noFight = noFight
				info.allDamage = allDamage
				cb(true,info)
			}
		],function(err,data) {
			cb(false,err)
		})
	}
	//生成竞拍物品
	local.createTreasureAuction = function(guildId,lv) {
		var list = []
		var info = {}
		list = list.concat(local.createTreasure(1,guild_lv[lv]["auction1"]))
		list = list.concat(local.createTreasure(2,guild_lv[lv]["auction2"]))
		list = list.concat(local.createTreasure(3,guild_lv[lv]["auction3"]))
		list.sort(function(){return Math.random()>0.5?1:-1})
		for(var i = 0;i < list.length;i++){
			info[i] = JSON.stringify(list[i])
		}
		self.redisDao.db.hmset(main_name+":"+guildId,info)
	}
	//生成单个竞拍物品
	local.createTreasure = function(quality,count) {
		var list = []
		for(var i = 0;i<count;i++){
			var rand = Math.floor(Math.random() * qualitys[quality].length)
			var info = {
				item : qualitys[quality][rand]["item"],
				basic : qualitys[quality][rand]["basic"],
				cur : qualitys[quality][rand]["basic"],
				uid : 0,
				name : ""
			}
			list.push(info)
		}
		return list
	}
	//获取竞拍列表
	this.getAuctionList = function(uid,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		self.redisDao.db.hgetall(main_name+":"+guildId,function(err,list) {
			cb(true,list)
		})
	}
	//举牌竞拍
	this.upForAuction = function(uid,index,price,cb) {
		var guildId = self.players[uid]["gid"]
		if(!guildId){
			cb(false,"未加入宗族")
			return
		}
		if(!Number.isInteger(price) || price <= 0){
			cb(false,"price error")
			return
		}
		var hours = (new Date()).getHours()
		if(hours < auctionTime || hours >= endTime){
			cb(false,"hours error "+hours)
			return
		}
		var name = self.players[uid]["name"]
		self.consumeItems(uid,currency+":"+price,1,"竞拍",function(flag,err) {
			if(flag){
				async.waterfall([
					function(next) {
						self.redisDao.db.hget(main_name+":"+guildId,index,function(err,info) {
							if(!info){
								next("竞拍物品不存在")
								return
							}
							info = JSON.parse(info)
							var max = info.basic * 2
							if(info.cur >= max){
								next("价格已达上限")
								return
							}
							if(price <= info.cur && price !== info.basic){
								next("出价低于当前价")
								return
							}
							if(price > max){
								next("出价高于上限")
								return
							}
							if(info.uid){
								self.addItemStr(info.uid,currency+":"+info.cur,1,"竞拍返还")
							}
							info.cur = price
							info.uid = uid
							info.name = name
							info.index = index
							info.max = max
							self.redisDao.db.hset(main_name+":"+guildId,index,JSON.stringify(info))
							self.sendToGuild(guildId,{type:"upForAuction",info:info})
							cb(true,info)
						})
					}
				],function(err) {
					self.addItemStr(uid,currency+":"+price,1,"竞拍返还")
					cb(false,err)
				})
			}else{
				cb(false,"贡献不足")
			}
		})
	}
}