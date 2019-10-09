//竞技场
var correctNumerator = 5			//修正值
var correctDenominator = 25			//宽度值
var addOneLv = 50					//排名在此以内使用当前排名+1
var dayCount = 5					//每日挑战次数
var mainName = "arena"
var listRank = []
for(var i = 1;i <= 20;i++){
	listRank.push(i)
}
module.exports = function() {
	var self = this
	var local = {}
	//匹配规则  计算目标列表
	local.calRankTargets = function(rank) {
		var lenght = 1
		if(rank > addOneLv){
			lenght = Math.ceil((rank + correctNumerator) / correctDenominator)
		}
		var list = []
		for(var i = 1;i <= 4;i++){
			var tail =  rank - (lenght * (i - 1)) - 1
			var head = rank - (lenght * i)
			var rand = Math.floor(head + Math.random() * (tail - head))
			if(rand >= 1)
				list.push(rand)
		}
		console.log("list",list)
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
			console.log(err,"rank : ",rank)
			var info = {
				rank : rank,
				count : dayCount,
				highestRank : rank,
			}
			self.setHMObj(uid,mainName,info)
			self.redisDao.db.hset("area:area"+self.areaId+":"+mainName,1,JSON.stringify({uid : uid,sex : sex,name : name}))
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
			console.log("rank",rank)
			var list = local.calRankTargets(rank)
			console.log("list",list)
			local.getTargetsInfo(list,cb)
		})
	}
}