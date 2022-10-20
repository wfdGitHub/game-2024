//战区设置
const async = require("async")
const util = require("../../../../util/util.js")
const activeNum = 150    //活跃人数
const deployDay = 14 	 //战区划分时间
module.exports = function() {
	var self = this
	this.theatreMap = {}
	this.theatreList = []
	//战区初始化
	this.theatreInit = function() {
		self.redisDao.db.hgetall("game:theatre",function(err,data) {
			if(data && data.theatreMap)
				self.theatreMap = JSON.parse(data.theatreMap)
			if(data && data.theatreList)
				self.theatreList = JSON.parse(data.theatreList)
			console.log("战区初始化",self.theatreMap,self.theatreList)
			self.crossModeInit(self.theatreList.length)
		})
	}
	//各玩法模块初始化
	this.crossModeInit = function(theatreNum) {
		if(theatreNum < 1)
			theatreNum = 1
		self.peakInit(theatreNum)
		self.gradingInit(theatreNum)
		self.ancientInit(theatreNum)
		self.muyeInit(theatreNum)
	}
	//战区每日首次更新
	this.theatreDayUpdate = function() {
		self.redisDao.db.hget("game:theatre","deploy",function(err,data) {
			var deploy = Number(data) || 0
			if(new Date().getDay() == 1 && util.getTimeDifference(deploy,Date.now()) >= deployDay) {
				self.redisDao.db.hset("game:theatre","deploy",Date.now())
				setTimeout(function() {
					self.theatreDeploy()
				},15000)
			}
		})
	}
	//战区分配
	this.theatreDeploy = function() {
		console.log("战区分配")
		var worldLevels = []
		var areaActives = {}
		async.waterfall([
			function(next) {
				//获取世界等级
				self.redisDao.db.zrange("game:worldLevels",0,-1,function(err,data) {
					for(var i = 0;i < data.length;i ++){
						worldLevels.push(Number(data[i]))
					}
					console.log("worldLevels",worldLevels)
					next()
				})
			},
			function(next) {
				//获取活跃人数
				self.redisDao.db.hgetall("game:areaActives",function(err,data) {
					areaActives = data || {}
					for(var i in areaActives)
						areaActives[i] = Number(areaActives[i])
					console.log("areaActives",areaActives)
					next()
				})
			},
			function(next) {
				//根据世界等级自上而下  每一定人数分配一个战区
				self.theatreMap = {}
				self.theatreList = []
				var theatres = []
				var curNum = 0
				var beginArea = 0
				for(var i = 0;i < worldLevels.length;i++){
					curNum += areaActives[worldLevels[i]] || 0
					console.log(i,worldLevels[i],curNum)
					if(i == worldLevels.length - 1){
						var lastId = self.theatreList.length > 0 ? self.theatreList.length - 1 : 0
						var list = []
						for(var j = beginArea;j <= i;j++){
							self.theatreMap[worldLevels[j]] = lastId
							list.push(worldLevels[j])
						}
						if(!self.theatreList[lastId])
							self.theatreList[lastId] = []
						self.theatreList[lastId] = self.theatreList[lastId].concat(list)
						break
					}else if(curNum >= activeNum){
						var list = []
						for(var j = beginArea;j <= i;j++){
							self.theatreMap[worldLevels[j]] = self.theatreList.length
							list.push(worldLevels[j])
						}
						self.theatreList.push(list)
						curNum = 0
						beginArea = i + 1
					}
				}
				self.redisDao.db.hset("game:theatre","theatreMap",JSON.stringify(self.theatreMap))
				self.redisDao.db.hset("game:theatre","theatreList",JSON.stringify(self.theatreList))
				self.crossModeInit(self.theatreList.length)
				next()
			},
			function(next) {
				self.redisDao.db.hgetall("area:finalServerMap",function(err,finalServerMap) {
					next(null,finalServerMap || {})
				})
			},
			function(finalServerMap,next) {
				//重设realRank
				self.redisDao.db.zrange("cross:grading:realRank",0,-1,"WITHSCORES",function(err,list) {
					if(!list)
						list = []
					var newRankLists = {}
					for(var i = 0;i < self.theatreList.length;i++)
						newRankLists[i] = []
					var strList,areaId
					var rankInfos = []
					for(var i = 0;i < list.length;i+=2){
						strList = list[i].split("|")
						areaId = Number(strList[0])
						areaId = self.theatreMap[finalServerMap[areaId]] || 0
						newRankLists[areaId].push(Number(list[i+1]),list[i])
					}
					for(var i = 0;i < self.theatreList.length;i++){
						self.newGrading(i,newRankLists[i])
					}
				})
			}
		],function(err) {
			console.error(err)
		})
	}
}