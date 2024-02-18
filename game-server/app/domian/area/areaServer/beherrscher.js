//无双争霸赛
const main_name= "beherrscher"
const async = require("async")
const beherrscher_cfg = require("../../../../config/gameCfg/beherrscher.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const maxRecordNum = 10
const seatCount = 6
var npc_team = {}
for(var i = 1;i <= seatCount;i++){
	beherrscher_cfg["team_"+i] = JSON.parse(beherrscher_cfg["team_"+i]["value"])
}
const hours = 20
module.exports = function() {
	var self = this
	//state 0 未开赛  1 开赛中
	var local = {}
	var ready = false
	var timer = false
	var challengeMap = {}
	var beherrscherInfo = {
		"state" : 0,
		"endTime" : 0
	}
	for(var i = 1;i <= seatCount; i++)
		beherrscherInfo["seat_"+i] = 0
	//每日更新
	this.dayUpdateBeherrscher = function() {
		if(ready){
			challengeMap = {}
			//判断开启
			if(beherrscherInfo.state == 0 && (new Date()).getHours() < hours && ((self.areaDay > 2 && self.weekDay == 1) || (self.areaDay == 2))){
				local.changeData("state",1)
				local.changeData("endTime",(new Date()).setHours(hours,0,0,0))
				self.beginBeherrscher()
			}
			if(beherrscherInfo.state == 1){
				clearTimeout(timer)
				timer = setTimeout(self.endBeherrscher,beherrscherInfo.endTime - Date.now())
			}
		}
	}
	//初始化
	this.initBeherrscher = function() {
		self.getAreaObjAll(main_name,function(data) {
			if(data){
				for(var i in data){
					beherrscherInfo[i] = Number(data[i])
				}
			}
			ready = true
			self.dayUpdateBeherrscher()
		})
	}
	//获取数据
	this.getBeherrscherInfo = function(uid,cb) {
		var uids = []
		for(var i = 1;i <= seatCount;i++)
			uids.push(beherrscherInfo["seat_"+i])
		self.getPlayerInfoByUids(uids,function(userInfos) {
			var info = {
				beherrscherInfo : beherrscherInfo,
				userInfos : userInfos
			}
			cb(true,info)
		})
	}
	//活动开启
	this.beginBeherrscher = function() {
		console.log("beginBeherrscher")
		local.changeData("state",1)
		clearTimeout(timer)
		timer = setTimeout(self.endBeherrscher,beherrscherInfo.endTime - Date.now())
	}
	//活动结束
	this.endBeherrscher = function() {
		console.log("endBeherrscher")
		//发放奖励
		local.changeData("state",0)
		for(var i = 1;i <= seatCount;i++){
			if(beherrscherInfo["seat_"+i] != 0){
				self.sendTextToMail(beherrscherInfo["seat_"+i],"beherrs_"+i,beherrscher_cfg["award_"+i]["value"])
			}
		}
	}
	//挑战
	this.challengeBeherrscher = function(uid,index,cb) {
		if(beherrscherInfo["seat_"+index] === undefined || beherrscherInfo["seat_"+index] == uid){
			cb(false,"index error "+index)
			return
		}
		if(beherrscherInfo["state"] != 1){
			cb(false,"活动未开启")
			return
		}
		var seatIndex = 0
		for(var i = 1;i <= seatCount;i++){
			if(beherrscherInfo["seat_"+i] == uid){
				seatIndex = i
				break
			}
		}
		if(index == 6){
			if(!seatIndex){
				cb(false,"当前没有大师席位")
				return
			}
		}else{
			if(seatIndex){
				cb(false,"当前已有大师席位")
				return
			}
		}
		if(challengeMap[uid] && challengeMap[uid] > Date.now()){
			cb(false,"挑战冷却中,"+Math.ceil((challengeMap[uid] - Date.now()) / 1000)+"秒后可挑战")
			return
		}
		var info = {}
		var atkTeam = this.getUserTeam(uid)
		var defTeam
		var fightOtps = Object.assign({seededNum : Date.now()})
		async.waterfall([
			function(next) {
				//获取防守方阵容
				if(beherrscherInfo["seat_"+index] == 0){
					//挑战守军
				    defTeam = self.fightContorl.getNPCTeamByType("beherrscher",beherrscher_cfg["team_"+index],self.getLordLv(uid))
				    next()
				}else{
					//挑战玩家
					self.getDefendTeam(beherrscherInfo["seat_"+index],function(team) {
						defTeam = team
						next()
					})
				}
			},
			function(next) {
				//战斗
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
				info.atkTeam = atkTeam
				info.defTeam = defTeam
				info.fightOtps = fightOtps
				info.winFlag = winFlag
				next()
			},
			function(next) {
				challengeMap[uid] = Date.now() + 300000
				//获胜处理
				if(info.winFlag){
					if(seatIndex)
						local.changeData("seat_"+seatIndex,0)
					if(beherrscherInfo["seat_"+index] != 0){
						var arr = []
						arr.push(uid)
						arr.push(beherrscherInfo["seat_"+index])
						self.sendTextToMail(beherrscherInfo["seat_"+index],"beherrs_lost")
						//记录战报
						self.getPlayerInfoByUids(arr,function(userInfos) {
							info.atkInfo = userInfos[0]
							info.defInfo = userInfos[1]
							local.addRecord(index,info)
							self.addNotice("beherrscher",info.atkInfo.name,info.defInfo.name,beherrscher_cfg["award_"+index]["name"])
						})
					}
					local.changeData("seat_"+index,uid)
					cb(true,info)
				}else{
					info.cd = challengeMap[uid]
					cb(true,info)
				}
			},
			function(next) {
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//放弃席位
	this.beherrscherGiveup = function(uid,index,cb) {
		if(beherrscherInfo["state"] != 1){
			cb(false,"活动未开启")
			return
		}
		if(beherrscherInfo["seat_"+index] !== uid){
			cb(false,"未获得该席位")
			return
		}
		local.changeData("seat_"+index,0)
		cb(true)
	}
	//获取挑战记录
	this.getBeherrscherRecord = function(index,cb) {
		self.redisDao.db.lrange("area:area"+self.areaId+":"+main_name+":"+index,0,-1,function(err,list) {
			if(err || !list){
				cb(true,[])
			}else{
				cb(true,list)
			}
		})
	}
	//清除CD
	this.clearBeherrscherCD = function(uid,cb) {
		if(!challengeMap[uid] || challengeMap[uid] < Date.now()){
			cb(false,"当前可挑战")
			return
		}
		self.consumeItems(uid,default_cfg["default_pc_1"]["value"],1,"无双争霸CD",function(flag,err) {
			if(flag){
				delete challengeMap[uid]
				cb(true)
			}
			else{
				cb(flag,err)
			}
		})
	}
	local.changeData = function(key,value) {
		beherrscherInfo[key] = value
		self.setAreaObj(main_name,key,value)
	}
	local.addRecord = function(index,info) {
		self.redisDao.db.rpush("area:area"+self.areaId+":"+main_name+":"+index,JSON.stringify(info),function(err,num) {
			if(num > maxRecordNum){
				self.redisDao.db.ltrim("area:area"+self.areaId+":"+main_name+":"+index,-maxRecordNum,-1)
			}
		})
	}
}