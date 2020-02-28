//竞技场
var arena_cfg = require("../../../../config/gameCfg/arena_cfg.json")
var arena_rank = require("../../../../config/gameCfg/arena_rank.json")
var arena_shop = require("../../../../config/gameCfg/arena_shop.json")
var util = require("../../../../util/util.js")
var mainName = "arena"
var correctNumerator = arena_cfg["correctNumerator"]["value"]			//修正值
var correctDenominator = arena_cfg["correctDenominator"]["value"]		//宽度值
var addOneLv = arena_cfg["addOneLv"]["value"]							//排名在此以内使用当前排名+1
var dayCount = arena_cfg["dayCount"]["value"]							//每日挑战次数
var buyCount = arena_cfg["buyCount"]["value"]							//每日最大购买挑战次数
var buyConsume = arena_cfg["buyConsume"]["value"]						//胜利奖励
var winAward = arena_cfg["win"]["value"]								//失败奖励
var loseAward = arena_cfg["lose"]["value"]								//购买次数消耗
var rankUp = arena_cfg["rankUp"]["value"] 								//排名提示奖励物品ID
var sysChatLv = 10														//系统广播通知排名临界值
var maxRecordNum = 10													//最大记录条数
var rankList = []
for(var i in arena_rank){
	rankList.push(parseInt(i))
	for(var j = 1;j <= 3;j++){
		arena_rank[i]["team"+j] = JSON.parse(arena_rank[i]["team"+j])
	}
}
rankList.sort(function(a,b) {
	return a-b
})
var listRank = []
for(var i = 1;i <= 20;i++){
	listRank.push(i)
}
module.exports = function() {
	var self = this
	var local = {}
	local.locks = {}
	//匹配规则  计算目标列表
	local.calRankTargets = function(rank) {
		var list = []
		//5名以内 显示除自己以外的玩家
		if(rank <= 5){
			for(var i = 1;i <= 5;i++){
				if(i != rank){
					list.push(i)
				}
			}
			return list
		}
		var lenght = 1
		if(rank > addOneLv){
			lenght = Math.ceil((rank + correctNumerator) / correctDenominator)
		}
		for(var i = 1;i <= 4;i++){
			var tail =  rank - (lenght * (i - 1)) - 1
			var head = rank - (lenght * i)
			var rand = Math.floor(head + Math.random() * (tail - head))
			if(rand >= 1)
				list.push(rand)
		}
		return list
	}
	local.getTargetsInfo = function(list,cb) {
		self.redisDao.db.hmget("area:area"+self.areaId+":"+mainName,list,function(err,userList) {
			self.redisDao.db.hmget("area:area"+self.areaId+":robots",list,function(err,robotList) {
				for(var i = 0;i < userList.length;i++){
					if(!userList[i]){
						userList[i] = robotList[i]
					}
				}
				cb(true,{rankList : list,userList : userList})
			})
		})
	}
	//初始化玩家排名
	this.initArenaRank = function(uid,name,sex) {
		self.redisDao.db.hincrby("area:area"+self.areaId+":areaInfo","lastRank",1,function(err,rank) {
			var info = {
				rank : rank,
				count : 0,						//今日挑战次数
				buyCount : 0,					//今日购买挑战次数
				highestRank : rank				//最高排名
			}
			self.setHMObj(uid,mainName,info)
			self.redisDao.db.hset("area:area"+self.areaId+":"+mainName,rank,JSON.stringify({uid : uid,sex : sex,name : name}))
		})
	}
	//购买竞技场奖励商城物品
	this.buyArenaShop = function(uid,shopId,count,cb) {
		if(parseInt(shopId) != shopId || !Number.isInteger(count) || count <= 0){
			cb(false,"args type error")
			return
		}
		var shopInfo = arena_shop[shopId]
		if(!shopInfo){
			cb(false,"shopId error "+shopId)
			return
		}
		self.getHMObj(uid,mainName,["highestRank",shopId+"_buy"],function(list) {
			var rank = parseInt(list[0])
			var buyNum = parseInt(list[1]) || 0
			if(buyNum + count > shopInfo.maxBuy){
				cb(false,"购买超出上限")
				return
			}
			if(rank > shopInfo.rank){
				cb(false,"排名未达到")
				return
			}
			self.consumeItems(uid,shopInfo.pc,count,function(flag,err) {
				if(!flag){
					cb(flag,err)
					return
				}
				self.addItemStr(uid,shopInfo.pa,count)
				self.incrbyObj(uid,mainName,shopId+"_buy",count)
				cb(true,shopInfo.pa)
			})
		})
	}
	//获取竞技场排行榜
	this.getRankList = function(cb) {
		local.getTargetsInfo(listRank,cb)
	}
	//获取目标列表
	this.getTargetList = function(uid,cb) {
		self.getObj(uid,mainName,"rank",function(rank) {
			rank = parseInt(rank)
			var list = local.calRankTargets(rank)
			local.getTargetsInfo(list,cb)
		})
	}
	//获取竞技场阵容
	this.getAreaTeamByUid = function(targetUid,targetRank,cb) {
		if(targetUid < 10000){
			//机器人队伍
			var range = util.binarySearch(rankList,targetRank)
			var rand = Math.floor(Math.random() * 3 + 1)
			if(!arena_rank[range] || !arena_rank[range]["team"+rand]){
				cb(false,"机器人配置错误")
				return
			}
			var defTeam = arena_rank[range]["team"+rand].concat()
			cb(true,defTeam)
		}else{
			//玩家队伍
			self.getDefendTeam(targetUid,function(defTeam) {
				if(!defTeam){
					cb(false,"敌方阵容错误")
					return
				}else{
					cb(true,defTeam)
				}
			})
		}
	}
	//获取我的竞技场数据
	this.getMyArenaInfo = function(uid,cb) {
		this.getObjAll(uid,mainName,function(data) {
			cb(true,data)
		})
	}
	//挑战目标
	this.challengeArena = function(uid,targetStr,targetRank,cb) {
		if(!Number.isInteger(targetRank)|| targetRank <= 0){
			cb(false,"challengeArena targetRank error "+targetRank)
			return
		}
	    var fightInfo = self.getFightInfo(uid)
	    if(!fightInfo || !fightInfo.team || !fightInfo.seededNum){
			cb(false,"atkTeam error")
			return
	    }
	    var atkTeam = fightInfo.team
	    var seededNum = fightInfo.seededNum
		local.getTargetsInfo([targetRank],function(flag,data) {
			if(!data || !data.userList || !data.userList[0] || data.userList[0] !== targetStr){
				cb(false,"竞技场排名已发生改变")
				return
			}
			var targetInfo = JSON.parse(data.userList[0])
			var targetUid = targetInfo.uid
		    if(local.locks[targetUid]){
		    	cb(false,"该玩家正在被挑战")
		    	return
		    }
			local.locks[targetUid] = true
			local.locks[uid] = true
			self.getObjAll(uid,mainName,function(arenaInfo) {
				arenaInfo.count = parseInt(arenaInfo.count)
				arenaInfo.buyCount = parseInt(arenaInfo.buyCount)
				if(arenaInfo.count >= dayCount + arenaInfo.buyCount){
					delete local.locks[targetUid]
					delete local.locks[uid]
					cb(false,"挑战次数已满")
					return
				}
				self.incrbyObj(uid,mainName,"count",1)
				if(targetUid < 10000){
					//机器人队伍
					var range = util.binarySearch(rankList,targetRank)
					var rand = Math.floor(Math.random() * 3 + 1)
					if(!arena_rank[range] || !arena_rank[range]["team"+rand]){
						cb(false,"机器人配置错误")
						delete local.locks[targetUid]
						delete local.locks[uid]
						return
					}
					var defTeam = arena_rank[range]["team"+rand].concat()
					local.challengeArena(uid,targetUid,targetRank,targetStr,targetInfo,atkTeam,defTeam,seededNum,cb)
				}else{
					//玩家队伍
					self.getDefendTeam(targetUid,function(defTeam) {
						if(!defTeam){
							cb(false,"敌方阵容错误")
							delete local.locks[targetUid]
							delete local.locks[uid]
							return
						}
						local.challengeArena(uid,targetUid,targetRank,targetStr,targetInfo,atkTeam,defTeam,seededNum,cb)
					})
				}
			})
		})
	}
	//竞技场每日刷新
	this.arenadayUpdate = function(uid) {
		var info = {
			count : 0,						//今日挑战次数
			buyCount : 0					//今日购买挑战次数
		}
		self.setHMObj(uid,mainName,info)
		//发放竞技场奖励
		self.getObj(uid,mainName,"rank",function(rank) {
			rank = parseInt(rank)
			var range = util.binarySearch(rankList,rank)
			if(arena_rank[range] && arena_rank[range]["dayAward"]){
				var title = "竞技场排名奖励"
				var text = "恭喜您在竞技场排名第"+rank+"名,这是您的排名奖励"
				self.sendMail(uid,title,text,arena_rank[range]["dayAward"])
			}
		})
	}
	//购买挑战次数
	this.buyArenaCount = function(uid,cb) {
		self.getObj(uid,mainName,"buyCount",function (count) {
			count = parseInt(count) || 0
			if(count >= buyCount){
				cb(false,"购买次数已达上限")
				return
			}
			self.consumeItems(uid,buyConsume,1,function(flag,err) {
				if(!flag){
					cb(flag,err)
					return
				}
				self.incrbyObj(uid,mainName,"buyCount",1,function(newCount) {
					cb(true,newCount)
				})
			})
		})
	}
	//挑战结算
	local.challengeArena = function(uid,targetUid,targetRank,targetStr,targetInfo,atkTeam,defTeam,seededNum,cb) {
		var info = {}
		var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
		info.targetStr = targetStr
		info.winFlag = winFlag
		var fightInfo = {atkTeam : atkTeam,defTeam : defTeam,seededNum : seededNum}
		info.fightInfo = fightInfo
		if(winFlag){
			self.getObjAll(uid,mainName,function(data) {
				//交换排名
				data.rank = parseInt(data.rank)
				info.rank = data.rank
				if(data.rank > targetRank){
					local.swopRank(uid,data.rank,targetUid,targetRank,function() {
						delete local.locks[uid]
						delete local.locks[targetUid]
					})
					self.taskUpdate(uid,"rank",1,targetRank)
					var tmpRank = data.rank
					data.rank = targetRank
					targetRank = tmpRank
				}else{
					delete local.locks[uid]
					delete local.locks[targetUid]
				}
				//获胜奖励
				info.winAward =  self.addItemStr(uid,winAward,1)
				//排名提升奖励
				if(data.rank < data.highestRank){
					var value = local.calRankUpAward(data.highestRank,data.rank)
					info.newRank = data.rank
					info.upAward = self.addItem({uid : uid,itemId : rankUp,value : value})
					self.setObj(uid,mainName,"highestRank",data.rank)
				}
				//记录
				local.addRecord(uid,"atk",winFlag,targetInfo,fightInfo,data.rank)
				local.addRecord(targetUid,"def",winFlag,targetInfo,fightInfo,targetRank)
				cb(true,info)
			})
		}else{
			//失败奖励
			self.addItemStr(uid,loseAward,1)
			local.addRecord(uid,"atk",winFlag,targetInfo,fightInfo)
			local.addRecord(targetUid,"def",winFlag,targetInfo,fightInfo)
			delete local.locks[uid]
			delete local.locks[targetUid]
			cb(true,info)
		}
		self.taskUpdate(uid,"arena",1)
	}
	//获取挑战记录
	this.getRerord = function(uid,cb) {
		self.redisDao.db.lrange("area:area"+self.areaId+":player:"+uid+":arenaRecord",0,-1,function(err,list) {
			if(err || !list){
				cb(true,[])
			}else{
				cb(true,list)
			}
		})
	}
	//添加记录
	local.addRecord = function(uid,type,winFlag,targetInfo,fightInfo,rank) {
		if(uid < 10000){
			return
		}
		var atkUser = self.getSimpleUser(uid)
		var info = {type : type,winFlag : winFlag,atkUser : atkUser,defUser : targetInfo,fightInfo : fightInfo,time : Date.now()}
		if(rank){
			info.rank = rank
		}
		self.redisDao.db.rpush("area:area"+self.areaId+":player:"+uid+":arenaRecord",JSON.stringify(info),function(err,num) {
			if(num > maxRecordNum){
				self.redisDao.db.ltrim("area:area"+self.areaId+":player:"+uid+":arenaRecord",-maxRecordNum,-1)
			}
		})
	}
	//交换排名
	local.swopRank = function(uid,rank,targetUid,targetRank,cb) {
		self.redisDao.db.hmget("area:area"+self.areaId+":"+mainName,[rank,targetRank],function(err,data) {
			if(data[1])
				self.redisDao.db.hset("area:area"+self.areaId+":"+mainName,rank,data[1])
			if(uid > 10000)
				self.setObj(uid,mainName,"rank",targetRank)
			if(data[0])
				self.redisDao.db.hset("area:area"+self.areaId+":"+mainName,targetRank,data[0])
			if(targetUid > 10000)
				self.setObj(targetUid,mainName,"rank",rank)
			if(targetRank <= sysChatLv){
				var userInfo = JSON.parse(data[0])
				var userName = ""
				if(userInfo && userInfo.name){
					userName = userInfo.name
				}
				if(!data[1]){
					self.redisDao.db.hget("area:area"+self.areaId+":robots",targetUid,function(err,targetInfo) {
						var targetInfo = JSON.parse(targetInfo)
						var targetName = ""
						if(targetInfo && targetInfo.name){
							targetName = targetInfo.name
						}
						var notify = {
							type : "sysChat",
							text : userName+"玩家击败了"+targetName+" 玩家,取代了"+targetName+"竞技场的位置,当前排名"+rank
						}
						self.sendAllUser(notify)
					})
				}else{
					var targetInfo = JSON.parse(data[1])
					var targetName = ""
					targetName = targetInfo.name
					var notify = {
						type : "sysChat",
						text : userName+"玩家击败了"+targetName+" 玩家,取代了"+targetName+"竞技场的位置,当前排名"+rank
					}
					self.sendAllUser(notify)
				}
			}
			if(cb){
				cb()
			}
		})
	}
	//计算排名提升奖励
	local.calRankUpAward = function(rank,targetRank) {
		var num = 0
		var calCount = 0
		while(rank > targetRank && calCount < 100){
			calCount++
			var range = util.binarySearch(rankList,rank - 1)
			var count = 0
			if(targetRank < range){
				count = rank - range
			}else{
				count = rank - targetRank
			}
			num += arena_rank[range]["rankAward"] * count
			rank -= count
		}
		return num
	}
}
