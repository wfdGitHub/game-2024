//任务系统
var task_cfg = require("../../../../config/gameCfg/task_cfg.json")
var main_task = require("../../../../config/gameCfg/main_task.json")
var task_type = require("../../../../config/gameCfg/task_type.json")
var liveness_cfg = require("../../../../config/gameCfg/liveness.json")
var war_horn = require("../../../../config/gameCfg/war_horn.json")
var week_target = require("../../../../config/gameCfg/week_target.json")
var task_week_loop = require("../../../../config/gameCfg/task_week_loop.json")
var default_cfg = require("../../../../config/gameCfg/default_cfg.json")
var util = require("../../../../util/util.js")
var async = require("async")
var main_name = "task"
var liveness_name = "liveness"
var war_name = "war_horn"
var first_task = {}
var day_task = {}
var week_task = {}
var month_task = {}
var week_target_task = {}
var topic_recruit_task = {}
var week_loop_task = {}
var officer_task = {}
for(var taskId in task_cfg){
	if(task_cfg[taskId].first)
		first_task[taskId] = task_cfg[taskId]
	if(task_cfg[taskId].refresh == "day")
		day_task[taskId] = task_cfg[taskId]
	if(task_cfg[taskId].refresh == "week")
		week_task[taskId] = task_cfg[taskId]
	if(task_cfg[taskId].refresh == "month")
		month_task[taskId] = task_cfg[taskId]
	if(task_cfg[taskId].refresh == "week_target")
		week_target_task[taskId] = task_cfg[taskId]
	if(task_cfg[taskId].refresh == "topic")
		topic_recruit_task[taskId] = task_cfg[taskId]
	if(task_cfg[taskId].refresh == "week_loop")
		week_loop_task[taskId] = task_cfg[taskId]
	if(task_cfg[taskId].refresh == "officer")
		officer_task[taskId] = task_cfg[taskId]
}
for(var i in week_target){
	var task_list = JSON.parse(week_target[i]["task_list"])
	for(var j = 0;j < task_list.length;j++){
		if(task_cfg[task_list[j]]){
			week_target_task[task_list[j]] = week_target[i]["day"]
		}else{
			console.error("七日目标任务不存在",task_list[j])
		}
	}
}
for(var i in main_task){
	main_task[i].refresh = "main"
	if(task_cfg[i])
		console.error("taskId 重复",i)
	task_cfg[i] = main_task[i]
}
module.exports = function() {
	var self = this
	var userTaskLists = {}			//玩家任务列表
	var userTaskMaps = {}			//玩家任务类型映射表
	//角色创建后领取初始任务
	this.taskInit = function(uid) {
		for(var taskId in first_task){
			this.gainTask(uid,taskId,0)
		}
		for(var taskId in week_target_task){
			this.gainTask(uid,taskId,0)
		}
		for(var taskId in officer_task){
			this.gainTask(uid,taskId,0)
		}
		this.gainTask(uid,900001,0)
	}
	//领取任务
	this.gainTask = function(uid,taskId,value) {
		if(!task_cfg[taskId]){
			console.error("任务不存在:"+taskId)
			return
		}
		var type = task_cfg[taskId]["type"]
		switch(type){
			case "loadLv":
				value = this.getLordLv(uid)
			break
			case "checkpoints":
				value = this.getCheckpointsInfo(uid) >= task_cfg[taskId]["arg"] ? 1 : 0
			break
			case "totalCe":
				value = this.getCE(uid)
			break
			case "passFb":
				value = this.checkPassFB(uid) ? 1 : 0
			break
			case "battleNum":
				value = this.getTeamNum(uid) >= task_cfg[taskId]["arg"] ? 1 : 0
			break
			case "heroLv":
				value = this.getLordAtt(uid,"heroLv") >= task_cfg[taskId]["arg"] ? 1 : 0
			break
			case "ss_pass":
				value = this.getLordAtt(uid,"maxSS") >= task_cfg[taskId]["arg"] ? 1 : 0
			break
			case "rank":
				value = (10000 - this.getAreaHighestRank(uid)) >= task_cfg[taskId]["arg"] ? 1 : 0
			break
			case "ttt_lv":
				value = this.getLordAtt(uid,"ttt_lv") >= task_cfg[taskId]["arg"] ? 1 : 0
			break 
		}
		self.setObj(uid,main_name,taskId,value || 0)
		if(userTaskLists[uid])
			userTaskLists[uid][taskId] = value || 0
		if(userTaskMaps[uid]){
			let type = task_cfg[taskId].type
			if(!userTaskMaps[uid][type])
				userTaskMaps[uid][type] = []
			else
				userTaskMaps[uid][type].remove(taskId)
			userTaskMaps[uid][type].push(taskId)
		}
		return value
	}
	//完成任务领取奖励
	this.finishTask = function(uid,taskId,cb) {
		if(!userTaskLists[uid] || userTaskLists[uid][taskId] == undefined){
			cb(false,"任务不存在")
			return
		}
		if(userTaskLists[uid][taskId] < task_cfg[taskId]["value"]){
			cb(false,"任务未完成")
			return
		}
		if(week_target_task[taskId] && this.players[uid].userDay < week_target_task[taskId]){
			cb(false,"该任务需要服务器开启时间达到才可完成 "+this.players[uid].userDay+"/"+week_target_task[taskId])
			return
		}
		let award = task_cfg[taskId].award
		let awardList = []
		if(award)
			awardList = this.addItemStr(uid,award,1,"任务奖励"+taskId)
		let info = {
			awardList : awardList
		}
		if(task_cfg[taskId].exp){
			info.exp = task_cfg[taskId].exp
			self.incrbyObj(uid,war_name,"exp",task_cfg[taskId].exp)
		}
		if(task_cfg[taskId].liveness){
			info.liveness = task_cfg[taskId].liveness
			self.incrbyObj(uid,liveness_name,"value",task_cfg[taskId].liveness)
			self.taskUpdate(uid,"liveness",task_cfg[taskId].liveness)
		}
		if(task_cfg[taskId].next){
			let next = task_cfg[taskId].next
			var value = 0
			if(task_cfg[taskId].inherit)
				value = userTaskLists[uid][taskId]
			info.value = this.gainTask(uid,task_cfg[taskId].next,value)
			info.next = next
		}
		if(week_target_task[taskId]){
			self.incrbyObj(uid,"week_target","taskCount",1)
		}
		if(userTaskMaps[uid]){
			let type = task_cfg[taskId].type
			if(userTaskMaps[uid][type])
				userTaskMaps[uid][type].remove(taskId)
		}
		self.delObj(uid,main_name,taskId)
		delete userTaskLists[uid][taskId]
		cb(true,info)
	}
	//加载角色任务数据
	this.taskLoad = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			var taskList = {}
			var taskMap = {}
			for(var taskId in data){
				if(task_cfg[taskId]){
					let value = Number(data[taskId])
					let type = task_cfg[taskId].type
					taskList[taskId] = value
					if(!taskMap[type])
						taskMap[type] = []
					taskMap[type].push(taskId)
				}
			}
			userTaskLists[uid] = taskList
			userTaskMaps[uid] = taskMap
			if(cb)
				cb()
		})
	}
	//移除角色任务数据
	this.taskUnload = function(uid) {
		delete userTaskLists[uid]
		delete userTaskMaps[uid]
	}
	//每日任务刷新
	this.dayTaskRefresh = function(uid) {
		for(var taskId in day_task){
			this.gainTask(uid,taskId,0)
		}
		var info = {
			value : 0
		}
		for(var i in liveness_cfg){
			info["index_"+i] = 1
		}
		self.setHMObj(uid,liveness_name,info)
	}
	//每周任务刷新
	this.weekTaskRefresh = function(uid) {
		for(var taskId in week_task){
			self.gainTask(uid,taskId,0)
		}
		for(var taskId in week_loop_task){
			self.gainTask(uid,taskId,0)
		}
	}
	//每月任务刷新
	this.monthTaskRefresh = function(uid) {
		for(var taskId in month_task){
			self.gainTask(uid,taskId,0)
		}
		self.delObjAll(uid,war_name,function() {
			var info = {
				exp : 0,
				high : 0
			}
			self.setHMObj(uid,war_name,info)
		})
	}
	//获取任务列表
	this.getTaskList = function(uid,cb) {
		cb(true,userTaskLists[uid])
	}
	//任务进度更新
	this.taskUpdate = function(uid,type,value,arg) {
		value = Number(value)
		if(userTaskMaps[uid] && userTaskMaps[uid][type]){
			for(var i = 0;i < userTaskMaps[uid][type].length;i++){
				var taskId = userTaskMaps[uid][type][i]
				if(!arg || (task_type[type].equal && arg == task_cfg[taskId].arg) || (!task_type[type].equal && arg >= task_cfg[taskId].arg)){
					var oldValue = userTaskLists[uid][taskId]
					if(type == "totalCe"){
						if(value <= userTaskLists[uid][taskId])
							continue
						userTaskLists[uid][taskId] = value
						self.setObj(uid,main_name,taskId,value)
					}else{
						userTaskLists[uid][taskId] += value
						self.incrbyObj(uid,main_name,taskId,value)
					}
					if(!oldValue || oldValue < task_cfg[taskId]["value"]){
						var notify = {
							"type" : "taskUpdate",
							"taskId" : taskId,
							"value" : userTaskLists[uid][taskId]
						}
						if(notify.value > task_cfg[taskId]["value"])
							notify.value = task_cfg[taskId]["value"]
						self.sendToUser(uid,notify)
					}
				}
			}
		}
	}
	//任务进度未完成则清空
	this.taskProgressClear = function(uid,type) {
		if(userTaskMaps[uid] && userTaskMaps[uid][type]){
			for(let i = 0;i < userTaskMaps[uid][type].length;i++){
				let taskId = userTaskMaps[uid][type][i]
				if(userTaskLists[uid][taskId] < task_cfg[taskId].value){
					userTaskLists[uid][taskId] = 0
					var notify = {
						"type" : "taskUpdate",
						"taskId" : taskId,
						"value" : userTaskLists[uid][taskId]
					}
					self.sendToUser(uid,notify)
				}
			}
		}
	}
	//获取活跃度数据
	this.getLivenessData = function(uid,cb) {
		self.getObjAll(uid,liveness_name,function(data) {
			for(var i in data){
				data[i] = Number(data[i])
			}
			cb(true,data)
		})
	}
	//领取活跃度奖励
	this.gainLivenessAward = function(uid,index,cb) {
		if(!liveness_cfg[index]){
			cb(false,"宝箱不存在")
			return
		}
		self.getObjAll(uid,liveness_name,function(data) {
			if(data["index_"+index] != 1){
				cb(false,"已领取")
			}else if(data["value"] < liveness_cfg[index]["value"]){
				cb(false,"活跃度不足")
			}else{
				self.setObj(uid,liveness_name,"index_"+index,0)
				let awardList = self.addItemStr(uid,liveness_cfg[index]["award"],1,"活跃度宝箱"+index)
				cb(true,{awardList : awardList})
			}
		})
	}
	//获取战令数据
	this.getWarHornData = function(uid,cb) {
		self.getObjAll(uid,war_name,function(data) {
			for(var i in data){
				data[i] = Number(data[i])
			}
			cb(true,data)
		})
	}
	//购买战令等级
	this.buyWarHornLv = function(uid,count,cb) {
		if(!Number.isInteger(count) ||	count <= 0){
			cb(false,"count error "+count)
			return
		}
		self.getObj(uid,war_name,"exp",function(value) {
			value = Number(value)
			if(count * 1000 + value >= 101000){
				cb(false,"不能超出上限"+value)
				return
			}
			self.consumeItems(uid,default_cfg["horn_lv"]["value"],count,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					self.incrbyObj(uid,war_name,"exp",count * 1000,function(data) {
						cb(true,data)
					})
				}
			})
		})
	}
	//领取战令奖励
	this.gainWarHornAward = function(uid,lv,type,cb) {
		let curMonth = (new Date()).getMonth()
		if(!Number.isInteger(lv) || !war_horn[curMonth][type+"_"+lv]){
			cb(false,"等级不存在")
			return
		}
		if(type !== "base" && type !== "high"){
			cb(false,"type error "+type)
			return
		}
		self.getWarHornData(uid,function(flag,data) {
			if(data.exp < lv * 1000){
				cb(false,"经验不足 "+data.exp)
				return
			}
			if(data[type+"_"+lv]){
				cb(false,"已领取 ")
				return
			}
			if(type === "high" && data.high !== 1){
				cb(false,"战令未进阶")
				return
			}
			let awardList = self.addItemStr(uid,war_horn[curMonth][type+"_"+lv],1,"战令奖励"+lv)
			self.setObj(uid,war_name,type+"_"+lv,1)
			cb(true,{awardList : awardList})
		})
	}
	//清除七日任务
	this.clearWeekTarget = function(uid) {
		for(var taskId in userTaskLists[uid]){
			if(week_target_task[taskId]){
				if(userTaskMaps[uid]){
					let type = task_cfg[taskId].type
					if(userTaskMaps[uid][type])
						userTaskMaps[uid][type].remove(taskId)
				}
				self.delObj(uid,main_name,taskId)
				delete userTaskLists[uid][taskId]
			}
		}
	}
	//清除主题招募任务
	this.clearTopicRecruitTask = function(uid) {
		for(var taskId in userTaskLists[uid]){
			if(topic_recruit_task[taskId]){
				if(userTaskMaps[uid]){
					let type = task_cfg[taskId].type
					if(userTaskMaps[uid][type])
						userTaskMaps[uid][type].remove(taskId)
				}
				self.delObj(uid,main_name,taskId)
				delete userTaskLists[uid][taskId]
			}
		}
	}
	//查询任务是否存在
	this.checkTaskExist = function(uid,taskId) {
		if(!userTaskLists[uid])
			return false
		if(userTaskLists[uid] && userTaskLists[uid][taskId])
			return true
		else
			return false
	}
}