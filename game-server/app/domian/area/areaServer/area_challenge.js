//挑战山海
const area_challenge = require("../../../../config/gameCfg/area_challenge.json")
const area_trial = require("../../../../config/gameCfg/area_trial.json")
const battle_cfg = require("../../../../config/gameCfg/battle_cfg.json")
const async = require("async")
const main_name = "area_challenge"
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
	//挑战单骑救主
	this.areaChallenge = function(uid,hIds,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(var i in data)
				data[i] = Number(data[i])
			var bossId = Number(data["bossId"]) || 0
			bossId++
			var cur_chapter = data["cur_chapter"] || 1
			var time = data["time"]
			if(!hIds || hIds.length > area_challenge[cur_chapter]["max_num"]){
				cb(false,"最大人数超出")
				return
			}
			if(!area_challenge[cur_chapter]){
				cb(false,cb(false,"chapter erro "+cur_chapter))
				return
			}
			if(!area_challenge[cur_chapter]["team"+bossId]){
				cb(false,"boss错误")
				return
			}
			self.getTeamByCustom(uid,hIds,function(flag,atkTeam) {
				var seededNum = Date.now()
				var defTeam = self.fightContorl.getNPCTeamByType(main_name,area_challenge[cur_chapter]["team"+bossId],area_challenge[cur_chapter]["lv"])
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
		    		
			    }
			    cb(true,info)
			})
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
		console.log("areaChallengePass",uid,lv,self.maxIndex)
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
	//血战华容
	this.areaTrial = function(uid,seededNums,cb) {
		var atkTeams = []
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
				self.getTeamByType(uid,battle_cfg["area_trial"]["team"],function(flag,teams) {
					atkTeams = teams
					next()
				})
			},
			function(next) {
				for(var i = 0;i < 3;i++){
					var atkTeam = atkTeams[i]
					var defTeam = self.fightContorl.getNPCTeamByType("area_trial",area_trial[trialId]["team"+(i+1)],area_trial[trialId]["lv"])
					var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNums[i]})
					if(!winFlag){
						next("第"+i+"场战斗失败")
						return
					}
				}
				var awardList = self.addItemStr(uid,area_trial[trialId]["award"],1,"挑战山海")
				self.incrbyObj(uid,main_name,"trialId",1)
				self.addZset("trial_rank",uid,trialId)
				self.taskUpdate(uid,"area_trial",1,trialId)
				cb(true,{awardList:awardList,trialId:trialId})
			}
		],function(err) {
			cb(false,err)
		})
	}
}