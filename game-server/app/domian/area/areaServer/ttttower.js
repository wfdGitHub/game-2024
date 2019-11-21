//通天塔模块
var ttttower_level = require("../../../../config/gameCfg/ttttower_level.json")
var ttttower_samsara = require("../../../../config/gameCfg/ttttower_samsara.json")
var ttttower_cfg = require("../../../../config/gameCfg/ttttower_cfg.json")
var main_name = "ttt"
module.exports = function() {
	var self = this
	const TTTInfo = {
		"curL" : 0,	//当前等级
		"maxL" : 0,	//最高等级
		"passAward" : 0	//通关奖励领取记录
	}
	//玩家首次登陆刷新
	this.TTTdayUpdate = function(uid) {
		var curLv = self.players[uid].characters[self.heroId].level
		var samsara = Math.floor(((curLv - 1) / 100))
		self.getTTTInfo(uid,function(info) {
			info.maxL = parseInt(info.maxL)
			var curL = samsara * 100
			if(info.maxL < curL)
				self.setObj(uid,main_name,"maxL",curL)
			self.setObj(uid,main_name,"curL",curL)
			self.setObj(uid,main_name,"passAward",0)
		})
	}
	//获取通天塔数据
	this.getTTTInfo = function(uid,cb) {
		self.getObjAll(uid,main_name,function(obj) {
			for(var i in obj){
				obj[i] = parseInt(obj[i])
			}
			cb(Object.assign({},TTTInfo,obj))
		})
	}
	//挑战BOSS
	this.challengeTTTBoss = function(uid,otps,cb) {
		var curLv = self.players[uid].characters[self.heroId].level
		if(curLv < ttttower_cfg["open"]["value"]){
			cb(false,"未到开放等级")
			return
		}
		var samsara = Math.floor(((curLv - 1) / 100))
		self.getObj(uid,main_name,"curL",function(level) {
			if(level % 100 == 99){
				cb(false,"已通关")
				return
			}
			level = (parseInt(level) || 0)  + 1
			var fightInfo = self.getFightInfo(uid)
		    var atkTeam = fightInfo.team
		    if(!atkTeam){
		    	cb(false,"atkTeam error")
		    	return
		    }
		    var curL = Math.floor(level % 100)
		    var curS = Math.floor(level / 100)
		    if(!ttttower_level[curL] || !ttttower_samsara[curS]){
		    	cb(false,"curL or curS error "+curL+" "+curS)
		    	return
		    }
		    var defTeam = [{characterId : ttttower_level[curL]["bossId"],level : level,"attStr" : ttttower_samsara[curS]["attStr"]}]
		    self.recordFight(atkTeam,defTeam,fightInfo.seededNum,otps.readList)
		    var result = self.fightContorl.fighting(atkTeam,defTeam,fightInfo.seededNum,otps.readList)
		    if(result.verify === otps.verify){
		    	if(result.result === "win"){
		    		var rate = ttttower_samsara[curS]["rate"]
		    		var info = {
		    			result : result
		    		}
		    		info.awards = self.getTTTBossAward(uid,curL,curS)
		    		self.setObj(uid,main_name,"curL",level)
		    		self.getObj(uid,main_name,"maxL",function(maxL) {
		    			maxL = parseInt(maxL) || 0
		    			if(level > maxL){
		    				self.setObj(uid,main_name,"maxL",level)
		    				if(level % 100 == 99){
		    					//首通广播
		    					var name = self.players[uid]["name"]
								var notify = {
									type : "sysChat",
									text : "玩家"+name+"首次通关通天塔第"+(level+1)+"关"
								}
								self.sendAllUser(notify)
		    				}
		    			}
		    		})
		    		cb(true,info)
		    	}else{
		    		cb(true,{result : result})
		    	}
		    }else{
		    	console.error(otps.verify,result.verify)
		    	cb(false,result.verify)
		    }
		})
	}
	//领取通关奖励
	this.getTTTBossAward = function(uid,curL,curS) {
		var rate = ttttower_samsara[curS]["rate"]
		var awards = self.addItemStr(uid,ttttower_level[curL]["awards"],rate)
		return awards
	}
	//扫荡到最高等级
	this.TTTmopup = function(uid,cb) {
		self.getTTTInfo(uid,function(info) {
			if(info.maxL && info.curL < info.maxL){
				self.consumeItems(uid,ttttower_cfg["mopup"]["value"],1,function(flag,err) {
					if(!flag){
						cb(false,err)
						return
					}
					self.setObj(uid,main_name,"curL",info.maxL,function() {
						var awardList = []
						for(var level = info.curL + 1;level <= info.maxL;level++){
						    var curL = Math.floor(level % 100)
						    var curS = Math.floor(level / 100)
							awardList.push(self.getTTTBossAward(uid,curL,curS))
						}
						cb(true,{awardList : awardList,level : info.maxL})
					})
				})
			}else{
				cb(false,"已到达最高关卡")
			}
		})
	}
	//领取通关奖励
	this.getTTTAwards = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			var passAward = parseInt(data.passAward)
			var curL = parseInt(data.curL)
			var maxL = parseInt(data.maxL)
			if(passAward){
				cb(false,"已领取")
				return
			}
			if(curL % 100 != 99){
				cb(false,"未通关")
				return
			}
			var samsara = Math.floor(curL / 100)
			if(ttttower_samsara[samsara] && ttttower_samsara[passAward]["passAward"]){
				self.setObj(uid,main_name,"passAward",1,function() {
					var awards = self.addItemStr(uid,ttttower_samsara[passAward]["passAward"])
					cb(true,awards)
				})
			}else{
				cb(false,"没有可领取的奖励")
			}
		})
	}
}