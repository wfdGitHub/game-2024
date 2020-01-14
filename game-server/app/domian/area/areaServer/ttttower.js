//通天塔模块
var ttttower_level = require("../../../../config/gameCfg/ttttower_level.json")
var ttttower_cfg = require("../../../../config/gameCfg/ttttower_cfg.json")
var async = require("async")
var main_name = "ttt"
for(var i in ttttower_level){
	ttttower_level[i]["defTeam"] = JSON.parse(ttttower_level[i]["defTeam"])
}
module.exports = function() {
	var self = this
	const TTTInfo = {
		"level" : 0,	//最高等级
		"mopup" : 0		//扫荡次数
	}
	//玩家每日刷新
	this.TTTdayUpdate = function(uid) {
		self.setObj(uid,main_name,"mopup",0)
	}
	//获取通天塔数据
	this.getTTTInfo = function(uid,cb) {
		self.getObjAll(uid,main_name,function(obj) {
			for(var i in obj){
				obj[i] = Number(obj[i])
			}
			cb(Object.assign({},TTTInfo,obj))
		})
	}
	//挑战下一关BOSS
	this.challengeTTTBoss = function(uid,verify,cb) {
		var level = 0
		async.waterfall([
			function(next) {
				//判断主角等级
				self.getLordLv(uid,function(lv) {
					if(lv < ttttower_cfg["open"]["value"]){
						console.error("openLevel "+lv+" / "+ttttower_cfg["open"]["value"])
						next("等级不足")
					}else{
						next()
					}
				})
			},
			function(next) {
				//获取通天塔数据
				self.getTTTInfo(uid,function(info) {
					level = info.level + 1
					if(ttttower_level[level])
						next()
					else
						next("关卡不存在"+level)
				})
			},
			function(next) {
			    var fightInfo = self.getFightInfo(uid)
			    if(!fightInfo){
			    	next("未准备")
			    	return
			    }
			   	var atkTeam = fightInfo.team
			   	var seededNum = fightInfo.seededNum
			   	var defTeam = ttttower_level[level]["defTeam"]
			   	var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    if(verify !== JSON.stringify(self.fightContorl.getFightRecord()[0])){
			    	next({"text":"战斗验证错误","fightRecord":self.fightContorl.getFightRecord()})
			    	return
			    }
			   	if(winFlag){
			   		self.incrbyObj(uid,main_name,"level",1)
					var awardList = self.addItemStr(uid,ttttower_level[level]["awards"])
					cb(true,awardList)
			   	}else{
			   		cb(false,self.fightContorl.getFightRecord())
			   	}
			}
		],function(err) {
				cb(false,err)
		})
	}
	//扫荡奖励
	this.TTTmopup = function(uid,level,cb) {
		if(!ttttower_level[level]){
			cb(false,"通天塔等级错误"+level)
			return
		}
		async.waterfall([
			function(next) {
				//通天塔数据
				self.getTTTInfo(uid,function(info) {
					maxLv = info.level
					if(level > maxLv){
						next("只能扫荡已通关")
						return
					}
					if(info.mopup >= ttttower_cfg["freeCount"]["value"]){
						//消耗扫荡券
						self.consumeItems(uid,ttttower_cfg["mopup"]["value"],1,function(flag,err) {
							if(flag)
								next()
							else
								next(err)
						})
					}else{
						//免费扫荡
						self.incrbyObj(uid,main_name,"mopup",1)
						next()
					}
				})
			},
			function(next) {
				//扫荡奖励
				var awardList = self.addItemStr(uid,ttttower_level[level]["mopupAward"])
				cb(true,awardList)
			}
		],function(err) {
			cb(false,err)
		})
	}
}