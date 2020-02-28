//任务系统
var task_cfg = require("../../../../config/gameCfg/task_cfg.json")
var task_type = require("../../../../config/gameCfg/task_type.json")
var async = require("async")
var main_name = "task"
module.exports = function() {
	var self = this
	var userTaskLists = {}			//玩家任务列表
	var userTaskMaps = {}			//玩家任务类型映射表
	//角色创建后领取初始任务
	this.taskInit = function(uid) {
		for(var taskId in task_cfg){
			if(task_cfg[taskId].refresh == "day" || task_cfg[taskId].first)
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
			userTaskMaps[uid][type].push(taskId)
		}
	}
	//完成任务领取奖励
	this.finishTask = function(uid,taskId,cb) {
		if(!userTaskLists[uid] || !userTaskLists[uid][taskId]){
			cb(false,"任务不存在")
			return
		}
		if(userTaskLists[uid][taskId] < task_cfg[taskId]["value"]){
			cb(false,"任务未完成")
			return
		}
		self.delObj(uid,main_name,taskId)
		if(userTaskLists[uid][taskId])
			delete userTaskLists[uid][taskId]
		if(userTaskMaps[uid]){
			let type = task_cfg[taskId].type
			if(userTaskMaps[uid][type])
				userTaskMaps[uid][type].remove(taskId)
		}
		let award = task_cfg[taskId].award
		let awardList = this.addItemStr(uid,award)
		let info = {
			awardList : awardList
		}
		if(task_cfg[taskId].next){
			let next = task_cfg[taskId].next
			if(task_type[next].type].inherit)
				info.value = value
			this.gainTask(uid,task_cfg[taskId].next,info.value)
			info.next = next
		}
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
		for(var taskId in task_cfg){
			if(task_cfg[taskId].refresh == "day")
				this.gainTask(uid,taskId,0)
		}
	}
	//获取任务列表
	this.getTaskList = function(uid,cb) {
		if(userTaskLists[uid]){
			cb(true,userTaskLists[uid])
		}else{
			this.taskLoad(uid,function() {
				cb(true,userTaskLists[uid])
			})
		}
	}
	//任务进度更新
	this.taskUpdate = function(uid,type,value,arg) {
		value = Number(value)
		if(userTaskMaps[uid] && userTaskMaps[uid][type]){
			for(let i = 0;i < userTaskMaps[uid][type].length;i++){
				let taskId = userTaskMaps[uid][type][i]
				if(!arg || arg >= task_cfg[taskId].arg){
					userTaskLists[uid][taskId] += value
					self.incrbyObj(uid,main_name,taskId,value)
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
}