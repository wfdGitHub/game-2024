var checkpointsCfg = require("../../../../config/gameCfg/checkpoints.json")
module.exports = function() {
	//获取BOSS挑战信息
	this.getCheckpointsInfo = function(uid,cb) {
		this.getPlayerData(uid,"boss",function(data) {
			data = Number(data)
			if(!data){
				data = 0
			}
			cb(data)
		})
	}
	//挑战BOSS成功
	this.checkpointsSuccess = function(uid,level,cb) {
		console.log("checkpointsSuccess")
		this.incrbyPlayerData(uid,"boss",1)
		var awardStr = checkpointsCfg[level].award
		if(awardStr){
			this.addItemStr(uid,awardStr)
		}
	}
	//挑战BOSS失败
	this.checkpointsFail = function(uid,level,cb) {
		console.log("checkpointsFail")
	}
	//挑战BOSS结果
	this.checkpointsResult = function(uid,result,level,cb) {
		if(result.result == "win"){
			this.checkpointsSuccess(uid,level,cb)
		}else{
			this.checkpointsFail(uid,level,cb)
		}
	}
	//开始挑战关卡
	this.challengeCheckpoints = function(uid,otps,cb) {
		var self = this
		self.getCheckpointsInfo(uid,function(level) {
			level += 1
		    if(!checkpointsCfg[level]){
		    	console.log("challengeCheckpoints level error : ",level)
		      	cb(false)
		      	return
		    }
		    if(!self.players[uid]){
		    	cb(false,"userInfo error")
		    	return
		    }
		    var atkTeam = self.getFightTeam(uid)
		    if(!atkTeam){
		    	cb(false,"atkTeam error")
		    	return
		    }
		    var defTeam = [{characterId : checkpointsCfg[level].bossId,level : checkpointsCfg[level].bossLevel}]
		    if(checkpointsCfg[level].mon_list){
		      var monList = JSON.parse(checkpointsCfg[level].mon_list)
		      monList.forEach(function(characterId) {
		        defTeam.push({characterId,characterId,level : checkpointsCfg[level].mobLevel})
		      })
		    }
		    self.redisDao.db.hset("test:fight","atkTeam",JSON.stringify(atkTeam))
		    self.redisDao.db.hset("test:fight","defTeam",JSON.stringify(defTeam))
		    self.redisDao.db.hset("test:fight","seededNum",otps.seededNum)
		    self.redisDao.db.hset("test:fight","readList",JSON.stringify(otps.readList))
		    var result = self.fightContorl.fighting(atkTeam,defTeam,otps.seededNum,otps.readList)
		    if(result.verify === otps.verify){
		    	self.checkpointsResult(uid,result,level)
		    	if(result.result === "win"){
		    		cb(true,{award : checkpointsCfg[level].award})
		    	}else{
		    		cb(true)
		    	}
		    }else{
		    	console.log(otps.verify,result.verify)
		    	cb(false,"verify fail")
		    }
		})
	}
	//获取挂机奖励
	this.getOnhookAward = function(uid,power,cb) {
		var self = this
		self.getPlayerData(uid,"onhookLastTime",function(onhookLastTime) {
			var curTime = Date.now()
			var tmpTime = Math.floor((curTime - onhookLastTime) / (60 * 1000))
			// console.log("tmpTime ",tmpTime)
			if(tmpTime < 5){
				cb(false,"time is too short "+tmpTime)
			  	return
			}
			self.getCheckpointsInfo(uid,function(level) {
				if(!checkpointsCfg[level]){
					cb(false,"level config error "+level)
					return
				}
			  	self.incrbyPlayerData(uid,"onhookLastTime",tmpTime * 60 * 1000)
			  	var awardTime = tmpTime
			  	if(awardTime > 1440){
			  		awardTime = 1440
			  	}
			  	var on_hook_award = checkpointsCfg[level].on_hook_award
			  	// console.log("on_hook_award ",on_hook_award)
			  	var rate = (awardTime * power) / 60 
			  	// console.log("rate ",rate,"awardTime ",awardTime)
			  	self.addItemStr(uid,on_hook_award,rate)
			  	cb(true,{allTime : tmpTime,awardTime : awardTime})
			})
		})
	}
}