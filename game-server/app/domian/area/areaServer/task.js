//任务系统
var task_cfg = require("../../../../config/gameCfg/task_cfg.json")
var task_type = require("../../../../config/gameCfg/task_type.json")
var liveness_cfg = require("../../../../config/gameCfg/liveness.json")
var war_horn = require("../../../../config/gameCfg/war_horn.json")
var week_target = require("../../../../config/gameCfg/week_target.json")
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
}
for(let i in week_target){
	let task_list = JSON.parse(week_target[i]["task_list"])
	for(let j = 0;j < task_list.length;j++){
		if(task_cfg[task_list[j]]){
			week_target_task[task_list[j]] = week_target[i]["day"]
		}else{
			console.error("七日目标任务不存在",task_list[j])
		}
	}
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
	}
	//领取任务
	this.gainTask = function(uid,taskId,value) {
		if(!task_cfg[taskId]){
			console.error("任务不存在:"+taskId)
			return
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
			awardList = this.addItemStr(uid,award)
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
		if(task_cfg[taskId].type == "always" && task_cfg[taskId].next){
			let next = task_cfg[taskId].next
			info.value = 0
			if(task_cfg[taskId].inherit)
				info.value = userTaskLists[uid][taskId]
			this.gainTask(uid,task_cfg[taskId].next,info.value)
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
		for(let taskId in day_task){
			this.gainTask(uid,taskId,0)
		}
		let info = {
			value : 0
		}
		for(let i in liveness_cfg){
			info["index_"+i] = 1
		}
		self.setHMObj(uid,liveness_name,info)
		self.getObj(uid,main_name,"week",function(week) {
			let curWeek = util.getWeek()
			if(week != curWeek){
				// console.log("跨周任务更新",week,curWeek)
				self.setObj(uid,main_name,"week",curWeek)
				for(let taskId in week_task){
					self.gainTask(uid,taskId,0)
				}
			}
			self.getObj(uid,main_name,"month",function(month) {
				let curMonth = util.getMonth()
				if(month != curMonth){
					// console.log("跨月任务更新",month,curMonth)
					self.setObj(uid,main_name,"month",curMonth)
					for(let taskId in month_task){
						self.gainTask(uid,taskId,0)
					}
					self.delObjAll(uid,war_name,function() {
						let info = {
							exp : 0,
							high : 0
						}
						self.setHMObj(uid,war_name,info)
					})
				}
			})
			self.taskUpdate(uid,"login",1)
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
			for(let i = 0;i < userTaskMaps[uid][type].length;i++){
				let taskId = userTaskMaps[uid][type][i]
				if(!arg || (task_type[type].equal && arg == task_cfg[taskId].arg) || (!task_type[type].equal && arg >= task_cfg[taskId].arg)){
					if(type == "totalCe"){
						userTaskLists[uid][taskId] = value
						self.setObj(uid,main_name,taskId,value)
					}else{
						userTaskLists[uid][taskId] += value
						self.incrbyObj(uid,main_name,taskId,value)
					}
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
				let awardList = self.addItemStr(uid,liveness_cfg[index]["award"])
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
	//进阶战令
	this.advanceWarHorn = function(uid,cb) {
		self.getObj(uid,war_name,"high",function(data) {
			if(data == 1){
				cb(false,"已进阶")
				return
			}
			self.setObj(uid,war_name,"high",1)
			cb(true)
		})
	}
	//购买等级
	this.buyWarHornLv = function(uid,count,cb) {
		if(!Number.isInteger(count) ||	count <= 0){
			cb(false,"count error "+count)
			return
		}
		self.getObj(uid,war_name,"exp",function(value) {
			value = Number(value)
			if(count * 1000 + value >= 51000){
				cb(false,"不能超出上限"+value)
				return
			}
			var needStr = "202:"+(count * 600)
			self.consumeItems(uid,needStr,1,function(flag,err) {
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
			let awardList = self.addItemStr(uid,war_horn[curMonth][type+"_"+lv])
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
}