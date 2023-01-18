//返利活动
const oneDayTime = 172799998  //两天时间  截止时间为当日0点-次日24点
module.exports = function() {
	var self = this
	this.rebate_item_map = {}
	this.rebate_item = {
		"rmb" : 0,
		"title" : "返利标题",
		"text" : "返利内容",
		"award" : "奖励内容",
		"beginTime" : 0,
		"endTime" : 0
	}
	this.rebate_gold_map = {}
	this.rebate_gold = {
		"title" : "返利标题",
		"text" : "返利内容",
		"rate" : 0,
		"beginTime" : 0,
		"endTime" : 0
	}
	this.rebate_rmb_map = {}
	this.rebate_rmb = {
		"title" : "返利标题",
		"text" : "返利内容",
		"rate" : 0,
		"beginTime" : 0,
		"endTime" : 0
	}
	this.rebateInit = function() {
		// console.log("rebateInit")
		var curTime = Date.now()
		self.redisDao.db.hgetall("rebate_item_map",function(err,data) {
			if(data){
				self.rebate_item_map = data
				for(var i in data){
					self.rebate_item_map[i] = JSON.parse(data[i])
					self.rebate_item_map[i]["endTime"] += oneDayTime
					if(curTime < self.rebate_item_map[i]["beginTime"] || curTime > self.rebate_item_map[i]["endTime"])
						delete self.rebate_item_map[i]
				}
			}
			else
				self.rebate_item_map = {}
			// console.log("rebate_item_map",self.rebate_item_map)
		})
		self.redisDao.db.hgetall("rebate_rmb_map",function(err,data) {
			if(data){
				self.rebate_rmb_map = data
				for(var i in data){
					self.rebate_rmb_map[i] = JSON.parse(data[i])
					if(!self.rebate_rmb_map[i]["beginTime"])
						self.rebate_rmb_map[i]["beginTime"] = 0
					if(!self.rebate_rmb_map[i]["endTime"])
						self.rebate_rmb_map[i]["endTime"] = 10382256000000
					self.rebate_rmb_map[i]["endTime"] += oneDayTime
					self.rebate_rmb_map[i]["rate"] = Number(self.rebate_rmb_map[i]["rate"]) || 0
					if(curTime < self.rebate_rmb_map[i]["beginTime"] || curTime > self.rebate_rmb_map[i]["endTime"])
						delete self.rebate_rmb_map[i]
				}
			}
			else
				self.rebate_rmb_map = {}
			// console.log("rebate_rmb_map",self.rebate_rmb_map)
		})
		self.redisDao.db.hgetall("rebate_gold_map",function(err,data) {
			if(data){
				self.rebate_gold_map = data
				for(var i in data){
					self.rebate_gold_map[i] = JSON.parse(data[i])
					if(!self.rebate_gold_map[i]["beginTime"])
						self.rebate_gold_map[i]["beginTime"] = 0
					if(!self.rebate_gold_map[i]["endTime"])
						self.rebate_gold_map[i]["endTime"] = 10382256000000
					self.rebate_gold_map[i]["endTime"] += oneDayTime
					self.rebate_gold_map[i]["rate"] = Number(self.rebate_gold_map[i]["rate"]) || 0
					if(curTime < self.rebate_gold_map[i]["beginTime"] || curTime > self.rebate_gold_map[i]["endTime"])
						delete self.rebate_gold_map[i]
				}
			}
			else
				self.rebate_gold_map = {}
			// console.log("rebate_gold_map",self.rebate_gold_map)
		})
	}
	//计算返利活动
	this.rebateDayUpdate = function(uid) {
		var real_day = self.players[uid]["real_day"]
		var curTime = Date.now()
		self.chageLordData(uid,"rmb_day",0)
		self.chageLordData(uid,"real_day",0)
		var curTime = Date.now()
		if(self.players[uid].userDay > 1){
			for(var i in self.rebate_item_map){
				if(real_day >= self.rebate_item_map[i]["rmb"]){
					self.sendMail(uid,self.rebate_item_map[i]["title"],self.rebate_item_map[i]["text"],self.rebate_item_map[i]["award"])
				}
			}
			var index = 0
			for(var i in self.rebate_gold_map){
				if(real_day >= i){
					index = Number(i)
				}else{
					break
				}
			}
			if(self.rebate_gold_map[index]){
				self.sendMail(uid,self.rebate_gold_map[index]["title"],self.rebate_gold_map[index]["text"],"200:"+Math.floor(real_day/100 * self.rebate_gold_map[index]["rate"]))
			}
			var index = 0
			for(var i in self.rebate_rmb_map){
				if(real_day >= i){
					index = Number(i)
				}else{
					break
				}
			}
			if(self.rebate_rmb_map[index]){
				self.sendMail(uid,self.rebate_rmb_map[index]["title"],self.rebate_rmb_map[index]["text"],"110:"+Math.floor(real_day/100 * self.rebate_rmb_map[index]["rate"]))
			}
		}
	}
}