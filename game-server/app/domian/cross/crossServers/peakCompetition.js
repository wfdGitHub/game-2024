const peak_cfg = require("../../../../config/gameCfg/peak_cfg.json")
const async = require("async")
//王者巅峰赛
module.exports = function() {
	var self = this
	var totalPlayer = 256
	var curRound = 0			//当前回合
	var totalRound = 8			//总回合
	var state_index = -1		//当前状态index
	var timeList = []			//时间状态
	var state = 0				//当前阶段
	var participants = {}		//参赛者列表
	var parMap = {}				//参赛者映射
	var playerAmount = {} 		//玩家总金额
	var betAmount = {}			//选手下注总金额
	var betInfo = {}			//下注信息
	var runFlag = false			//比赛中
	var look = true				//锁
	//初始化
	this.peakInit = function() {
		async.waterfall([
			function(next) {
				self.redisDao.db.hgetall("cross:peak",function(err,data) {
					if(data.state_index != -1){
						console.log("存在数据 开始初始化")
						curRound = Number(data.curRound)
						state_index = Number(data.state_index)
						state = peak_cfg[state_index]["state"]
						participants = JSON.parse(participants)
						parMap = JSON.parse(parMap)
						timeList = JSON.parse(timeList)
						next()
					}
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:betInfo",function(err,data) {
					if(data){
						betInfo = JSON.parse(Data)
					}
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:playerAmount",function(err,data) {
					if(data){
						playerAmount = JSON.parse(Data)
					}
				})
			},
			function(next) {
				self.redisDao.db.hgetall("cross:peak:betAmount",function(err,data) {
					if(data){
						betAmount = JSON.parse(Data)
						runFlag = true
						look = false
						console.log("初始化完成")
					}
				})
			}
		],function(err) {
			console.error(err)
		})

	}
	//每日刷新
	this.peakDayUpdate = function() {
		if(!runFlag && (new Date()).getDay() == 1){
			this.peakBegin()
		}
	}
	//实时刷新
	this.peakUpdate = function(date) {
		if(runFlag && !look && date.getTime() >= timeList[state_index]){
			// 进入下一阶段
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
		timeList = []
		self.redisDao.db.hdel("cross:peak:fightTeam")
		self.redisDao.db.hdel("cross:peak:betInfo")
		self.redisDao.db.hdel("cross:peak:playerAmount")
		self.redisDao.db.hdel("cross:peak:betAmount")
		self.peakSave()
	}
	this.peakSave = function() {
		var info = {
			curRound:curRound,
			state_index:state_index,
			timeList : JSON.stringify(timeList),
			participants:JSON.stringify(participants),
			parMap:JSON.stringify(parMap)
		}
		self.redisDao.db.hmset("cross:peak",info)
	}
	//新赛季开启
	this.peakBegin = function() {
		console.log("新赛季开启")
		runFlag = true
		var crossUids = []
		var uids = []
		participants = {}
		parMap = {}
		async.waterfall([
			function(next) {
				//获取初始入选玩家
				console.log("获取初始入选玩家")
				self.redisDao.db.zrevrange(["cross:grading:rank",0,-1,"WITHSCORES"],function(err,list) {
					var strList,uid,serverId
					for(var i = 0;i < list.length;i+=2){
						strList = list[i].split("|")
						uid = Number(strList[1])
						if(uid > 10000){
							crossUids.push(list[i])
							uids.push(uid)
						}
						if(crossUids.length >= totalPlayer){
							break
						}
					}
					if(crossUids.length >= totalPlayer){
						crossUids = crossUids.slice(0,255)
						next()
					}else{
						console.log("未满足条件")
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
						count++
						if(count == totalPlayer){
							next()
						}
					})
				}
			},
			function(next) {
				//对阵表
				console.log("crossUids",crossUids)
				crossUids.sort(function(){return Math.random()>0.5?1:-1})
				curRound = 1
				state_index = 0
				state = peak_cfg[state_index]["state"]
				participants[curRound] = []
				parMap[curRound] = {}
				for(var i = 0;i < crossUids.length;i++){
					parMap[curRound][crossUids[i]] = i
				}
				participants[curRound] = crossUids
				timeList = []
				var d = new Date()
				d.setHours(0,0,0,0)
				var zeroTime = d.getTime()
				for(var i in peak_cfg){
					timeList[i] = zeroTime + peak_cfg[i]["value"]
				}
				console.log("timeList",timeList)
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
		betInfo = {}
		self.redisDao.db.hdel("cross:peak:betInfo")
		state_index++
		state = peak_cfg[state_index]["state"]
		self.redisDao.db.hset("cross:peak","state_index",state_index)
		if(state == 3){
			runFlag = false
			self.peakEnd()
		}
	}
	//比赛阶段
	this.peakFight = function() {
		console.log("比赛阶段开始")
		look = true
		var parList = participants[curRound]
		var teamList = {}
		var winners = []
		async.waterfall([
			function(next) {
				//读取双方阵容
				console.log("parList",parList)
				self.redisDao.db.hgetall("cross:peak:fightTeam",function(err,data) {
					for(var i in data){
						teamList[i] = JSON.parse(data[i])
					}
					next()
				})
			},
			function(next) {
				//计算战斗结果
				for(var i = 0;i < parList.length;i += 2){
					var atkTeam = teamList[parList[i]]
					var defTeam = teamList[parList[i+1]]
					var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
					var overInfo = fightContorl.getOverInfo()
					var winner
					console.log("第"+curRound+"轮开始")
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
					console.log(winner+"获胜")
					winners.push(winner)
				}
				next()
			},
			function(next) {
				//结算下注信息
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
					for(var i = 0;i < winners.length;i++){
						parMap[curRound][winners[i]] = i
					}
					participants[curRound] = winners
					look = false
				}
				self.peakSave()
			}
		],function(err) {
			console.error(err)
		})
	}
	//赛季结束
	this.peakEnd = function() {
		look = true
		runFlag = false
		console.log("本赛季结束")
	}
	//获取玩家巅峰赛数据
	this.getPeakData = function(crossUid,cb) {
		
	}
	//获取下注记录

	//获取比赛记录

	//同步阵容
	this.peakSyncFightTeam = function(crossUid,cb) {
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
		if(!parMap[curRound][crossUid]){
			cb(false,"未进入本轮比赛")
			return
		}
		var fightTeam = self.userTeam(crossUid)
		self.redisDao.db.hset("cross:peak:fightTeam",crossUid,JSON.stringify(fightTeam))
		cb(true,fightTeam)
	}
	//下注
	this.peakBetting = function(crossUid,target,bet,cb) {
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
		if(!Number.isInteger(bet)){
			cb(false,"参数错误")
			return
		}
		if(!playerAmount[crossUid] || playerAmount[crossUid] < 1000){
			self.redisDao.db.hset("cross:peak:playerAmount",crossUid,1000)
			playerAmount[crossUid] = 1000
		}
		if(playerAmount[crossUid] < bet){
			cb(false,"金额不足"+playerAmount[crossUid]+"/"+bet)
			return
		}
		if(!parMap[curRound][target]){
			cb(false,"选手不存在")
			return
		}
		betInfo[crossUid] = {target : target,bet : bet}
		self.redisDao.db.hset("cross:peak:betInfo",crossUid,betInfo[crossUid])
		if(!betAmount[target])
			betAmount[target] = 0
		betAmount[target] += bet
		self.redisDao.db.hset("cross:peak:betAmount",target,betAmount[target])
		cb(true,betInfo[crossUid])
	}
	//获取对阵表
}