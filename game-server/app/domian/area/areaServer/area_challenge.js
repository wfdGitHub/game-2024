//挑战山海
const area_challenge = require("../../../../config/gameCfg/area_challenge.json")
const area_trial = require("../../../../config/gameCfg/area_trial.json")
const async = require("async")
const main_name = "area_challenge"
for(var i in area_challenge)
	for(var j = 1;j <= 3;j++)
		area_challenge[i]["team"+j] = JSON.parse(area_challenge[i]["team"+j])
for(var i in area_trial)
	for(var j = 1;j <= 3;j++)
		area_trial[i]["team"+j] = JSON.parse(area_trial[i]["team"+j])
module.exports = function() {
	var self = this
	const baseInfo = {
		"bossId" : 0,
		"cur_chapter" : 1,
		"time" : 0,
		"trialId" : 0
	}
	this.maxIndex = 9999
	//初始化
	this.initAreaChallenge = function() {
		self.getAreaObj("areaInfo",main_name,function(data) {
			self.maxIndex = Number(data) || 0
		})
	}
	//获取挑战山海数据
	this.getAreaChallengeData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(var i in data)
				data[i] = Number(data[i])
			data = Object.assign({},baseInfo,data)
			data.cur_chapter = data["cur_chapter"] || 1
			if(!data.time){
				data.time = Date.now() + 86400000
				self.setObj(uid,main_name,"time",data.time)
			}else{
				//挑战时间到
				var flag = false
				while(data.time < Date.now() && data.cur_chapter < 57){
					flag = true
					data.cur_chapter++
					data.time += 86400000
				}
				if(flag){
					data.bossId = 0
					self.setObj(uid,main_name,"cur_chapter",data.cur_chapter)
					self.setObj(uid,main_name,"time",data.time)
					self.setObj(uid,main_name,"bossId",data.bossId)
				}
			}
			cb(true,data)
		})
	}
	//挑战单骑(1vs1)
	this.areaChallenge = function(uid,hId,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(var i in data)
				data[i] = Number(data[i])
			var bossId = Number(data["bossId"]) || 0
			bossId++
			var cur_chapter = data["cur_chapter"] || 1
			var time = data["time"]
			if(!area_challenge[cur_chapter] || cur_chapter >= 8){
				cb(false,cb(false,"chapter erro "+cur_chapter))
			}else if(!area_challenge[cur_chapter]["team"+bossId]){
				cb(false,"boss错误")
			}else{
				self.heroDao.getHeroWithCoexist(uid,[hId],function(flag,list,coexist) {
					if(!flag){
						cb(false,"hId error "+hId)
					}else{
						var seededNum = Date.now()
						var atkTeam = [0,list[0],0,0,0,0,{coexist:coexist}]
						var defTeam = area_challenge[cur_chapter]["team"+bossId]
					    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    		var info = {}
			    		info.atkTeam = atkTeam
			    		info.defTeam = defTeam
			    		info.seededNum = seededNum
			    		info.winFlag = winFlag
					    if(winFlag){
				    		info.awardList = self.addItemStr(uid,area_challenge[cur_chapter]["award"+bossId],1,"挑战山海"+cur_chapter)
				    		if(bossId >= 3){
				    			self.areaChallengePass(uid,cur_chapter)
				    			cur_chapter++
				    			bossId = 0
				    			time += 86400000
				    			self.setObj(uid,main_name,"cur_chapter",cur_chapter)
				    			self.setObj(uid,main_name,"time",time)
				    		}
				    		self.setObj(uid,main_name,"bossId",bossId)
			    			info.bossId = bossId
			    			info.cur_chapter = cur_chapter
			    			info.time = time
				    		cb(true,info)
					    }else{
					    	cb(false,info)
					    }
					}
				})
			}
		})
	}
	//挑战单骑(3vs3)
	this.areaChallengeThree = function(uid,hIds,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(var i in data)
				data[i] = Number(data[i])
			var bossId = Number(data["bossId"]) || 0
			bossId++
			var cur_chapter = data["cur_chapter"] || 1
			var time = data["time"]
			if(!area_challenge[cur_chapter] || cur_chapter < 8){
				cb(false,"chapter erro "+cur_chapter)
			}else if(!area_challenge[cur_chapter]["team"+bossId]){
				cb(false,"boss错误")
			}else{
				  if(!hIds || hIds.length != 6){
				    cb(false,"英雄列表错误")
				    return
				  }
				  var heroNum = 0
				  //判断重复
				  for(var i = 0;i < hIds.length;i++){
				    if(!hIds[i])
				      continue
				    heroNum++
				    for(var j = i + 1;j < hIds.length;j++){
				      if(!hIds[j])
				        continue
				      if(hIds[i] == hIds[j]){
				      	cb(false,"不能有重复的hId")
				        return
				      }
				    }
				  }
				  if(heroNum != 3){
			      	cb(false,"上阵数量错误 "+heroNum)
			        return
				  }
				self.heroDao.getHeroWithCoexist(uid,hIds,function(flag,list,coexist) {
					if(!flag){
						cb(false,"hIds error "+hIds)
					}else{
						var seededNum = Date.now()
						var atkTeam = list
						atkTeam[6] = {coexist:coexist}
						var defTeam = area_challenge[cur_chapter]["team"+bossId]
					    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    		var info = {}
			    		info.atkTeam = atkTeam
			    		info.defTeam = defTeam
			    		info.seededNum = seededNum
			    		info.winFlag = winFlag
					    if(winFlag){
				    		info.awardList = self.addItemStr(uid,area_challenge[cur_chapter]["award"+bossId],1,"挑战山海"+cur_chapter)
				    		if(bossId >= 3){
				    			self.areaChallengePass(uid,cur_chapter)
				    			cur_chapter++
				    			bossId = 0
				    			time += 86400000
				    			self.setObj(uid,main_name,"cur_chapter",cur_chapter)
				    			self.setObj(uid,main_name,"time",time)
				    		}
				    		self.setObj(uid,main_name,"bossId",bossId)
			    			info.bossId = bossId
			    			info.cur_chapter = cur_chapter
			    			info.time = time
				    		cb(true,info)
					    }else{
					    	cb(false,info)
					    }
					}
				})
			}
		})
	}
	//挑战单骑(6vs6)
	this.areaChallengeSix = function(uid,verify,masterSkills,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(var i in data)
				data[i] = Number(data[i])
			var bossId = Number(data["bossId"]) || 0
			bossId++
			var cur_chapter = data["cur_chapter"] || 1
			var time = data["time"]
			if(!area_challenge[cur_chapter] || cur_chapter < 15){
				cb(false,"chapter erro "+cur_chapter)
			}else if(!area_challenge[cur_chapter]["team"+bossId]){
				cb(false,"boss错误")
			}else{
				var fightInfo = self.getFightInfo(uid)
				if(!fightInfo){
					next("未准备")
					return
				}
			    var atkTeam = fightInfo.team
			    var seededNum = fightInfo.seededNum
				var defTeam = area_challenge[cur_chapter]["team"+bossId]
			    var winFlag = self.fightContorl.videoFight(atkTeam,defTeam,{seededNum : seededNum,masterSkills : masterSkills})
			    if(verify !== self.fightContorl.getVerifyInfo()){
			    	self.verifyFaild(uid,verify,self.fightContorl.getVerifyInfo(),"挑战单骑(6vs6)")
			    	next({"text":"战斗验证错误","fightRecord":self.fightContorl.getVerifyInfo()})
			    	return
			    }
	    		var info = {}
	    		info.atkTeam = atkTeam
	    		info.defTeam = defTeam
	    		info.seededNum = seededNum
	    		info.winFlag = winFlag
			    if(winFlag){
		    		info.awardList = self.addItemStr(uid,area_challenge[cur_chapter]["award"+bossId],1,"挑战山海"+cur_chapter)
		    		if(bossId >= 3){
		    			self.areaChallengePass(uid,cur_chapter)
		    			cur_chapter++
		    			bossId = 0
		    			time += 86400000
		    			self.setObj(uid,main_name,"cur_chapter",cur_chapter)
		    			self.setObj(uid,main_name,"time",time)
		    		}
		    		self.setObj(uid,main_name,"bossId",bossId)
	    			info.bossId = bossId
	    			info.cur_chapter = cur_chapter
	    			info.time = time
		    		cb(true,info)
			    }else{
			    	cb(false,info)
			    }
			}
		})
	}
	//获取单骑挑战首通记录
	this.getAreaChallengeRecord = function(cb) {
		self.getAreaObjAll(main_name,function(data) {
			cb(true,data)
		})
	}
	//单骑挑战通过
	this.areaChallengePass = function(uid,lv) {
		if(lv > self.maxIndex){
			self.maxIndex = lv
			self.setAreaObj("areaInfo",main_name,self.maxIndex)
			//记录
			var userInfos = self.getSimpleUser(uid)
			userInfos.time = Date.now()
			self.setAreaObj(main_name,self.maxIndex,JSON.stringify(userInfos))
			//奖励
			self.sendTextToMail(uid,"area_challenge",area_challenge[self.maxIndex]["pass_award"],area_challenge[self.maxIndex]["name"])
		}
	}
	//领取单骑首通奖励
	this.gainAreaChallengePass = function(uid,index,cb) {
		async.waterfall([
			function(next) {
				if(!area_challenge[index])
					next("index error")
				else
					next()
			},
			function(next) {
				self.getAreaObj(main_name,self.maxIndex,function(data) {
					if(!data)
						next("该关卡尚未首通")
					else
						next()
				})
			},
			function(next) {
				self.getObj(uid,main_name,"pass_"+index,function(data) {
					if(data){
						next("该奖励已领取")
					}else{
						self.setObj(uid,main_name,"pass_"+index,1)
						var awardList = self.addItemStr(uid,area_challenge[index]["area_award"],1,"单骑首通"+index)
						cb(true,awardList)
					}
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//三队挑战
	this.areaTrial = function(uid,verifys,cb) {
		console.log("areaTrial",uid,verifys)
		var verify1 = verifys[0]
		var verify2 = verifys[1]
		var verify3 = verifys[2]
		var seededNum1 = verifys[3]
		var seededNum2 = verifys[4]
		var seededNum3 = verifys[5]
		var atkTeam = []
		var trialId = 0
		async.waterfall([
			function(next) {
				self.getObj(uid,main_name,"trialId",function(data) {
					trialId = Number(data) || 0
					trialId++
					if(!area_trial[trialId]){
						next("已通关")
						return
					}
					next()
				})
			},
			function(next) {
			    var fightInfo = self.getFightInfo(uid)
			    if(!fightInfo){
			    	next("未准备")
			    }else{
			    	atkTeam = fightInfo.team
			    	next()
			    }
			},
			function(next) {
				var defTeam = area_trial[trialId]["team1"]
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum1})
				if(!winFlag){
					next("第1场战斗失败")
					return
				}
				var list = self.fightContorl.getFightRecord()
				var overInfo = list[list.length - 1]
				for(var i = 0;i<atkTeam.length;i++){
					if(atkTeam[i] && overInfo.atkTeam[i]){
						atkTeam[i]["surplus_health"] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
					}
				}
				defTeam = area_trial[trialId]["team2"]
				winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum2})
				if(!winFlag){
					next("第2场战斗失败")
					return
				}
				list = self.fightContorl.getFightRecord()
				overInfo = list[list.length - 1]
				for(var i = 0;i<atkTeam.length;i++){
					if(atkTeam[i] && overInfo.atkTeam[i]){
						atkTeam[i]["surplus_health"] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
					}
				}
				defTeam = area_trial[trialId]["team3"]
				winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum3})
				if(!winFlag){
					next("第3场战斗失败",atkTeam)
					return
				}
				list = self.fightContorl.getFightRecord()
				overInfo = list[list.length - 1]
				for(var i = 0;i<atkTeam.length;i++){
					if(atkTeam[i] && overInfo.atkTeam[i]){
						atkTeam[i]["surplus_health"] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
					}
				}
				var awardList = self.addItemStr(uid,area_trial[trialId]["award"],1,"挑战山海")
				self.incrbyObj(uid,main_name,"trialId",1)
				self.addZset("trial_rank",uid,trialId)
				cb(true,{awardList:awardList,trialId:trialId})
			}
		],function(err) {
			cb(false,err)
		})
	}
}