//游历系统
const tour_quality = require("../../../../config/gameCfg/tour_quality.json")
const tour_task = require("../../../../config/gameCfg/tour_task.json")
const heros = require("../../../../config/gameCfg/heros.json")
const uuid = require("uuid")
const async = require("async")
var tour_quality_list = {}
for(let i in tour_task){
	tour_task[i]["need_realm"] = JSON.parse(tour_task[i]["need_realm"])
	if(!tour_quality_list[tour_task[i]["quality"]])
		tour_quality_list[tour_task[i]["quality"]] = []
	tour_quality_list[tour_task[i]["quality"]].push(Number(i))
}
var allWeight = 0
var weights = {}
for(let i in tour_quality){
	weights[i] = tour_quality[i]["weight"] + allWeight
	allWeight = weights[i]
}
var main_name = "tour"
module.exports = function() {
	var self = this
	var local = {}
	//获取游历数据
	this.getTourData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data){
				let list = local.createTour()
				self.setHMObj(uid,main_name,list)
				cb(true,list)
			}else{
				cb(true,data)
			}
		})
	}
	//元宝刷新
	this.refreshTourByGold = function(uid,cb) {
		self.consumeItems(uid,"202:30",1,function(flag,err) {
			if(flag){
				let list = local.createTour()
				self.setHMObj(uid,main_name,list)
				cb(true,list)
			}
			else{
				cb(flag,err)
			}
		})
	}
	//刷新券刷新
	this.refreshTourByItem = function(uid,cb) {
		self.consumeItems(uid,"1000160:1",1,function(flag,err) {
			if(flag){
				let list = local.createTour()
				self.setHMObj(uid,main_name,list)
				cb(true,list)
			}
			else{
				cb(flag,err)
			}
		})
	}
	//进行游历任务
	this.runTour = function(uid,index,hIds,cb) {
		if(!Number.isInteger(index) || !hIds || !hIds.length){
			cb(false,"arg error")
			return
		}
		var taskId,quality
		async.waterfall([
			function(next) {
				//查找任务
				self.getObj(uid,main_name,"waiting_"+index,function(data) {
					taskId = Number(data)
					if(!tour_task[taskId]){
						next("找不到该任务")
						return
					}
					quality = tour_task[taskId]["quality"]
					next()
				})
			},
			function(next) {
				//条件判断
				self.heroDao.getHeroList(self.areaId,uid,hIds,function(flag,list) {
					if(!flag){
						cb(flag,list)
					}else{
						let num = 0
						let realms = {}
						let maxStar = 0
						for(let i = 0;i < list.length;i++){
							if(list[i]){
								num++
								realms[heros[list[i]["id"]]["realm"]] = true
								if(list[i]["star"] > maxStar)
									maxStar = list[i]["star"]
							}
						}
						if(num > tour_quality[quality]["heroNum"]){
							next("英雄数量超出")
							return
						}
						if(maxStar < tour_quality[quality]["need_star"]){
							next("星级不符合")
							return
						}
						for(let i = 0;i < tour_task[taskId]["need_realm"].length;i++){
							if(!realms[tour_task[taskId]["need_realm"][i]]){
								next("种族不符合")
								return
							}
						}
						next()

					}
				})
			},
			function(next) {
				//冻结判断
				let arr = []
				for(var i = 0;i < hIds.length;i++){
					arr.push("free_"+hIds[i])
				}
				self.getHMObj(uid,main_name,arr,function(list) {
					for(var i = 0;i < list.length;i++){
						if(list[i]){
							next("该武将已进行任务"+i)
							return
						}
					}
					next()
				})
			},
			function(next) {
				//消耗游历值
				let str = "204:"+tour_quality[quality]["tour"]
				self.consumeItems(uid,str,1,function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//进行任务
				let id = uuid.v1()
				let taskInfo = {
					taskId : taskId,
					hIds : hIds,
					time : Date.now()
				}
				self.setObj(uid,main_name,"run_"+id,JSON.stringify(taskInfo))
				self.delObj(uid,main_name,"waiting_"+index)
				for(var i = 0;i < hIds.length;i++){
					self.setObj(uid,main_name,"free_"+hIds[i],1)
				}
				cb(true,{taskInfo:taskInfo,id:id})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//领取任务奖励
	this.gainTourAward = function(uid,id,cb) {
		self.getObj(uid,main_name,"run_"+id,function(data) {
			if(!data){
				cb(false,"id error")
				return
			}
			var taskInfo = JSON.parse(data)
			if(taskInfo.time + tour_quality[tour_task[taskInfo.taskId]["quality"]].time - 1805000 > Date.now()){
				cb(false,"任务时间未满")
				return
			}
			for(var i = 0;i < taskInfo.hIds.length;i++){
				self.delObj(uid,main_name,"free_"+taskInfo.hIds[i])
			}
			self.delObj(uid,main_name,"run_"+id)
			var awardList = self.addItemStr(uid,tour_task[taskInfo.taskId]["award"])
			cb(true,awardList)
		})
	}
	//加速完成游历任务
	this. speedUpTour = function(uid,id,cb) {
		self.getObj(uid,main_name,"run_"+id,function(data) {
			if(!data){
				cb(false,"id error")
				return
			}
			var taskInfo = JSON.parse(data)
			if(taskInfo.time + tour_quality[tour_task[taskInfo.taskId]["quality"]].time - 1800000 < Date.now()){
				cb(false,"不需要加速")
				return
			}
			let str = "202:"+tour_quality[tour_task[taskInfo.taskId]["quality"]]["speedUp"]
			self.consumeItems(uid,str,1,function(flag,err) {
				if(flag){
					for(var i = 0;i < taskInfo.hIds.length;i++){
						self.delObj(uid,main_name,"free_"+taskInfo.hIds[i])
					}
					self.delObj(uid,main_name,"run_"+id)
					var awardList = self.addItemStr(uid,tour_task[taskInfo.taskId]["award"])
					cb(true,awardList)
				}
				else{
					cb(false,err)
				}
			})
		})
	}
	//生成游历任务
	local.createTour = function() {
		let list = {}
		for(let i = 1;i <= 6;i++){
			let rand = Math.random() * allWeight
			for(let quality in weights){
				if(rand < weights[quality]){
					let taskId = tour_quality_list[quality][Math.floor(Math.random() * tour_quality_list[quality].length)]
					list["waiting_"+i] = taskId
					break
				}
			}
		}
		return list
	}
}