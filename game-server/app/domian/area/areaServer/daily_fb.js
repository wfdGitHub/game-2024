//日常副本
const daily_fb_base = require("../../../../config/gameCfg/daily_fb_base.json")
const daily_fb_type = require("../../../../config/gameCfg/daily_fb_type.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const VIP = require("../../../../config/gameCfg/VIP.json")
var async = require("async")
const ONE_TIME = default_cfg["dailyfb_time"]["value"]
const BEGIN_TIME = default_cfg["dailyfb_begin"]["value"]
const MAX_TIME = default_cfg["dailyfb_maxTime"]["value"]
const TYPE_COUNT = default_cfg["dailyfb_count"]["value"]
const main_name = "dailyfb"
module.exports = function() {
	var self = this
	//获取日常副本数据
	this.getDailyfbInfo = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data.action)
				data.action = Date.now() - BEGIN_TIME
			self.setObj(uid,main_name,"action",data.action)
			cb(true,data)
		})
	}
	//日常副本每日更新
	this.dailyfbUpdate = function(uid) {
		for(var type in daily_fb_type){
			self.setObj(uid,main_name,type+"_count",0)
		}
	}
	//挑战日常副本
	this.challengeDailyfb = function(uid,fbId,seededNum,masterSkills,cb) {
		if(!daily_fb_base[fbId]){
			cb(false,"副本不存在")
			return
		}
		var type = daily_fb_base[fbId]["type"]
		var lv = self.getLordLv(uid)
		if(!daily_fb_type[type]){
			cb(false,"副本类型错误"+type)
			return
		}
		self.incrbyObj(uid,main_name,type+"_count",1,function(data) {
			data = Number(data) || 0
			if(data > TYPE_COUNT){
				cb(false,"该类型今日挑战已达上限")
				return
			}
			self.dailyfbAtiontime(uid,function(flag,action) {
				if(!flag){
					cb(false,"体力不足")
					return
				}
				self.taskUpdate(uid,"fb",1)
				var atkTeam = self.getUserTeam(uid)
				var defTeam = self.fightContorl.getNPCTeamByType(main_name,daily_fb_base[fbId]["team"],lv)
				var winFlag = self.fightContorl.videoFight(atkTeam,defTeam,{seededNum : seededNum,masterSkills : masterSkills})
				if(winFlag){
					//发放奖励
					var award = daily_fb_base[fbId]["award"]
					var rate = 1
					if(self.checkLimitedTime("fuben"))
						rate = 2
					var awardList = self.addItemStr(uid,daily_fb_base[fbId]["award"],rate,"日常副本")
					cb(true,{awardList:awardList,action:action,winFlag:winFlag})
				}else{
					cb(false,{atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,masterSkills:masterSkills,winFlag:winFlag,action:action})
				}
			})
		})
	}
	//消耗体力
	this.dailyfbAtiontime = function(uid,cb) {
		self.getObj(uid,main_name,"action",function(action) {
			action = Number(action) || 0
			var diff = Date.now() - action
			if(diff < ONE_TIME){
				cb(false,"体力不足")
				return
			}
			if(diff > MAX_TIME)
				action = Date.now() - MAX_TIME
			action += ONE_TIME
			self.setObj(uid,main_name,"action",action)
			cb(true,action)
		})
	}
}