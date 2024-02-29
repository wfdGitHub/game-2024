//通天塔模块
const ttttower_level = require("../../../../config/gameCfg/ttttower_level.json")
const ttttower_cfg = require("../../../../config/gameCfg/ttttower_cfg.json")
const heros_cfg = require("../../../../config/gameCfg/heros.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
var async = require("async")
var main_name = "ttt"
var realm_day = {
	"1" : {"1":true},
	"2" : {"2":true},
	"3" : {"3":true},
	"4" : {"4":true},
	"5" : {"5":true},
	"6" : {"1":true,"2":true,"3":true},
	"0" : {"4":true,"5":true}
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
	//挑战通天塔
	this.challengeTTTBoss = function(uid,seededNum,masterSkills,cb) {
		var level = 0
		async.waterfall([
			function(next) {
				//获取通天塔数据
				self.getObj(uid,main_name,"level",function(data) {
					level = Number(data) + 1
					if(ttttower_level[level])
						next()
					else
						next("关卡不存在"+level)
				})
			},
			function(next) {
			    var atkTeam = self.getUserTeam(uid)
			    var defTeam = self.fightContorl.getNPCTeamByType(main_name,ttttower_level[level]["defTeam"],ttttower_level[level]["lv"])
			    var winFlag = self.fightContorl.videoFight(atkTeam,defTeam,{seededNum : seededNum,masterSkills : masterSkills})
			    self.taskUpdate(uid,"ttt",1)
			    if(winFlag){
			   		self.incrbyObj(uid,main_name,"level",1)
			   		self.taskUpdate(uid,"tttLv",1)
			   		self.updateSprintRank("ttt_rank",uid,1)
			   		self.chageLordData(uid,"ttt_lv",level)
			   		self.setPassKey(uid,"ttt",level)
			   		var awardList = []
			   		if(ttttower_level[level]["awards"])
						awardList = awardList.concat(self.addItemStr(uid,ttttower_level[level]["awards"],1,"通天塔"+level))
					cb(true,awardList)
			    }else{
			    	self.verifyFaild(uid,self.fightContorl.getVerifyInfo(),"通天塔")
			    	cb(false,{winFlag : winFlag})
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
				self.getHMObj(uid,main_name,["level","mopup"],function(list) {
					var maxLv = Number(list[0]) || 0
					var mopup = Number(list[1]) || 0
					if(level > maxLv){
						next("只能扫荡已通关")
						return
					}
					if(mopup < ttttower_cfg["freeCount"]["value"]){
						//免费扫荡
						self.incrbyObj(uid,main_name,"mopup",1)
						next()
					}else if(mopup < ttttower_cfg["freeCount"]["value"] + ttttower_cfg["buyCount"]["value"]){
						//付费扫荡
						self.consumeItems(uid,ttttower_cfg["mopup"]["value"],1,"通天塔扫荡",function(flag,err) {
							if(flag){
								self.incrbyObj(uid,main_name,"mopup",1)
								next()
							}
							else
								next(err)
						})
					}else{
						next("扫荡次数已满")
					}
				})
			},
			function(next) {
				//扫荡奖励
				self.taskUpdate(uid,"ttt",1)
				var rate = 1
				if(self.checkLimitedTime("saodang"))
					rate = 2
				var awardList = self.addItemStr(uid,ttttower_level[level]["mopupAward"],rate,"通天塔扫荡"+level)
				cb(true,awardList)
			}
		],function(err) {
			cb(false,err)
		})
	}
}