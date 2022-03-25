//跨服押镖玩法
const escort_base = require("../../../../config/gameCfg/escort_base.json")
const escort_cfg = require("../../../../config/gameCfg/escort_cfg.json")
const escort_level = require("../../../../config/gameCfg/escort_level.json")
const util = require("../../../../util/util.js")
const runTime = escort_cfg["runTime"]["value"]
const robotNum = 30
const robotCheck = 10000
escort_cfg["robot_team"] = JSON.parse(escort_cfg["robot_team"]["value"])
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
	var robotTime = 0		//机器人检测时间
	this.state = false		//活动状态  false  未开启  true  开启
	local.userInfos = {}
	local.carMap = {}			//木牛列表
	local.timeMap = {}
	// local.subscribeUsers = {}	//消息订阅列表
	// local.subscribeMaps = {}	//映射表
	for(var level in escort_level){
		local.carMap[level] = []
		// local.subscribeUsers[level] = []
	}
	this.curHours = 0
	//刷新
	this.escortUpdate = function(date) {
		this.curHours = date.getHours() + (date.getMinutes() / 60)
		if(this.state){
			//判断关闭
			if(this.curHours >= escort_cfg["closeTime1"]["value"]){
				this.state = false
				local.close()
			}else{
				local.update(date)
			}
		}else{
			//判断开启
			if((this.curHours >= escort_cfg["openTime1"]["value"] && this.curHours < escort_cfg["closeTime1"]["value"])){
				this.state = true
				local.open()
			}
		}
	}
	//押镖玩法开始
	local.open = function() {
		console.log("押镖玩法开始")
		local.userInfos = {}
		local.robCD = {}
		local.timeMap = {}
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
				local.escortFinish(carInfo,level)
				if(count > 100){
					break
				}
			}
		}
		if(robotTime < date.getTime()){
			robotTime = date.getTime() + robotCheck
			for(var level in local.carMap){
				if(local.carMap[level].length <= robotNum){
					local.addRobot(level)
				}
			}
		}
	}
	//押镖完成
	local.escortFinish = function(carInfo,level) {
		crossUid = carInfo.crossUid
		if(carInfo.robot){
			delete local.userInfos[crossUid]
			return
		}
		if(carInfo){
			//木牛刷新
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
			self.sendAward(crossUid,title,text,str,"木牛流马奖励",function(flag,data) {
				if(flag){
					var notify = {
						type : "myEscortFinish",
						awardList : data,
						nextQuality : nextQuality,
						carInfo : carInfo,
						time : Date.now()
					}
					self.sendToUser(messageName,crossUid,notify)
					if(!local.userInfos[crossUid]){
						console.log("local.userInfos[crossUid] error ",local.userInfos[crossUid])
						console.log(local.userInfos)
						return
					}
					local.userInfos[crossUid]["messageList"].push(notify)
				}
			})
		}
	}
	//劫镖完成
	local.robFinish = function(crossUid,target,winFlag,carInfo,atkTeam,defTeam,seededNum,cb) {
		//添加记录
		var atkUser = self.getSimpleUser(crossUid)
		var defUser = carInfo.user
		var info = {type : "robbed",carInfo : carInfo,winFlag : winFlag,atkTeam : atkTeam,defTeam : defTeam,seededNum : seededNum,atkUser : atkUser,defUser : defUser,time : Date.now()}
		local.userInfos[crossUid]["messageList"].push(info)
		self.sendToUser(messageName,crossUid,info)
		if(!carInfo.robot){
			info = {type : "beenRobbed",carInfo : carInfo,winFlag : winFlag,atkTeam : atkTeam,defTeam : defTeam,seededNum : seededNum,atkUser : atkUser,defUser : defUser,time : Date.now()}
			local.userInfos[target]["messageList"].push(info)
			self.sendToUser(messageName,target,info)
		}
		//判断胜负
		if(winFlag){
			local.robSuccess(crossUid,target,winFlag,carInfo,cb)
		}else{
			cb(true,{"success" : false,"robCD" : local.userInfos[crossUid]["robCD"]})
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
		if(!carInfo.robot)
			carInfo.robCount++
		self.sendAward(crossUid,title,text,str,"奇袭奖励",function(flag,data) {
			var info = {
				"success" : true,
				"awardList" : data,
				"robCD" : local.userInfos[crossUid]["robCD"]
			}
			cb(flag,info)
		})
	}
	//初始化玩家信息
	local.userInit = function(crossUid) {
		var team = self.userTeam(crossUid)
		if(!team){
			return
		}
		var curLv = self.players[crossUid]["playerInfo"]["level"]
		var level = 0
		for(var i in escort_level){
			if(curLv <= escort_level[i]["lev_limit"]){
				level = Number(i)
				break
			}
		}
		var info = {
			"escortNum" : 0,
			"robCD" : 0,
			"level" : level,
			"quality" : "car0",
			"carInfo" : false,
			"messageList" : []
		}
		local.userInfos[crossUid] = info
		local.updateEscortCar(crossUid)
		return local.userInfos[crossUid]
	}
	//获取我的木牛信息
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
	//获取押镖列表
	this.getEscortList = function(crossUid,cb) {
		if(!local.userInfos[crossUid]){
			cb(false,"未参与玩法")
			return
		}
		if(local.timeMap[crossUid] && local.timeMap[crossUid] > Date.now()){
			cb(false,"刷新过快")
			return
		}
		local.timeMap[crossUid] = Date.now() + 10000
		var level = local.userInfos[crossUid]["level"]
		var carList = util.getRandomArray(local.carMap[level],10)
		for(var i = 0;i < carList.length;i++){
			if(carList[i]["crossUid"] == crossUid){
				carList.splice(i,1)
				break
			}
		}
		cb(true,carList)
	}
	// //获取并订阅木牛消息
	// this.subscribeCarMessage = function(crossUid,cb) {
	// 	if(!local.userInfos[crossUid]){
	// 		cb(false,"未参与玩法")
	// 		return
	// 	}
	// 	if(local.subscribeMaps[crossUid]){
	// 		cb(false,"消息已订阅")
	// 		return
	// 	}
	// 	var level = local.userInfos[crossUid]["level"]
	// 	var info = {uid : self.players[crossUid]["uid"],sid : self.players[crossUid]["cid"]}
	// 	local.subscribeUsers[level].push(info)
	// 	local.subscribeMaps[crossUid] = info
	// 	var carList = local.carMap[level].slice(-30)
	// 	cb(true,carList)
	// }
	// //取消订阅
	// this.unSubscribeCarMessage = function(crossUid,cb) {
	// 	if(!local.userInfos[crossUid]){
	// 		if(cb)
	// 			cb(false,"未参与玩法")
	// 		return
	// 	}
	// 	var info = local.subscribeMaps[crossUid]
	// 	if(!info){
	// 		if(cb)
	// 			cb(false,"未订阅")
	// 		return
	// 	}
	// 	var level = local.userInfos[crossUid]["level"]
	// 	local.subscribeUsers[level].remove(info)
	// 	delete local.subscribeMaps[crossUid]
	// 	if(cb)
	// 		cb(true)
	// }
	//木牛刷新
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
			cb(false,"正在运输中")
			return
		}
		var quality = local.userInfos[crossUid]["quality"]
		if(!carWeight[quality]){
			cb(false,"队伍已不能刷新")
			return
		}
		if((this.curHours < escort_cfg["closeTime1"]["value"] && this.curHours >= (escort_cfg["closeTime1"]["value"] - 0.083))){
			cb(false,"最后五分钟不能刷新")
			return
		}
		this.consumeItems(crossUid,escort_cfg["refresh"]["value"],1,"刷新木牛",function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				cb(true,local.updateEscortCar(crossUid))
			}
		})
	}
	//木牛刷新
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
	//添加机器人
	local.addRobot = function(level) {
		var robotId = Math.floor(Math.random() * 10000)
		if(local.userInfos[robotId])
			return
		var team = escort_cfg["robot_team"][Math.floor(Math.random() * escort_cfg["robot_team"].length)]
		var preLv = escort_level[level-1]?escort_level[level-1]["lev_limit"] : 0
		var maxLv = escort_level[level]["lev_limit"]
		var lv = Math.floor(Math.random() * (maxLv - preLv)) + preLv
		var rand = Math.random()
		var quality = 0
		if(rand < 0.2){
			quality = 0
		}else if(rand < 0.7){
			quality = 1
		}else if(rand < 0.9){
			quality = 2
		}else{
			quality = 3
		}
		var carInfo = {
			"crossUid" : robotId,
			"user" : self.getSimpleUser(robotId),
			"time" : Date.now(),
			"quality" : "car"+quality,
			"team" : self.standardTeam(team,"main",lv),
			"robot" : true,
			"robCount" : 0
		}
		local.userInfos[robotId] = {}
		local.userInfos[robotId]["carInfo"] = carInfo
		local.carMap[level].push(carInfo)
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
			cb(false,"正在运输中")
			return
		}
		if((this.curHours < escort_cfg["closeTime1"]["value"] && this.curHours >= (escort_cfg["closeTime1"]["value"] - 0.083))){
			cb(false,"最后五分钟不能运输")
			return
		}
		if(local.userInfos[crossUid]["escortNum"] >= escort_cfg["playCount"]["value"]){
			cb(false,"运输次数已用完")
			return
		}
		var team = this.userTeam(crossUid)
		if(!team){
			cb(false,"跨服数据未同步")
			return
		}
		var level = local.userInfos[crossUid]["level"]
		if(!local.carMap[level]){
			cb(false,"该等级未开放运输")
			return
		}
		if(!local.userInfos[crossUid]){
			local.userInit(crossUid)	
		}
		self.taskUpdate(crossUid,"escort",1)
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
			cb(false,"队伍不存在")
			return
		}
		var carInfo = local.userInfos[target]["carInfo"]
		if(crossUid == target){
			cb(false,"不能抢劫自己")
			return
		}
		if(local.userInfos[crossUid]["robCD"] >= Date.now()){
			cb(false,"Tấn công khi hồi chiêu")
			return
		}
		if(carInfo["robCount"] >= escort_cfg["loseCount"]["value"]){
			cb(false,"该队伍已空空如也")
			return
		}
		var atkTeam = this.userTeam(crossUid)
		if(!atkTeam){
			cb(false,"跨服数据未同步")
			return
		}
		local.userInfos[crossUid]["robCD"] = Date.now() + 60000
		var defTeam = carInfo["team"]
		let seededNum = Date.now()
		var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
		local.robFinish(crossUid,target,winFlag,carInfo,atkTeam,defTeam,seededNum,cb)
	}
}