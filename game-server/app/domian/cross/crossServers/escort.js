//跨服押镖玩法
const escort_base = require("../../../../config/gameCfg/escort_base.json")
const escort_cfg = require("../../../../config/gameCfg/escort_cfg.json")
const escort_samsara = require("../../../../config/gameCfg/escort_samsara.json")
const runTime = 1000
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

	for(var samsara in escort_samsara){
		local.carMap[samsara] = []
		local.subscribeUsers[samsara] = []
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
		for(var samsara in local.carMap){
			var finishList = []
			for(var i = 0;i < local.carMap[samsara].length;i++){
				if(local.carMap[samsara][i]["time"] < endTime){
					finishList = local.carMap[samsara].splice(i,local.carMap[samsara].length)
				}
			}
			for(var i = 0;i < finishList.length;i++){
				local.escortFinish(finishList[i]["uid"],samsara)
			}
		}
	}
	//押镖完成
	local.escortFinish = function(uid,samsara) {
		var carInfo = local.userInfos[uid]["carInfo"]
		if(carInfo){
			//镖车刷新
			local.userInfos[uid]["quality"] = "car0"
			local.updateEscortCar(uid)
			local.userInfos[uid]["carInfo"] = false
			local.userInfos[uid]["escortNum"]++
			//计算收益
			var baseAward = escort_samsara[samsara][carInfo.quality+"_base"]
			var playAward = escort_samsara[samsara][carInfo.quality+"_play"]
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
			self.addItemStr(uid,str,1,function(flag,data) {
				if(flag){
					var notify = {
						type : "escortFinish",
						awardList : data,
						carInfo : carInfo
					}
					self.sendToUser(uid,notify)
				}
			})
			var notify = {
				type : "escortFinish",
				uid : uid
			}
			local.sendCarMessage(samsara,notify)
		}else{
			console.error("escortFinish error"+uid)
		}
	}
	//初始化玩家信息
	local.userInit = function(uid) {
		var team = self.userTeam(uid)
		if(!team){
			cb(false,"跨服数据未同步")
			return
		}
		var curLv = team[0].level
		var samsara = Math.floor(((curLv - 1) / 100))
		var info = {
			"escortNum" : 0,
			"robNum" : 0,
			"samsara" : samsara,
			"quality" : "car0",
			"carInfo" : false
		}
		local.userInfos[uid] = info
		local.updateEscortCar(uid)
		return local.userInfos[uid]
	}
	//获取我的镖车信息
	this.getEscortInfo = function(uid,cb) {
		if(!this.state){
			cb(false,"玩法未开启")
			return
		}
		if(!local.userInfos[uid]){
			local.userInit(uid)	
		}
		cb(true,local.userInfos[uid])
	}
	//获取并订阅镖车消息
	this.subscribeCarMessage = function(uid,cb) {
		if(!local.userInfos[uid]){
			cb(false,"未参与玩法")
			return
		}
		if(local.subscribeMaps[uid]){
			cb(false,"消息已订阅")
			return
		}
		var samsara = local.userInfos[uid]["samsara"]
		var info = {uid : uid,sid : self.players[uid]["cid"]}
		local.subscribeUsers[samsara].push(info)
		local.subscribeMaps[uid] = info
		var carList = local.carMap[samsara].slice(-10)
		cb(true,carList)
	}
	//取消订阅
	this.unSubscribeCarMessage = function(uid,cb) {
		if(!local.userInfos[uid]){
			if(cb)
				cb(false,"未参与玩法")
			return
		}
		var samsara = local.userInfos[uid]["samsara"]
		var info = local.subscribeMaps[uid]
		local.subscribeUsers[samsara].remove(info)
		delete local.subscribeMaps[uid]
		console.log(local.subscribeUsers[samsara])
		if(cb)
			cb(true)
	}
	//发送镖车消息给订阅玩家
	local.sendCarMessage = function(samsara,notify) {
		self.sendByTypeToUser("escort",local.subscribeUsers[samsara],notify)
	}
	//镖车刷新
	this.updateEscortCar = function(uid,cb) {
		if(!this.state){
			cb(false,"玩法未开启")
			return
		}
		if(!local.userInfos[uid]){
			cb(false,"未参与玩法")
			return
		}
		if(local.userInfos[uid]["carInfo"]){
			cb(false,"正在押镖中")
			return
		}
		var quality = local.userInfos[uid]["quality"]
		if(!carWeight[quality]){
			cb(false,"镖车已不能刷新")
			return
		}
		console.log(escort_cfg["refresh"]["value"])
		this.consumeItems(uid,escort_cfg["refresh"]["value"],1,function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				cb(true,local.updateEscortCar(uid))
			}
		})
	}
	//镖车刷新
	local.updateEscortCar = function(uid) {
		var quality = local.userInfos[uid]["quality"]
		var rand = Math.random() * carWeight[quality]["allRand"]
		for(var i = 0;i < carWeight[quality]["weightList"].length;i++){
			if(rand < carWeight[quality]["weightList"][i]["value"]){
				quality = carWeight[quality]["weightList"][i]["name"]
				local.userInfos[uid]["quality"] = quality
				break
			}
		}
		return quality
	}
	//开始押镖
	this.beginEscort = function(uid,cb) {
		if(!this.state){
			cb(false,"玩法未开启")
			return
		}
		if(!local.userInfos[uid]){
			cb(false,"未参与玩法")
			return
		}
		if(local.userInfos[uid]["carInfo"]){
			cb(false,"正在押镖中")
			return
		}
		if(this.curHours >= (escort_cfg["closeTime1"]["value"] - 0.017) || this.curHours >= (escort_cfg["closeTime2"]["value"] - 0.017)){
			cb(false,"现在不能押镖")
			return
		}
		if(local.userInfos[uid]["escortNum"] >= 2){
			cb(false,"押镖次数已用完")
			return
		}
		var team = this.userTeam(uid)
		if(!team){
			cb(false,"跨服数据未同步")
			return
		}
		var samsara = local.userInfos[uid]["samsara"]
		if(!local.carMap[samsara]){
			cb(false,"该等级未开放押镖")
			return
		}
		var carInfo = {
			"uid" : uid,
			"user" : self.getSimpleUser(uid),
			"time" : Date.now(),
			"quality" : local.userInfos[uid]["quality"],
			"team" : team,
			"robCount" : 0
		}
		local.userInfos[uid]["carInfo"] = carInfo
		local.carMap[samsara].push(carInfo)
		var notify = {
			type : "beginEscort",
			uid : uid,
			user : carInfo.user,
			time : carInfo.time,
			quality : carInfo.quality
		}
		local.sendCarMessage(samsara,notify)
		cb(true,carInfo)
	}
	//劫镖
	this.robEscort = function() {
		
	}
}