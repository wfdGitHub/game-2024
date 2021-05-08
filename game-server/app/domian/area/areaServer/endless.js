//无尽试炼
const endless_one = require("../../../../config/gameCfg/endless_one.json")
const endless_three = require("../../../../config/gameCfg/endless_three.json")
const async = require("async")
const main_name = "endless"
for(var i in endless_one){
	for(var j = 1;j <= 6;j++)
		endless_one[i]["team_"+j] = JSON.parse(endless_one[i]["team_"+j])
}
for(var i in endless_three){
	for(var j = 1;j <= 6;j++)
		endless_three[i]["team_"+j] = JSON.parse(endless_three[i]["team_"+j])
}
module.exports = function() {
	var self = this
	//获取数据
	this.getEndlessData = function(uid,cb) {
		self.taskUpdate(uid,"endless_count",1)
		self.getObjAll(uid,main_name,function(data) {
			cb(true,data)
		})
	}
	//挑战单人试炼
	this.challengeOneEndless = function(uid,hIds,id,seededList,index,verifys,cb) {
		if(!Array.isArray(hIds) || hIds.length !== 1){
			cb(false,"hIds error "+hIds)
			return
		}
		if(!Array.isArray(verifys) || verifys.length != seededList.length){
			cb(false,"verifys error "+verifys)
			return
		}
		if(!Array.isArray(seededList) || !seededList.length || seededList.length !== index){
			cb(false,"seededList.length != index",seededList,index)
			return
		}
		for(var i = 0;i < seededList.length;i++){
			if(!Number.isInteger(seededList[i])){
				cb(false,"seededList[i] error "+seededList[i])
				return
			}
		}
		if(!endless_one[id] || !endless_one[id]["team_"+index]){
			cb(false,"id error "+id)
			return
		}
		var atkTeam = []
		var defTeam = []
		var oldLevel = 0
		var oldIndex = 0
		var level = (Number(id) - 1) * 6 +index
		async.waterfall([
			function(next) {
				//前置条件判断
				self.getObj(uid,main_name,"level",function(data) {
					oldLevel = Number(data) || 0
					oldIndex = oldLevel - (Number(id) - 1) * 6
					if(oldIndex < 0)
						next("未通关前置关卡 "+id)
					else if(level <= oldLevel)
						next("未突破此前记录")
					else
						next()
				})
			},
			function(next) {
				//获取阵容
		    	self.heroDao.getHeroList(uid,hIds,function(flag,list) {
					if(!flag || !list[0]){
						next("英雄不存在")
						return
					}
					atkTeam[1] = list[0]
		    		next()
		    	})
			},
			function(next) {
				//开始战斗
				// console.log("无尽试炼开始")
				for(var i = 0;i < seededList.length;i++){
					var curLv = i+1
					defTeam = self.standardTeam(null,endless_one[id]["team_"+curLv],"main",endless_one[id]["level"])
					var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededList[i]})
					if(!winFlag){
						next("第"+curLv+"场战斗失败")
						return
					}
				    if(verifys[i] !== JSON.stringify(self.fightContorl.getFightRecord()[0])){
				    	self.verifyFaild(uid,verifys[i],JSON.stringify(self.fightContorl.getFightRecord()[0]))
				    	next("战斗验证错误")
				    	return
				    }
					// console.log("第"+curLv+"场",atkTeam[1])
					var list = self.fightContorl.getFightRecord()
					var overInfo = list[list.length - 1]
					atkTeam[1]["surplus_health"] = overInfo.atkTeam[1].hp/overInfo.atkTeam[1].maxHP
				}
				next()
			},
			function(next) {
				//发放奖励
				self.taskUpdate(uid,"endless_one_lv",1,level)
				self.addZset(main_name,uid,level)
				self.setObj(uid,main_name,"level",level)
				var awardList = []
				for(var i = oldIndex + 1;i <= index;i++){
					if(i % 2 == 0){
						var awardId = i / 2
						awardList = awardList.concat(self.addItemStr(uid,endless_one[id]["award_"+awardId],1,"单人试炼"+id+"-"+awardId))
					}
				}
				var info = {
					level : level,
					awardList : awardList
				}
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//挑战三人试炼
	this.challengeThreeEndless = function(uid,hIds,id,seededList,index,verifys,cb) {
		if(!Array.isArray(hIds) || hIds.length !== 3){
			cb(false,"hIds error "+hIds)
			return
		}
		if(!Array.isArray(verifys) || verifys.length != seededList.length){
			cb(false,"verifys error "+verifys)
			return
		}
		if(!Array.isArray(seededList) || !seededList.length || seededList.length !== index){
			cb(false,"seededList.length != index",seededList,index)
			return
		}
		for(var i = 0;i < seededList.length;i++){
			if(!Number.isInteger(seededList[i])){
				cb(false,"seededList[i] error "+seededList[i])
				return
			}
		}
		if(!endless_one[id] || !endless_one[id]["team_"+index]){
			cb(false,"id error "+id)
			return
		}
		var atkTeam = []
		var defTeam = []
		var oldLevel = 0
		var oldIndex = 0
		var level = (Number(id) - 1) * 6 +index
		async.waterfall([
			function(next) {
				//前置条件判断
				self.getObj(uid,main_name,"level",function(data) {
					oldLevel = Number(data) || 0
					oldIndex = oldLevel - (Number(id) - 1) * 6
					if(oldIndex < 0)
						next("未通关前置关卡 "+id)
					else if(level <= oldLevel)
						next("未突破此前记录")
					else
						next()
				})
			},
			function(next) {
				//获取阵容
		    	self.heroDao.getHeroList(uid,hIds,function(flag,list) {
					if(!flag || (!list[0] && !list[1] && !list[2]) ){
						next("英雄不存在")
						return
					}
					atkTeam[1] = list[0]
					atkTeam[3] = list[1]
					atkTeam[5] = list[2]
		    		next()
		    	})
			},
			function(next) {
				//开始战斗
				// console.log("无尽试炼开始")
				for(var i = 0;i < seededList.length;i++){
					var curLv = i+1
					defTeam = self.standardTeam(null,endless_one[id]["team_"+curLv],"main",endless_one[id]["level"])
					var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededList[i]})
					if(!winFlag){
						next("第"+curLv+"场战斗失败")
						return
					}
				    if(verifys[i] !== JSON.stringify(self.fightContorl.getFightRecord()[0])){
				    	self.verifyFaild(uid,verifys[i],JSON.stringify(self.fightContorl.getFightRecord()[0]))
				    	next("战斗验证错误")
				    	return
				    }
					// console.log("第"+curLv+"场",atkTeam[1])
					var list = self.fightContorl.getFightRecord()
					var overInfo = list[list.length - 1]
					if(atkTeam[1])
						atkTeam[1]["surplus_health"] = overInfo.atkTeam[1].hp/overInfo.atkTeam[1].maxHP
					if(atkTeam[2])
						atkTeam[2]["surplus_health"] = overInfo.atkTeam[2].hp/overInfo.atkTeam[2].maxHP
					if(atkTeam[3])
						atkTeam[3]["surplus_health"] = overInfo.atkTeam[3].hp/overInfo.atkTeam[3].maxHP
				}
				next()
			},
			function(next) {
				//发放奖励
				self.taskUpdate(uid,"endless_Three_lv",1,level)
				self.addZset(main_name,uid,level)
				self.setObj(uid,main_name,"level",level)
				var awardList = []
				for(var i = oldIndex + 1;i <= index;i++){
					if(i % 2 == 0){
						var awardId = i / 2
						awardList = awardList.concat(self.addItemStr(uid,endless_one[id]["award_"+awardId],1,"三人试炼"+id+"-"+awardId))
					}
				}
				var info = {
					level : level,
					awardList : awardList
				}
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取排行榜
	this.getEndlessRank = function(cb) {
		self.zrangewithscore(main_name,-10,-1,function(list) {
			var uids = []
			var scores = []
			for(var i = 0;i < list.length;i += 2){
				uids.push(list[i])
				scores.push(list[i+1])
			}
			self.getPlayerInfoByUids(uids,function(userInfos) {
				cb(true,{userInfos:userInfos,scores:scores})
			})
		})
	}
}