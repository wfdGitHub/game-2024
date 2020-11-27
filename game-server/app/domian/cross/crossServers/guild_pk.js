const main_name = "guild_pk"
const async = require("async")
const guild_pk = require("../../../../config/gameCfg/guild_pk.json")
const endTime= 19
//跨服宗族战
module.exports = function() {
	var self = this
	//每日刷新
	this.guildPKDayUpdate = function() {
		var d = new Date()
		var day = d.getDay()
		var curDayStr = d.toDateString()
		if(day == 0){
			self.redisDao.db.hget(main_name,"dayStr",function(err,data) {
				if(data != curDayStr){
					self.redisDao.db.hset(main_name,"dayStr",curDayStr)
					self.matchGuildPKRival()
				}
			})
			self.redisDao.db.hget(main_name,"pkState",function(err,data) {
				if(data != curDayStr){
					d.setHours(endTime,0,0,0)
					var dt = d.getTime() - Date.now()
					if(dt < 10000)
						dt = 10000
					console.log("guildPKDayUpdate dt ",dt)
					setTimeout(function(){
						self.redisDao.db.hset(main_name,"pkState",curDayStr)
						self.beginGuildPKTable()
					},dt)
				}
			})
		}
	}
	//匹配对手
	this.matchGuildPKRival = function() {
		console.log("matchGuildPKRival!!")
		self.redisDao.db.del(main_name+":parMap")
		self.redisDao.db.del(main_name+":table")
		self.redisDao.db.del(main_name+":applyHistory")
		self.redisDao.db.hgetall(main_name+":apply",function(err,list) {
			console.log("宗族PK获取报名列表",list)
			self.redisDao.db.del(main_name+":apply")
			if(list){
				self.redisDao.db.hmset(main_name+":applyHistory",list)
				var arr = []
				for(var guildId in list){
					arr.push(guildId)
				}
				arr.sort(function(){return Math.random() > 0.5?1:-1})
				if(arr.length > 1){
					console.log("报名宗族大于1,开始比赛。总报名数: ",arr.length)
					var curNum = 0
					var map = {}
					var table = {}
					var tableIndex = 1
					while(arr.length > curNum){
						if(arr.length - curNum >= 2){
							map[arr[curNum]] = tableIndex
							map[arr[curNum+1]] = tableIndex
							table[tableIndex] = JSON.stringify([arr[curNum],arr[curNum+1]])
						}else{
							var rand = (curNum + Math.ceil(Math.random() * (arr.length-1))) % arr.length
							console.log("arr",arr,rand,arr[rand])
							map[arr[curNum]] = tableIndex
							table[tableIndex] = JSON.stringify([arr[curNum],arr[rand]])
						}
						tableIndex++
						curNum += 2
					}
					console.log("生成对阵表",table)
					self.redisDao.db.hmset(main_name+":parMap",map)	
					self.redisDao.db.hmset(main_name+":table",table)
				}else{
					self.redisDao.db.del(main_name+":apply")
					self.redisDao.db.del(main_name+":parMap")
					self.redisDao.db.del(main_name+":table")
				}
			}
		})
	}
	//战斗
	this.beginGuildPKTable = function() {
		console.log("beginGuildPKTable!!")
		async.waterfall([
			function(next) {
				//清除初始数据
				self.redisDao.db.hgetall(main_name+":historyTable",function(err,table) {
					if(table){
						self.redisDao.db.del(main_name+":historyTable")
						console.log("清除初始数据",table)
						for(var tableIndex in table){
							var list = JSON.parse(table[tableIndex])
							console.log("list",list)
							self.redisDao.db.del(main_name+":baseInfo:"+tableIndex)
							for(var path = 1;path <= 3;path++){
								self.redisDao.db.del(main_name+":fightRecordList:"+tableIndex+":"+path)
								self.redisDao.db.del(main_name+":simpleRecord:"+tableIndex+":"+path)
							}
							self.redisDao.db.hdel(main_name+":history",list[0])
							self.redisDao.db.hdel(main_name+":history",list[1])
						}
					}
					next()
				})
			},function(next) {
				self.redisDao.db.del(main_name+":parMap")
				self.redisDao.db.hgetall(main_name+":table",function(err,table) {
					if(table){
						self.redisDao.db.del(main_name+":table")
						self.redisDao.db.hmset(main_name+":historyTable",table)
						console.log("宗族PK 存在对阵表 开始对阵",table)
						var map = {}
						for(var tableIndex in table){
							var list = JSON.parse(table[tableIndex])
							var npc = false
							if(map[list[0]] || map[list[1]])
								npc = true
							map[list[0]] = tableIndex
							map[list[1]] = tableIndex
							self.guildPKFight(tableIndex,list[0],list[1],npc)
						}
					}else{
						console.log("宗族PK 无对阵表")
					}
				})
			}
		],function(err) {
			console.log(err)
		})
	}
	//单次对阵
	this.guildPKFight = function(tableIndex,guildId1,guildId2,npc) {
		console.log("guildPKFight",tableIndex,guildId1,guildId2)
		var atkTeams = []
		var defTeams = []
		var atkList = []
		var defList = []
		var atkUids = []
		var defUids = []
		var atkDamageRank = {}
		var defDamageRank = {}
		var fightRecordList = {"1":[],"2":[],"3":[]}
		var simpleRecord = {"1":[],"2":[],"3":[]}
		var atkPathTeam = {"1":[],"2":[],"3":[]}
		var defPathTeam = {"1":[],"2":[],"3":[]}
		var winList = {"1":"def","2":"def","3":"def"}
		var atkGuildLv = 1
		var defGuildLv = 1
		var atkGuildInfo = ""
		var defGuildInfo = ""
		var atkWinNum = 0
		async.waterfall([
			function(next) {
				//获取进攻方队伍
				self.redisDao.db.hgetall(main_name+":"+guildId1,function(err,data) {
					self.redisDao.db.del(main_name+":"+guildId1)
					for(var key in data){
					    var strList = key.split("_")
					    var info = {
					    	uid : Number(strList[0]),
					    	teamId : Number(strList[1]),
					    	path : data[key]
					    }
					    atkList.push(info)
					}
					atkList.sort(function(){return Math.random() > 0.5?1:-1})
					for(var i = 0;i < atkList.length;i++)
						atkUids.push(atkList[i].uid)
					next()
				})
			},
			function(next) {
				//获取攻方玩家信息
				self.getPlayerInfoByUids([],atkUids,function(data) {
					for(var i = 0;i < atkList.length;i++){
						atkList[i]["info"] = data[i]
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
				//获取防守方队伍
				self.redisDao.db.hgetall(main_name+":"+guildId2,function(err,data) {
					self.redisDao.db.del(main_name+":"+guildId2)
					for(var key in data){
					    var strList = key.split("_")
					    var info = {
					    	uid : Number(strList[0]),
					    	teamId : Number(strList[1]),
					    	path : data[key]
					    }
					    defList.push(info)
					}
					defList.sort(function(){return Math.random() > 0.5?1:-1})
					for(var i = 0;i < defList.length;i++)
						defUids.push(defList[i].uid)
					next()
				})
			},
			function(next) {
				//获取防守玩家信息
				self.getPlayerInfoByUids([],defUids,function(data) {
					for(var i = 0;i < defList.length;i++){
						defList[i]["info"] = data[i]
					}
					next()
				})
			},
			function(next) {
				//获取防守方队伍阵容
				if(defList.length){
					var multiList = []
					for(var i = 0;i < defList.length;i++){
						multiList.push(["hget","player:user:"+defList[i]["uid"]+":guild_team",defList[i]["teamId"]])
					}
					self.redisDao.multi(multiList,function(err,list) {
						self.heroDao.getMultiHeroList(defUids,list,function(flag,data) {
							defTeams = data
							next()
						})
					})
				}else{
					next()
				}
			},
			function(next) {
				//开始对战
				for(var i = 0;i < atkList.length;i++){
					var path = atkList[i]["path"]
					if(atkPathTeam[path]){
						atkPathTeam[path].push({index : i,team : atkTeams[i]})
					}
				}
				for(var i = 0;i < defList.length;i++){
					var path = defList[i]["path"]
					if(defPathTeam[path]){
						defPathTeam[path].push({index : i,team : defTeams[i]})
					}
				}
				console.log("攻方三路",atkPathTeam)
				console.log("守方三路",defPathTeam)
				next()
			},
			function(next) {
				//获取公会信息
				self.redisDao.db.hget("guild:guildInfo:"+guildId1,"lv",function(err,data) {
					atkGuildLv = Number(data) || 1
					self.redisDao.db.hget("guild:guildInfo:"+guildId2,"lv",function(err,data) {
						defGuildLv = Number(data) || 1
						self.redisDao.db.hmget(main_name+":applyHistory",[guildId1,guildId2],function(err,list) {
							atkGuildInfo = list[0]
							defGuildInfo = list[1]
							next()
						})
					})
				})
			},
			function(next) {
				//战斗
				for(var path = 1;path <= 3;path++){
					var atkSurplus = [1,1,1,1,1,1]
					var defSurplus = [1,1,1,1,1,1]
					var atkNum = 0
					var defNum = 0
					var atkWin = false
					if(atkPathTeam[path].length)
						atkWin = true
					while(atkPathTeam[path][atkNum] && defPathTeam[path][defNum]){
						console.log("atkNum",atkNum,"defNum",defNum)
						var atkTeam = atkPathTeam[path][atkNum]["team"]
						var defTeam = defPathTeam[path][defNum]["team"]
						for(var i = 0;i < 6;i++){
							if(atkTeam[i])
								atkTeam[i]["surplus_health"] = atkSurplus[i]
							if(defTeam[i])
								defTeam[i]["surplus_health"] = defSurplus[i]
						}
						var seededNum = Date.now()
						var record = {atkTeam:atkTeam,defTeam,defTeam,seededNum:seededNum}
						var atkIndex = atkPathTeam[path][atkNum]["index"]
						var defIndex = defPathTeam[path][defNum]["index"]
						record.atkIndex = atkIndex
						record.defIndex = defIndex
						console.log("atkTeam",atkTeam,"defTeam",defTeam)
						record.winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
						var overInfo = self.fightContorl.getOverInfo()
				    	var atkDamage = 0
				    	for(var i = 0;i < overInfo.atkTeam.length;i++)
				    		if(overInfo.atkTeam[i])
				    			atkDamage += overInfo.atkTeam[i].totalDamage
				    	var defDamage = 0
				    	for(var i = 0;i < overInfo.defTeam.length;i++)
				    		if(overInfo.defTeam[i])
				    			defDamage += overInfo.defTeam[i].totalDamage
				    	if(atkList[atkIndex] && atkList[atkIndex]["uid"]){
					    	if(!atkDamageRank[atkList[atkIndex]["uid"]])
					    		atkDamageRank[atkList[atkIndex]["uid"]] = 0
							atkDamageRank[atkList[atkIndex]["uid"]] += atkDamage
				    	}
				    	if(defList[defIndex] && defList[defIndex]["uid"]){
					    	if(!defDamageRank[defList[defIndex]["uid"]])
					    		defDamageRank[defList[defIndex]["uid"]] = 0
							defDamageRank[defList[defIndex]["uid"]] += defDamage
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
						fightRecordList[path].push(JSON.stringify(record))
						simpleRecord[path].push(JSON.stringify({atkIndex : record.atkIndex,defIndex : record.defIndex,winFlag : record.winFlag}))
						if(atkNum >= 200 || defNum >= 200){
							break
						}
					}
					if(fightRecordList[path].length)
						self.redisDao.db.rpush(main_name+":fightRecordList:"+tableIndex+":"+path,fightRecordList[path])
					if(simpleRecord[path].length)
						self.redisDao.db.rpush(main_name+":simpleRecord:"+tableIndex+":"+path,simpleRecord[path])
					if(atkWin){
						winList[path] = "atk"
						atkWinNum++
						console.log(path,"攻方获胜")
					}else{
						console.log(path,"守方获胜")
					}
				}
				//记录数据 todo公会信息
				var baseInfo = {
					tableIndex : tableIndex,
					atkDamageRank : atkDamageRank,
					defDamageRank : defDamageRank,
					atkGuildInfo : atkGuildInfo,
					defGuildInfo : defGuildInfo,
					atkGuild : guildId1,
					defGuild : guildId2,
					atkList : atkList,
					defList : defList,
					winList : winList,
					time : Date.now()
				}
				self.redisDao.db.set(main_name+":baseInfo:"+tableIndex,JSON.stringify(baseInfo))
				next()
			},
			function(next) {
				//发放奖励
				console.log("winList",winList,atkWinNum)
				var atkMap = {}
				var defMap = {}
				for(var i = 0;i < atkUids.length;i++)
					atkMap[atkUids[i]] = 1
				for(var i = 0;i < defUids.length;i++)
					defMap[defUids[i]] = 1
				if(atkWinNum >= 2){
					//攻方赢
					for(var uid in atkMap){
						self.sendMailByUid(uid,"宗族会武获胜奖","恭喜您的宗族在本次宗族会武活动中大获全胜!",guild_pk[atkGuildLv]["win"])
						self.sendMailByUid(uid,"宗族会武参与奖","您参与本次宗族会武活动获得了参与奖励。",guild_pk[atkGuildLv]["play"])
					}
					if(!npc){
						for(var uid in defMap){
							self.sendMailByUid(uid,"宗族会武惜败","您的宗族在本次会武中惜败于对手。",guild_pk[defGuildLv]["lose"])
							self.sendMailByUid(uid,"宗族会武参与奖","您参与本次宗族会武活动获得了参与奖励。",guild_pk[defGuildLv]["play"])
						}
					}
				}else{
					//守方赢
					for(var uid in atkMap){
						self.sendMailByUid(uid,"宗族会武惜败","您的宗族在本次会武中惜败于对手。",guild_pk[atkGuildLv]["lose"])
						self.sendMailByUid(uid,"宗族会武参与奖","您参与本次宗族会武活动获得了参与奖励。",guild_pk[atkGuildLv]["play"])
					}
					if(!npc){
						for(var uid in defMap){
							self.sendMailByUid(uid,"宗族会武获胜奖","恭喜您的宗族在本次宗族会武活动中大获全胜!",guild_pk[defGuildLv]["win"])
							self.sendMailByUid(uid,"宗族会武参与奖","您参与本次宗族会武活动获得了参与奖励。",guild_pk[defGuildLv]["play"])
						}
					}
				}
				self.redisDao.db.hset(main_name+":history",guildId1,tableIndex)
				if(!npc)
					self.redisDao.db.hset(main_name+":history",guildId2,tableIndex)
			}
		],function(err) {
			console.error(err)
		})
	}
}