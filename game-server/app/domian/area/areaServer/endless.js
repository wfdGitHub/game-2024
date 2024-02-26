//无尽试炼
const endless_team = require("../../../../config/gameCfg/endless_team.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const ONE_TIME = default_cfg["endless_time"]["value"]
const BEGIN_TIME = default_cfg["endless_begin"]["value"]
const MAX_TIME = default_cfg["endless_maxTime"]["value"]

const async = require("async")
const main_name = "endless"
module.exports = function() {
	var self = this
	//获取数据
	this.getEndlessData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			if(!data.action)
				data.action = Date.now() - BEGIN_TIME
			self.setObj(uid,main_name,"action",data.action)
			cb(true,data)
		})
	}
	//挑战无尽试炼
	this.challengeEndless = function(uid,id,level,seededNum,masterSkills,cb) {
		var lv = self.getLordLv(uid)
		id = Number(id) || 0
		if(!endless_team[id] || lv < endless_team[id]["lv"] || !endless_team[id]["award_"+level]){
			cb(false,"id error "+id)
			return
		}
		self.endlessAtiontime(uid,function(flag,action) {
			if(!flag){
				cb(false,"体力不足")
				return
			}
			self.taskUpdate(uid,"endless_count",1)
			var atkTeam = self.getUserTeam(uid)
			var defTeam = self.fightContorl.getNPCTeamByType(main_name,endless_team[id]["team"],lv,"lv_"+level)
			var winFlag = self.fightContorl.videoFight(atkTeam,defTeam,{seededNum : seededNum,masterSkills : masterSkills})
			if(winFlag){
				//发放奖励
				var awardList = self.addItemStr(uid,endless_team[id]["award_"+level],1,"无尽试炼")
				self.incrbyPassKey(uid,"endless",1)
				cb(true,{awardList:awardList,action:action,winFlag:winFlag})
			}else{
				cb(false,{atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,masterSkills:masterSkills,winFlag:winFlag,action:action})
			}
		})
	}
	//消耗体力
	this.endlessAtiontime = function(uid,cb) {
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