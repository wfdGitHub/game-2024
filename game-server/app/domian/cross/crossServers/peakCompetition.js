const peak_cfg = require("../../../../config/gameCfg/peak_cfg.json")
const peak_award = require("../../../../config/gameCfg/peak_award.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const async = require("async")
//王者巅峰赛
module.exports = function() {
	var self = this
	var totalPlayer = 128
	var curRound = 0			//当前回合
	var state_index = -1		//当前状态index
	var timeList = []			//时间状态
	var state = 0				//当前阶段
	var participants = {}		//参赛者列表
	var parMap = {}				//参赛者映射
	var parInfoMap = {}			//参赛者信息
	var playerAmount = {} 		//玩家总金额
	var betAmount = {}			//选手下注总金额
	var betInfo = {}			//下注信息
	var roundTeam = {}			//当前对战阵容
	var winners = {}			//胜利方
	var runFlag = false			//比赛中
	var honorList = []			//荣誉榜
	var likeMap = {}			//点赞榜
	var likeUsers = {}			//今日点赞
	var honorMathch = {}		//历史八强
	var look = true				//锁
	var baseScore = 1000		//初始分数
	var timeMap = {}			//刷新冷却
	//初始化
	this.peakInit = function() {
		async.waterfall([
			function(next) {
				self.redisDao.db.hgetall("cross:peak",function(err,data) {
					if(data && data.state_index != -1){
						console.log("存在数据 开始初始化")
						curRound = Number(data.curRound)
						state_index = Number(data.state_index)
						state = peak_cfg[state_index]["state"]
						if(data.participants)
							participants = JSON.parse(data.participants)
						if(data.parMap)
							parMap = JSON.parse(data.parMap)
						if(data.timeList)
							timeList = JSON.parse(data.timeList)
						if(data.winners)
							winners = JSON.parse(data.winners)
						if(data.honorList)
							honorList = JSON.parse(data.honorList)
						if(data.honorMathch)
							honorMathch = JSON.parse(data.honorMathch)
						next()
					}else{
						look = false
					}
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:betInfo",function(err,data) {
					if(data){
						for(var i in data){
							data[i] = JSON.parse(data[i])
						}
						betInfo = data
					}
					next()
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:playerAmount",function(err,data) {
					if(data){
						for(var i in data){
							data[i] = Number(data[i])
						}
						playerAmount = data
					}
					next()
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:likeMap",function(err,data) {
					if(data){
						for(var i in data){
							data[i] = Number(data[i])
						}
						likeMap = data
					}
					next()
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:roundTeam",function(err,data) {
					if(data){
						for(var i in data){
							data[i] = JSON.parse(data[i])
						}
						roundTeam = data
					}
					next()
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:parInfoMap",function(err,data) {
					if(data){
						parInfoMap = data
					}
					next()
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:betAmount",function(err,data) {
					if(data){
						for(var i in data){
							data[i] = Number(data[i])
						}
						betAmount = data
					}
					if(state == 1 || state == 2)
						runFlag = true
					else
						runFlag = false
					look = false
					console.log("巅峰赛初始化完成")
					self.peakDayUpdate()
				})
			}
		],function(err) {
			console.error(err)
		})
	}
	//每日刷新
	this.peakDayUpdate = function() {
		console.log("peakDayUpdate runFlag ",runFlag,(new Date()).getDay())
		likeUsers = {}
		timeMap = {}
		if(!runFlag && (new Date()).getDay() == 1){
			this.peakBegin()
		}
	}
	//实时刷新
	this.peakUpdate = function(date) {
		if(runFlag && !look && date.getTime() >= timeList[state_index+1]){
			console.log("peakUpdate",date.getTime(),timeList[state_index+1])
			// 进入下一阶段
			this.peakNextState()
		}
	}
	this.peakNextState = function() {
		if(look)
			return
		switch(state){
			case 1:
				//进入下注
				self.peakBetting()
			break
			case 2:
				//开始比赛
				self.peakFight()
			break
		}
	}
	//数据初始化
	this.peakArgInit = function() {
		curRound = 0			//当前回合
		state_index = -1		//当前阶段
		state = 0				//当前状态 0 未开赛  1 布阵阶段 2 下注阶段 3 比赛已结束
		participants = {}		//参赛者列表
		parMap = {}				//参赛者映射
		playerAmount = {}
		betInfo = {}
		betAmount = {}
		parInfoMap = {}
		winners = {}
		timeList = []
		self.redisDao.db.del("cross:peak:parInfoMap")
		self.redisDao.db.del("cross:peak:fightTeam")
		self.redisDao.db.del("cross:peak:betInfo")
		self.redisDao.db.del("cross:peak:playerAmount")
		self.redisDao.db.del("cross:peak:betAmount")
		for(var i = 1;i <= 7;i++){
			self.redisDao.db.del("cross:peak:matchHistory:"+i)
			self.redisDao.db.del("cross:peak:betHistory:"+i)
		}
		self.peakSave()
	}
	this.peakSave = function() {
		var info = {
			curRound:curRound,
			state_index:state_index,
			timeList : JSON.stringify(timeList),
			participants:JSON.stringify(participants),
			parMap:JSON.stringify(parMap),
			winners : JSON.stringify(winners)
		}
		self.redisDao.db.hmset("cross:peak",info)
	}
	//新赛季开启
	this.peakBegin = function() {
		console.log("新赛季开启")
		runFlag = true
		likeUsers = {}
		var crossUids = []
		var uids = []
		var areaIds = []
		async.waterfall([
			function(next) {
				//旧赛季处理
				//赛季前四记录
				if(winners[6] && winners[7]){
					var better = []
					for(var i in winners[6]){
						if(winners[6][i] != i){
							better.push(i)
						}
					}
					for(var i in winners[7]){
						if(winners[7][i] != i){
							better.push(i)
							better.push(winners[7][i])
						}
					}
					for(var i = 0;i < better.length;i++){
						better[i] = {crossUid:better[i],info:parInfoMap[better[i]]}
					}
					honorList = better
					self.redisDao.db.hset("cross:peak","honorList",JSON.stringify(honorList))
					var data = {}
					for(var i = 5;i <= 7;i++){
						if(winners[i]){
							data[i] = []
							for(var j = 0;j < participants[i].length;j += 2){
								var info = {}
								var rand = Math.floor(j/2)
								info.round = i
								info.atk = participants[i][rand*2]
								info.def = participants[i][rand*2 + 1]
								info.atkInfo = parInfoMap[info.atk]
								info.atkAmount = betAmount[info.atk]
								info.atkTeam = roundTeam[info.atk]
								info.defInfo = parInfoMap[info.def]
								info.defAmount = betAmount[info.def]
								info.defTeam = roundTeam[info.def]
								info.winner = winners[i][info.atk]
								data[i].push(info)
							}
						}
					}
					honorMathch = data
					self.redisDao.db.hset("cross:peak","honorMathch",JSON.stringify(honorMathch))
					var count = 0
					for(let j = 5;j <= 7;j++){
						self.redisDao.db.hgetall("cross:peak:matchHistory:"+j,function(err,data) {
							self.redisDao.db.hmset("cross:peak:honorHistory:"+j,data)
							count++
							if(count == 3){
								next()
							}
						})
					}
				}else{
					next()
				}
			},
			function(next) {
				//获取初始入选玩家
				participants = {}
				parMap = {}
				self.peakArgInit()
				console.log("获取初始入选玩家")
				self.redisDao.db.zrevrange(["cross:grading:realRank",0,-1,"WITHSCORES"],function(err,list) {
					var strList,uid,areaId
					for(var i = 0;i < list.length;i+=2){
						strList = list[i].split("|")
						areaId = Number(strList[0])
						uid = Number(strList[1])
						crossUids.push(list[i])
						areaIds.push(areaId)
						uids.push(uid)
						if(crossUids.length >= totalPlayer){
							break
						}
					}
					if(crossUids.length >= totalPlayer){
						crossUids = crossUids.slice(0,totalPlayer)
						uids = uids.slice(0,totalPlayer)
						areaIds = areaIds.slice(0,totalPlayer)
						next()
					}else{
						next("未满足条件")
					}
				})
			},
            function(next) {
                //同步初始阵容
                var count = 0
                for(let i = 0;i < uids.length;i++){
                    self.getDefendTeam(uids[i],function(data) {
                        if(!data){
                            console.error("获取阵容失败 "+uids[i])
                            data = [0,0,0,0,0,0]
                        }
                        self.redisDao.db.hset("cross:peak:fightTeam",crossUids[i],JSON.stringify(data))
                        roundTeam[crossUids[i]] = data
                        count++
                        if(count == totalPlayer){
                            next()
                        }
                    })
                }
            },
			function(next) {
				//同步名称
				parInfoMap = {}
				self.getPlayerInfoByUids(areaIds,uids,function(list) {
					for(var i = 0;i < list.length;i++){
						parInfoMap[crossUids[i]] = JSON.stringify(list[i])
					}
					self.redisDao.db.hmset("cross:peak:parInfoMap",parInfoMap)
					next()
				})
			},
			function(next) {
				//对阵表
				curRound = 1
				state_index = 0
				state = peak_cfg[state_index]["state"]
				participants[curRound] = []
				parMap[curRound] = {}
				//初始奖励邮件
               for(var i = 0;i < uids.length;i++){
               		self.sendMailByUid(uids[i],peak_award[curRound]["exalt_title"],peak_award[curRound]["exalt_text"],peak_award[curRound]["exalt_award"])
                }
				crossUids.sort(function(){return Math.random()>0.5?1:-1})
				for(var i = 0;i < crossUids.length;i++){
					parMap[curRound][crossUids[i]] = i
				}
				participants[curRound] = crossUids
				timeList = []
				var d = new Date()
				d.setHours(0,0,0,0)
				var oneDayLong = 24*60*60*1000 ;//一天的毫秒数
				var zeroTime = d.getTime() - oneDayLong * d.getDay() || 7
				for(var i in peak_cfg){
					timeList[i] = zeroTime + peak_cfg[i]["value"]
				}
				look = false
				self.peakSave()
			}
		],function(err) {
			console.error(err)
			self.peakArgInit()
		})
	}
	//下注阶段
	this.peakBetting = function() {
		console.log("下注阶段开始")
		look = true
		betInfo = {}
		self.redisDao.db.del("cross:peak:betInfo")
		self.redisDao.db.hgetall("cross:peak:fightTeam",function(err,data) {
			roundTeam = {}
			for(var i in data){
				roundTeam[i] = JSON.parse(data[i])
			}
			self.redisDao.db.hmset("cross:peak:roundTeam",data)
			state_index++
			state = peak_cfg[state_index]["state"]
			self.redisDao.db.hset("cross:peak","state_index",state_index)
			look = false
			if(state == 3){
				runFlag = false
				self.peakEnd()
			}
		})
	}
	//比赛阶段
	this.peakFight = function() {
		console.time("peakFight")
		console.log("比赛阶段开始")
		look = true
		var parList = participants[curRound]
		var tmpWins = []
		var winMaps = {}
		async.waterfall([
			function(next) {
				//计算战斗结果
				var matchHistory = {}
				winners[curRound] = {}
				for(var i = 0;i < parList.length;i += 2){
					var atkTeam = roundTeam[parList[i]]
					var defTeam = roundTeam[parList[i+1]]
					var seededNum = Date.now()
					var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
					var overInfo = self.fightContorl.getOverInfo()
					var winner
					if(overInfo.roundEnd){
						if(overInfo.atkDamage > overInfo.defDamage){
							winner = parList[i]
						}else{
							winner = parList[i+1]
						}
					}else{
						if(winFlag){
							winner = parList[i]
						}else{
							winner = parList[i+1]
						}
					}
					var info = {
						atkInfo : parInfoMap[parList[i]],
						defInfo : parInfoMap[parList[i+1]],				
						atkTeam : atkTeam,
						defTeam : defTeam,
						atkAmount : betAmount[parList[i]],
						defAmount : betAmount[parList[i+1]],
						seededNum : seededNum,
						winner : winner
					}
					if(winner == parList[i])
						info.winFlag = true
					else
						info.winFlag = false
					winners[curRound][parList[i]] = winner
					winners[curRound][parList[i+1]] = winner
					matchHistory[parList[i]] = JSON.stringify(info)
					matchHistory[parList[i+1]] = matchHistory[parList[i]]
					winMaps[winner] = true
					tmpWins.push(winner)
					//奖励
					if(parList[i] == winner){
						self.sendMailByUid(parList[i].split("|")[1],peak_award[curRound+1]["exalt_title"],peak_award[curRound+1]["exalt_text"],peak_award[curRound+1]["exalt_award"])
						self.sendMailByUid(parList[i+1].split("|")[1],peak_award[curRound]["stop_title"],peak_award[curRound]["stop_text"],peak_award[curRound]["stop_award"])
					}else{
						self.sendMailByUid(parList[i+1].split("|")[1],peak_award[curRound+1]["exalt_title"],peak_award[curRound+1]["exalt_text"],peak_award[curRound+1]["exalt_award"])
						self.sendMailByUid(parList[i].split("|")[1],peak_award[curRound]["stop_title"],peak_award[curRound]["stop_text"],peak_award[curRound]["stop_award"])
					}
				}
				self.redisDao.db.hmset("cross:peak:matchHistory:"+curRound,matchHistory)
				next()
			},
			function(next) {
				//结算下注信息
				var flag = false
				for(var i in betInfo){
					flag = true
					var uid = i.split("|")[1]
					if(winMaps[betInfo[i].target]){
						betInfo[i].win = true
						playerAmount[i] += betInfo[i].bet
						//竞猜正确邮件
						self.sendMailByUid(uid,default_cfg["peak_bet_right_title"]["value"],default_cfg["peak_bet_right_text"]["value"],default_cfg["peak_bet_right_atts"]["value"])
					}else{
						betInfo[i].win = false
						playerAmount[i] -= betInfo[i].bet
						//竞猜错误邮件
						self.sendMailByUid(uid,default_cfg["peak_bet_wrong_title"]["value"],default_cfg["peak_bet_wrong_text"]["value"],default_cfg["peak_bet_wrong_atts"]["value"])
					}
					betInfo[i] = JSON.stringify(betInfo[i])
				}
				if(flag){
					self.redisDao.db.hmset("cross:peak:betHistory:"+curRound,betInfo)
					self.redisDao.db.hmset("cross:peak:playerAmount",playerAmount)
					betInfo = {}
					self.redisDao.db.del("cross:peak:betInfo")
				}
				next()
			},
			function(next) {
				state_index++
				state = peak_cfg[state_index]["state"]
				if(state == 3){
					self.peakEnd()
				}else{
					//进入下一轮
					curRound++
					parMap[curRound] = {}
					for(var i = 0;i < tmpWins.length;i++){
						parMap[curRound][tmpWins[i]] = i
					}
					participants[curRound] = tmpWins
					look = false
				}
				self.peakSave()
				console.timeEnd("peakFight")
			}
		],function(err) {
			console.error(err)
		})
	}
	//赛季结束
	this.peakEnd = function() {
		runFlag = false
		console.log("本赛季结束")
		//王者币奖励
		for(var crossUid in playerAmount){
			if(playerAmount[crossUid])
				self.sendMailByUid(crossUid.split("|")[1],"王者巅峰赛积分奖励","亲爱的玩家，您在王者巅峰赛中的金币已等比转换为王者币，祝您游戏愉快","211:"+playerAmount[crossUid])
		}
	}
	//获取玩家巅峰赛数据
	this.getPeakData = function(crossUid,cb) {
		var info = {}
		info.curRound = curRound
		info.rank = -1
		info.state = state
		info.timeEnd = timeList[state_index+1]
		if(parMap[curRound] && parMap[curRound][crossUid] != undefined){
			var rand = Math.floor(parMap[curRound][crossUid] / 2)
			info.atk = participants[curRound][rand*2]
			info.def = participants[curRound][rand*2 + 1]
			info.atkInfo = parInfoMap[info.atk]
			info.atkAmount = betAmount[info.atk]
			info.defInfo = parInfoMap[info.def]
			info.defAmount = betAmount[info.def]
			info.myTeam = roundTeam[crossUid]
			info.atkTeam = roundTeam[info.atk]
			info.defTeam = roundTeam[info.def]
		}
		if(state > 0 && state < 3 && (!playerAmount[crossUid] || playerAmount[crossUid] < baseScore)){
			playerAmount[crossUid] = baseScore
			self.redisDao.db.hset("cross:peak:playerAmount",crossUid,baseScore)
		}
		info.amount = playerAmount[crossUid]
		info.honorList = honorList
		info.likeList = []
		for(var i = 0;i < honorList.length;i++){
			info.likeList.push(likeMap[honorList[i]["crossUid"]] || 0)
		}
		info.likeInfo = likeUsers[crossUid] || {}
		self.redisDao.db.zrevrank(["cross:grading:realRank",crossUid],function(err,rank) {
			if(rank != null)
				info.rank = Number(rank) + 1
			cb(true,info)
		})
	}
	//同步阵容
	this.peakSyncFightTeam = function(crossUid,uid,cb) {
		if(!runFlag){
			cb(false,"不在比赛时间")
			return
		}
		if(look){
			cb(false)
			return
		}
		if(state !== 1){
			cb(false,"不在布阵阶段")
			return
		}
		if(parMap[curRound][crossUid] == undefined){
			cb(false,"未进入本轮比赛")
			return
		}
		self.getDefendTeam(uid,function(data){
			if(!data){
				cb(false,"获取阵容失败")
			}else{
				roundTeam[crossUid] = data
				self.redisDao.db.hset("cross:peak:fightTeam",crossUid,JSON.stringify(data))
				cb(true,data)
			}
		})
	}
	//获取对阵选手信息
	this.getPeakParticipantsInfo = function(crossUid,cb) {
		if(!runFlag){
			cb(false,"不在比赛时间")
			return
		}
		if(look){
			cb(false)
			return
		}
		if(state !== 2){
			cb(false,"不在下注阶段")
			return
		}
		if(timeMap[crossUid] && timeMap[crossUid] > Date.now()){
			cb(false,"刷新过快")
			return
		}
		timeMap[crossUid] = Date.now() + 10000
		var rand = Math.floor(Math.random() * participants[curRound].length / 2)
		var info = {
			atk : participants[curRound][rand*2],
			def : participants[curRound][rand*2 + 1],
		}
		info.atkInfo = parInfoMap[info.atk]
		info.atkAmount = betAmount[info.atk]
		info.atkTeam = roundTeam[info.atk]
		info.defInfo = parInfoMap[info.def]
		info.defAmount = betAmount[info.def]
		info.defTeam = roundTeam[info.def]
		cb(true,info)
	}
	//下注
	this.peakUserBetting = function(crossUid,target,bet,cb) {
		if(!runFlag){
			cb(false,"不在比赛时间")
			return
		}
		if(look){
			cb(false)
			return
		}
		if(state !== 2){
			cb(false,"不在下注阶段")
			return
		}
		if(betInfo[crossUid]){
			cb(false,"本轮已下注")
			return
		}
		if(!Number.isInteger(bet) || bet <= 0){
			cb(false,"参数错误")
			return
		}
		if(!playerAmount[crossUid] || playerAmount[crossUid] < baseScore){
			playerAmount[crossUid] = baseScore
			self.redisDao.db.hset("cross:peak:playerAmount",crossUid,baseScore)
		}
		if(playerAmount[crossUid] < bet){
			cb(false,"金额不足"+playerAmount[crossUid]+"/"+bet)
			return
		}
		if(parMap[curRound][target] === undefined){
			console.log("选手不存在 ",target,curRound,parMap[curRound])
			cb(false,"选手不存在")
			return
		}
		betInfo[crossUid] = {target : target,bet : bet}
		self.redisDao.db.hset("cross:peak:betInfo",crossUid,JSON.stringify(betInfo[crossUid]))
		if(!betAmount[target])
			betAmount[target] = 0
		betAmount[target] += bet
		self.redisDao.db.hset("cross:peak:betAmount",target,betAmount[target])
		self.taskUpdate(crossUid,"peak_bet",1)
		cb(true,betInfo[crossUid])
	}
	//获取当前下注信息
	this.getPeakBetInfo = function(crossUid,cb) {
		var info = {}
		//本轮下注信息
		if(betInfo[crossUid]){
			var rand = parMap[curRound][betInfo[crossUid].target]
			if(rand != undefined){
				rand = Math.floor(rand/2)
				info.atk = participants[curRound][rand*2]
				info.def = participants[curRound][rand*2 + 1]
				info.atkInfo = parInfoMap[info.atk]
				info.atkAmount = betAmount[info.atk]
				info.atkTeam = roundTeam[info.atk]
				info.defInfo = parInfoMap[info.def]
				info.defAmount = betAmount[info.def]
				info.defTeam = roundTeam[info.def]
			}
			info.target = betInfo[crossUid].target
			info.bet = betInfo[crossUid].bet
		}
		cb(true,info)
	}
	//查询历史下注信息
	this.getPeakBetHistory = function(crossUid,cb) {
		if(curRound <= 1){
			cb(true,[])
		}else{
			var multiList = []
			for(var i = 1;i <= curRound;i++){
				multiList.push(["hget","cross:peak:betHistory:"+i,crossUid])
			}
			this.redisDao.multi(multiList,function(err,list) {
				if(err){
					cb(true,[])
				}else{
					var data = []
					for(var i = 0;i < list.length;i++){
						if(list[i]){
							var info = JSON.parse(list[i])
							info.round = i+1
							var rand = parMap[info.round][info.target]
							rand = Math.floor(rand/2)
							info.atk = participants[info.round][rand*2]
							info.def = participants[info.round][rand*2 + 1]
							info.atkInfo = parInfoMap[info.atk]
							info.atkAmount = betAmount[info.atk]
							info.defInfo = parInfoMap[info.def]
							info.defAmount = betAmount[info.def]
							info.winner = winners[info.round][info.atk]
							data.push(info)
						}

					}
					cb(true,data)
				}
			})
		}
	}
	//查看指定比赛记录
	this.getPeakMatchHistory = function(crossUid,round,target,cb) {
		if(!Number.isInteger(round) || !parInfoMap[target]){
			cb(false,"参数错误")
			return
		}
		self.redisDao.db.hget("cross:peak:matchHistory:"+round,target,function(err,data) {
			cb(true,data)
		})
	}
	//查看历史指定比赛记录
	this.getPeakHonorHistory = function(crossUid,round,target,cb) {
		if(!Number.isInteger(round)){
			cb(false,"参数错误")
			return
		}
		self.redisDao.db.hget("cross:peak:honorHistory:"+round,target,function(err,data) {
			cb(true,data)
		})
	}
	//获取我的比赛记录
	this.getPeakMyMatch = function(crossUid,cb) {
		if(!parInfoMap[crossUid]){
			cb(false,"未进入本次比赛")
			return
		}
		if(curRound <= 1){
			cb(true,[])
			return
		}
		var data = []
		for(var i = 1;i <= curRound;i++){
			var rand = parMap[i][crossUid]
			if(winners[i] && rand != undefined){
				rand = Math.floor(rand/2)
				var info = {}
				info.round = i
				info.atk = participants[i][rand*2]
				info.def = participants[i][rand*2 + 1]
				info.atkInfo = parInfoMap[info.atk]
				info.atkAmount = betAmount[info.atk]
				info.atkTeam = roundTeam[info.atk]
				info.defInfo = parInfoMap[info.def]
				info.defAmount = betAmount[info.def]
				info.defTeam = roundTeam[info.def]
				info.winner = winners[i][info.atk]
				data.push(info)
			}else{
				break
			}
		}
		cb(true,data)
	}
	//获取小组赛记录
	this.getPeakGrounpHistory = function(num,cb) {
		if(curRound < 2){
			cb(true,[])
			return
		}
		var maxNum = curRound
		if(maxNum > 4)
			maxNum = 4
		var data = {}
		var begin = num * 16
		var end = (num + 1) * 16
		for(var i = 1;i <= maxNum;i++){
			data[i] = []
			for(var j = begin;j < end;j += 2){
				var info = {}
				var rand = Math.floor(j/2)
				info.round = i
				info.atk = participants[i][rand*2]
				info.def = participants[i][rand*2 + 1]
				info.atkInfo = parInfoMap[info.atk]
				info.atkAmount = betAmount[info.atk]
				info.defInfo = parInfoMap[info.def]
				info.defAmount = betAmount[info.def]
				if(winners[i])
					info.winner = winners[i][info.atk]
				data[i].push(info)
			}
			begin = begin / 2
			end = end / 2
			if(!winners[i])
				break
		}
		cb(true,data)
	}
	//获取本赛季八强记录
	this.getPeakBetterHistory = function(crossUid,cb) {
		if(curRound < 5){
			cb(true,[])
			return
		}
		var data = {}
		for(var i = 5;i <= curRound;i++){
			data[i] = []
			for(var j = 0;j < participants[i].length;j += 2){
				var info = {}
				var rand = Math.floor(j/2)
				info.round = i
				info.atk = participants[i][rand*2]
				info.def = participants[i][rand*2 + 1]
				info.atkInfo = parInfoMap[info.atk]
				info.atkAmount = betAmount[info.atk]
				info.defInfo = parInfoMap[info.def]
				info.defAmount = betAmount[info.def]
				if(winners[i])
					info.winner = winners[i][info.atk]
				data[i].push(info)
			}
			if(!winners[i])
				break
		}
		cb(true,data)
	}
	//点赞
	this.peakLike = function(crossUid,index,cb) {
		if(!likeUsers[crossUid])
			likeUsers[crossUid] = {}
		if(!honorList[index]){
			cb(false,"目标不存在")
			return
		}
		if(likeUsers[crossUid][index]){
			cb(false,"今日已点赞")
			return
		}
		likeUsers[crossUid][index] = 1
		var target = honorList[index]["crossUid"]
		if(!likeMap[target])
			likeMap[target] = 0
		likeMap[target]++
		self.redisDao.db.hincrby("cross:peak:likeMap",target,1)
		self.addItemStr(crossUid,"201:20000",1,"巅峰点赞",function(flag,data) {
			cb(flag,data)
		})
	}
	//获取上一赛季比赛记录
	this.getHonorMathch = function(crossUid,cb) {
		cb(true,honorMathch)
	}
}