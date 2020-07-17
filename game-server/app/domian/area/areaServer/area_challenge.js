const area_challenge = require("../../../../config/gameCfg/area_challenge.json")
const main_name = "area_challenge"
for(var i = 1;i <= 3;i++)
	for(var j = 1;j <= 3;j++)
		area_challenge[i]["team"+j] = JSON.parse(area_challenge[i]["team"+j])
module.exports = function() {
	var self = this
	const baseInfo = {
		"day_1" : 0,
		"day_2" : 0,
		"day_3" : 0
	}
	//获取新服挑战数据
	this.getAreaChallengeData = function(uid,cb) {
		if(self.areaDay > 3){
			cb(false,"活动已结束")
			return
		}
		self.getObjAll(uid,main_name,function(data) {
			for(let i in data)
				data[i] = Number(data[i])
			data = Object.assign({},baseInfo,data)
			cb(true,data)
		})
	}
	//挑战新服BOSS
	this.areaChallenge = function(uid,cb) {
		if(self.areaDay > 3){
			cb(false,"活动已结束")
			return
		}
		self.getObj(uid,main_name,"day_"+self.areaDay,function(data) {
			var bossId = Number(data) || 0
			bossId++
			if(!area_challenge[self.areaDay]["team"+bossId]){
				cb(false,"今日已全部挑战")
			}else{
			    var fightInfo = self.getFightInfo(uid)
			    if(!fightInfo){
			    	cb(false,"未准备")
			    	return
			    }
			   	var atkTeam = fightInfo.team
			   	var seededNum = fightInfo.seededNum
			   	var defTeam = area_challenge[self.areaDay]["team"+bossId]
			    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    if(winFlag){
		    		var info = {
		    			winFlag : winFlag,
		    			bossId : bossId
		    		}
		    		self.incrbyObj(uid,main_name,"day_"+self.areaDay,1)
		    		info.awardList = self.addItemStr(uid,area_challenge[self.areaDay]["award"+bossId])
		    		cb(true,info)
			    }else{
			    	cb(false,self.fightContorl.getFightRecord())
			    }
			}
		})
	}
}