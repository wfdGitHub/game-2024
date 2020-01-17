var checkpointsCfg = require("../../../../config/gameCfg/checkpoints.json")
var checkpoints_task = require("../../../../config/gameCfg/checkpoints_task.json")
var async = require("async")
module.exports = function() {
	var self = this
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
	this.checkpointsSuccess = function(uid,level) {
		console.log("checkpointsSuccess")
		this.incrbyPlayerData(uid,"boss",1)
		var awardStr = checkpointsCfg[level].award
		if(awardStr){
			return this.addItemStr(uid,awardStr)
		}
		return []
	}
	//挑战BOSS失败
	this.checkpointsFail = function(uid,level,cb) {
		console.log("checkpointsFail")
	}
	//开始挑战关卡
	this.challengeCheckpoints = function(uid,verify,cb) {
		var level = 0
		async.waterfall([
			function(next) {
				//获取当前关卡
				self.getCheckpointsInfo(uid,function(curLevel) {
					level = curLevel + 1
					if(!checkpointsCfg[level])
						next("checkpointsCfg error "+level)
					else
						next()
				})
			},
			function(next) {
				//判断主角等级
				self.getLordLv(uid,function(lv) {
					if(lv < checkpointsCfg[level].lev_limit){
						next("等级限制")
					}else{
						next()
					}
				})
			},
			function(next) {
				let fightInfo = self.getFightInfo(uid)
				if(!fightInfo){
					next("未准备")
					return
				}
			    let atkTeam = fightInfo.team
			    let seededNum = fightInfo.seededNum
			    let defTeam = []
			    let mon_list = JSON.parse(checkpointsCfg[level].mon_list)
			    for(let i = 0;i < 6;i++){
			    	if(mon_list[i]){
				    	let enemy = {id : mon_list[i],lv : checkpointsCfg[level].mobLevel,ad : checkpointsCfg[level].mobAd,star : checkpointsCfg[level].star}
				    	if(checkpointsCfg[level].equip){
				    		enemy["equip_1"] = checkpointsCfg[level].equip
				    		enemy["equip_2"] = checkpointsCfg[level].equip
				    		enemy["equip_3"] = checkpointsCfg[level].equip
				    		enemy["equip_4"] = checkpointsCfg[level].equip
				    	}
				    	defTeam.push(enemy)
			    	}else{
			    		defTeam.push(0)
			    	}
			    }
			    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    if(verify !== JSON.stringify(self.fightContorl.getFightRecord()[0])){
			    	next({"text":"战斗验证错误","fightRecord":self.fightContorl.getFightRecord()})
			    	return
			    }
			    if(winFlag){
			    	var awardList = self.checkpointsSuccess(uid,level)
			    	cb(true,{winFlag : winFlag,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,awardList:awardList})
			    }else{
			    	cb(false,{winFlag : winFlag,list : self.fightContorl.getFightRecord()})
			    }
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取挂机奖励
	this.getOnhookAward = function(uid,power,cb) {
		self.getPlayerData(uid,"onhookLastTime",function(onhookLastTime) {
			var curTime = Date.now()
			var tmpTime = Math.floor((curTime - onhookLastTime) / 1000)
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
			  	self.incrbyPlayerData(uid,"onhookLastTime",tmpTime * 1000)
			  	var awardTime = tmpTime
			  	if(awardTime > 43200){
			  		awardTime = 43200
			  	}
			  	var on_hook_award = checkpointsCfg[level].on_hook_award
			  	// console.log("on_hook_award ",on_hook_award)
			  	var rate = (awardTime * power) / 60 
			  	// console.log("rate ",rate,"awardTime ",awardTime)
			  	var awardList = self.addItemStr(uid,on_hook_award,rate)
			  	cb(true,{allTime : tmpTime,awardTime : awardTime,awardList : awardList})
			})
		})
	}
	//快速挂机奖励
	this.getQuickOnhookAward = function(uid,cb) {
		var level = 0
		var count = 0
		async.waterfall([
			function(next) {
				//获取今日快速挂机次数
				self.getPlayerData(uid,"quick",function(curCount) {
					count  = Number(curCount) || 0
					if(count < 4)
						next()
					else
						next("快速挂机次数已满")
				})
			},
			function(next) {
				//获取挂机等级
				self.getCheckpointsInfo(uid,function(curLevel) {
					level = curLevel
					if(checkpointsCfg[level])
						next()
					else
						next("level config error "+level)
				})
			},
			function(next) {
				//消耗元宝
				var needGold = count * 50
				if(needGold > 200)
					needGold = 200
				if(needGold){
					self.consumeItems(uid,"202:"+needGold,1,function(flag,err) {
						if(flag)
							next()
						else
							next(err)
					})
				}else{
					next()
				}
			},
			function(next) {
				self.incrbyPlayerData(uid,"quick",1)
			  	var on_hook_award = checkpointsCfg[level].on_hook_award
			  	var awardList = self.addItemStr(uid,on_hook_award,120)
			  	cb(true,{awardList : awardList})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取关卡任务数据
	this.getCTaskInfo = function(uid,cb) {
		self.getObjAll(uid,"ctask",function(data) {
			if(!data)
				cb(true,{})
			else
				cb(true,data)
		})
	}
	//获取关卡任务奖励
	this.getCTaskAward = function(uid,taskId,cb) {
		var lv = 0
		async.waterfall([function(next) {
			//获取当前关卡
			self.getCheckpointsInfo(uid,function(data) {
				lv = data
				if(!checkpoints_task[taskId] || checkpoints_task[taskId]["lv"] > lv)
					next("未完成领取条件")
				else
					next()
			})
		},function(next) {
			self.getObj(uid,"ctask",taskId,function(data) {
				if(data){
					next("奖励已领取")
				}else{
					self.setObj(uid,"ctask",taskId,1)
					next()
				}
			})
		},function(next) {
			let award = checkpoints_task[taskId]["award"]
			var awardList = self.addItemStr(uid,award)
			cb(true,{awardList : awardList})
		}],function(err) {
			cb(false,err)
		})
	}
}