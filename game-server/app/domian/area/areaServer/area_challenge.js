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
				while(data.time < Date.now() && data.cur_chapter < 8){
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
	this.areaChallenge = function(uid,hId,cb) {
		self.getObjAll(uid,main_name,function(data) {
			for(var i in data)
				data[i] = Number(data[i])
			var bossId = Number(data["bossId"]) || 0
			bossId++
			var cur_chapter = data["cur_chapter"] || 1
			var time = data["time"]
			if(!area_challenge[cur_chapter]){
				cb(false,"已通关")
			}else if(!area_challenge[cur_chapter]["team"+bossId]){
				cb(false,"boss错误")
			}else{
				self.heroDao.getHeroOne(uid,hId,function(flag,hero) {
					if(!flag){
						cb(false,"hId error "+hId)
					}else{
						var seededNum = Date.now()
						var atkTeam = [0,hero,0,0,0,0]
						var defTeam = area_challenge[cur_chapter]["team"+bossId]
					    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    		var info = {}
			    		info.atkTeam = atkTeam
			    		info.defTeam = defTeam
			    		info.seededNum = seededNum
			    		info.winFlag = winFlag
					    if(winFlag){
				    		info.awardList = self.addItemStr(uid,area_challenge[cur_chapter]["award"+bossId],1,"挑战山海")
				    		if(bossId >= 3){
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
	//挑战试炼
	this.areaTrial = function(uid,verifys,cb) {
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
				if(verify1 != JSON.stringify(atkTeam)){
					console.log("verify1 error")
					next("verify1 error")
					return
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
				if(verify2 != JSON.stringify(atkTeam)){
					console.log("verify2 error")
					next("verify2 error")
					return
				}
				defTeam = area_trial[trialId]["team3"]
				winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum3})
				if(!winFlag){
					next("第2场战斗失败",atkTeam)
					return
				}
				list = self.fightContorl.getFightRecord()
				overInfo = list[list.length - 1]
				for(var i = 0;i<atkTeam.length;i++){
					if(atkTeam[i] && overInfo.atkTeam[i]){
						atkTeam[i]["surplus_health"] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
					}
				}
				if(verify3 != JSON.stringify(atkTeam)){
					console.log("verify3 error")
					next("verify3 error")
					return
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