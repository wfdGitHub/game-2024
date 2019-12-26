//跨服押镖玩法
const escort_base = require("../../../../config/gameCfg/escort_base.json")
const escort_cfg = require("../../../../config/gameCfg/escort_cfg.json")
const escort_level = require("../../../../config/gameCfg/escort_level.json")
const runTime = escort_cfg["runTime"]["value"]
const messageName = "escort"
var carWeight = {}
for(var i in escort_base){
	if(escort_base[i]["u_weight"]){
		var list = escort_base[i]["u_weight"].split("&")
		var weightList = []
		var allRand = 0
		list.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var name = m_list[0]
			var value = parseInt(m_list[1])
			allRand += value
			weightList.push({name : name,value : allRand})
		})
		carWeight[i] = {allRand : allRand,weightList : weightList}
	}
}
module.exports = function() {
	var self = this
	var local = {}
	this.state = false		//活动状态  false  未开启  true  开启
	local.userInfos = {}
	local.carMap = {}			//镖车列表
	local.subscribeUsers = {}	//消息订阅列表
	local.subscribeMaps = {}	//映射表

	for(var level in escort_level){
		local.carMap[level] = []
		local.subscribeUsers[level] = []
	}
	this.curHours = 0
	//刷新
	this.escortUpdate = function(date) {
		this.curHours = date.getHours() + (date.getMinutes() / 60)
		if(this.state){
			//判断关闭
			if(!((this.curHours >= escort_cfg["openTime1"]["value"] && this.curHours < escort_cfg["closeTime1"]["value"]) || (this.curHours >= escort_cfg["openTime2"]["value"] && this.curHours < escort_cfg["closeTime2"]["value"]))){
				this.state = false
				local.close()
			}else{
				local.update(date)
			}
		}else{
			//判断开启
			if((this.curHours >= escort_cfg["openTime1"]["value"] && this.curHours < escort_cfg["closeTime1"]["value"]) || (this.curHours >= escort_cfg["openTime2"]["value"] && this.curHours < escort_cfg["closeTime2"]["value"])){
				this.state = true
				local.open()
			}
		}
	}
	//押镖玩法开始
	local.open = function() {
		console.log("押镖玩法开始")
		local.userInfos = {}
	}
	//押镖玩法结束
	local.close = function() {
		console.log("押镖玩法结束")
	}
	//刷新
	local.update = function(date) {
		var endTime = date.getTime() - runTime
		for(var level in local.carMap){
			var count = 0
			while(local.carMap[level].length > 0 && local.carMap[level][0]["time"] <= endTime){
				count++
				var carInfo = local.carMap[level].shift()
				local.escortFinish(carInfo["crossUid"],level)
				if(count > 100){
					break
				}
			}
		}
	}
	//押镖完成
	local.escortFinish = function(crossUid,level) {
		var carInfo = local.userInfos[crossUid]["carInfo"]
		if(carInfo){
			//镖车刷新
			local.userInfos[crossUid]["quality"] = "car0"
			var nextQuality = local.updateEscortCar(crossUid)
			local.userInfos[crossUid]["carInfo"] = false
			local.userInfos[crossUid]["escortNum"]++
			//计算收益
			var baseAward = escort_level[level][carInfo.quality+"_base"]
			var playAward = escort_level[level][carInfo.quality+"_play"]
			var rate = (1 - carInfo.robCount * escort_cfg["loseRate"]["value"])
			var str = ""
			var list = baseAward.split("&")
			for(var i = 0;i < list.length;i++){
				var m_list = list[i].split(":")
				var itemId = m_list[0]
				var value = parseInt(m_list[1] * rate)
				if(i != 0){
					str += "&"
				}
				str += itemId + ":" + value
			}
			str += "&"+playAward
			var title = escort_cfg["passTitle"]["value"]
			var text = escort_cfg["passText"]["value"]
			self.sendAward(crossUid,title,text,str,function(flag,data) {
				if(flag){
					var notify = {
						type : "myEscortFinish",
						awardList : data,
						nextQuality : nextQuality,
						carInfo : carInfo,
						time : Date.now()
					}
					self.sendToUser(messageName,crossUid,notify)
					local.userInfos[crossUid]["messageList"].push(notify)
				}
			})
			var notify = {
				type : "escortFinish",
				crossUid : crossUid
			}
			local.sendCarMessage(level,notify)
		}else{
			console.error("escortFinish error"+crossUid)
		}
	}
	//劫镖完成
	local.robFinish = function(crossUid,target,winFlag,carInfo,cb) {
		//添加记录
		var atkUser = self.getSimpleUser(crossUid)
		var defUser = self.getSimpleUser(target)
		var fightRecord = self.fightContorl.getFightRecord()
		var info = {type : "robbed",carInfo : carInfo,winFlag : winFlag,fightRecord : fightRecord,atkUser : atkUser,defUser : defUser,time : Date.now()}
		local.userInfos[crossUid]["messageList"].push(info)
		self.sendToUser(messageName,crossUid,info)
		info = {type : "beenRobbed",carInfo : carInfo,winFlag : winFlag,fightRecord : fightRecord,atkUser : atkUser,defUser : defUser,time : Date.now()}
		local.userInfos[target]["messageList"].push(info)
		self.sendToUser(messageName,target,info)
		//判断胜负
		if(winFlag){
			local.robSuccess(crossUid,target,winFlag,carInfo,cb)
		}else{
			cb(true,{"success" : false})
		}
	}
	//劫镖成功收益
	local.robSuccess = function(crossUid,target,winFlag,carInfo,cb) {
		var level = local.userInfos[crossUid]["level"]
		var baseAward = escort_level[level][carInfo.quality+"_base"]
		var robAward = escort_level[level][carInfo.quality+"_rob"]
		var rate = escort_cfg["robRate"]["value"]
		var str = ""
		var list = baseAward.split("&")
		for(var i = 0;i < list.length;i++){
			var m_list = list[i].split(":")
			var itemId = m_list[0]
			var value = parseInt(m_list[1] * rate)
			if(i != 0){
				str += "&"
			}
			str += itemId + ":" + value
		}
		str += "&"+robAward
		var title = escort_cfg["robTitle"]["value"]
		var text = escort_cfg["robText"]["value"]
		self.sendAward(crossUid,title,text,str,function(flag,data) {
			var info = {
				"success" : true,
				"awardList" : data
			}
			cb(flag,info)
		})
		carInfo.robCount++
		var notify = {
			type : "robSuccess",
			crossUid : crossUid,
			target : target,
			robCount : carInfo.robCount
		}
		local.sendCarMessage(level,notify)
	}
	//初始化玩家信息
	local.userInit = function(crossUid) {
		var team = self.userTeam(crossUid)
		if(!team){
			return
		}
		var curLv = self.players[crossUid]["playerInfo"]["level"]
		var level = 0
		console.log("curLv",curLv)
		for(var i in escort_level){
			if(curLv <= escort_level[i]["lev_limit"]){
				level = Number(i)
				break
			}
		}
		var info = {
			"escortNum" : 0,
			"robNum" : 0,
			"level" : level,
			"quality" : "car0",
			"carInfo" : false,
			"messageList" : []
		}
		local.userInfos[crossUid] = info
		local.updateEscortCar(crossUid)
		return local.userInfos[crossUid]
	}
	//获取我的镖车信息
	this.getEscortInfo = function(crossUid,cb) {
		if(!this.state){
			cb(false,"玩法未开启")
			return
		}
		if(!local.userInfos[crossUid]){
			local.userInit(crossUid)	
		}
		cb(true,local.userInfos[crossUid])
	}
	//获取并订阅镖车消息
	this.subscribeCarMessage = function(crossUid,cb) {
		if(!local.userInfos[crossUid]){
			cb(false,"未参与玩法")
			return
		}
		if(local.subscribeMaps[crossUid]){
			cb(false,"消息已订阅")
			return
		}
		var level = local.userInfos[crossUid]["level"]
		var info = {uid : self.players[crossUid]["uid"],sid : self.players[crossUid]["cid"]}
		local.subscribeUsers[level].push(info)
		local.subscribeMaps[crossUid] = info
		var carList = local.carMap[level].slice(-10)
		cb(true,carList)
	}
	//取消订阅
	this.unSubscribeCarMessage = function(crossUid,cb) {
		if(!local.userInfos[crossUid]){
			if(cb)
				cb(false,"未参与玩法")
			return
		}
		var info = local.subscribeMaps[crossUid]
		if(!info){
			if(cb)
				cb(false,"未订阅")
			return
		}
		var level = local.userInfos[crossUid]["level"]
		local.subscribeUsers[level].remove(info)
		delete local.subscribeMaps[crossUid]
		if(cb)
			cb(true)
	}
	//发送镖车消息给订阅玩家
	local.sendCarMessage = function(level,notify) {
		self.sendByTypeToUser(messageName,local.subscribeUsers[level],notify)
	}
	//镖车刷新
	this.updateEscortCar = function(crossUid,cb) {
		if(!this.state){
			cb(false,"玩法未开启")
			return
		}
		if(!local.userInfos[crossUid]){
			cb(false,"未参与玩法")
			return
		}
		if(local.userInfos[crossUid]["carInfo"]){
			cb(false,"正在押镖中")
			return
		}
		var quality = local.userInfos[crossUid]["quality"]
		if(!carWeight[quality]){
			cb(false,"镖车已不能刷新")
			return
		}
		this.consumeItems(crossUid,escort_cfg["refresh"]["value"],1,function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				cb(true,local.updateEscortCar(crossUid))
			}
		})
	}
	//镖车刷新
	local.updateEscortCar = function(crossUid) {
		var quality = local.userInfos[crossUid]["quality"]
		var rand = Math.random() * carWeight[quality]["allRand"]
		for(var i = 0;i < carWeight[quality]["weightList"].length;i++){
			if(rand < carWeight[quality]["weightList"][i]["value"]){
				quality = carWeight[quality]["weightList"][i]["name"]
				local.userInfos[crossUid]["quality"] = quality
				break
			}
		}
		return quality
	}
	//开始押镖
	this.beginEscort = function(crossUid,cb) {
		if(!this.state){
			cb(false,"玩法未开启")
			return
		}
		if(!local.userInfos[crossUid]){
			cb(false,"未参与玩法")
			return
		}
		if(local.userInfos[crossUid]["carInfo"]){
			cb(false,"正在押镖中")
			return
		}
		if((this.curHours < escort_cfg["closeTime1"]["value"] && this.curHours >= (escort_cfg["closeTime1"]["value"] - 0.17))
		 || (this.curHours < escort_cfg["closeTime2"]["value"] && this.curHours >= (escort_cfg["closeTime2"]["value"] - 0.17))){
			cb(false,"现在不能押镖")
			return
		}
		if(local.userInfos[crossUid]["escortNum"] >= escort_cfg["playCount"]["value"]){
			cb(false,"押镖次数已用完")
			return
		}
		var team = this.userTeam(crossUid)
		if(!team){
			cb(false,"跨服数据未同步")
			return
		}
		var level = local.userInfos[crossUid]["level"]
		if(!local.carMap[level]){
			cb(false,"该等级未开放押镖")
			return
		}
		var carInfo = {
			"crossUid" : crossUid,
			"user" : self.getSimpleUser(crossUid),
			"time" : Date.now(),
			"quality" : local.userInfos[crossUid]["quality"],
			"team" : team,
			"robCount" : 0
		}
		local.userInfos[crossUid]["carInfo"] = carInfo
		local.carMap[level].push(carInfo)
		var notify = {
			type : "beginEscort",
			crossUid : crossUid,
			user : carInfo.user,
			time : carInfo.time,
			quality : carInfo.quality
		}
		local.sendCarMessage(level,notify)
		cb(true,carInfo)
	}
	//劫镖
	this.robEscort = function(crossUid,target,cb) {
		if(!this.state){
			cb(false,"玩法未开启")
			return
		}
		if(!local.userInfos[crossUid]){
			cb(false,"未参与玩法")
			return
		}
		if(!local.userInfos[target] || !local.userInfos[target]["carInfo"]){
			cb(false,"镖车不存在")
			return
		}
		var carInfo = local.userInfos[target]["carInfo"]
		if(crossUid == target){
			cb(false,"不能抢劫自己的镖车")
			return
		}
		if(local.userInfos[crossUid]["robNum"] >= escort_cfg["robCount"]["value"]){
			cb(false,"劫镖次数已用完")
			return
		}
		if(carInfo["robCount"] >= escort_cfg["loseCount"]["value"]){
			cb(false,"该镖车已经被抢太多次了,给他留一点吧")
			return
		}
		var atkTeam = this.userTeam(crossUid)
		if(!atkTeam){
			cb(false,"跨服数据未同步")
			return
		}
		local.userInfos[crossUid]["robNum"]++
		var defTeam = carInfo["team"]
		var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : Date.now()})
		local.robFinish(crossUid,target,winFlag,carInfo,cb)
	}
}