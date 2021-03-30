//无双争霸赛
const main_name= "beherrscher"
const async = require("async")
const beherrscher_cfg = require("../../../../config/gameCfg/beherrscher.json")
const maxRecordNum = 10
var npc_team = {}
for(var i = 1;i <= 3;i++){
	beherrscher_cfg["team_"+i] = JSON.parse(beherrscher_cfg["team_"+i]["value"])
}
var scene_otps = {
	"1" : {"phyRate" : 1.2,"magRate" : 1.2},
	"2" : {"phyRate" : 1.2},
	"3" : {"magRate" : 1.2}
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
		"endTime" : 0,
		"seat_1" : 0,
		"seat_2" : 0,
		"seat_3" : 0
	}
	//每日更新
	this.dayUpdateBeherrscher = function() {
		console.log("dayUpdateBeherrscher")
		if(ready){
			challengeMap = {}
			//判断开启
			if(beherrscherInfo.state == 0 && (new Date()).getHours() < hours && ((self.areaDay > 2 && self.weekDay == 1) || (self.areaDay == 2))){
				self.beginBeherrscher()
				local.changeData("state",1)
				local.changeData("endTime",(new Date()).setHours(hours,0,0,0))
			}
			if(beherrscherInfo.state == 1){
				clearTimeout(timer)
				timer = setTimeout(self.endBeherrscher,beherrscherInfo.endTime - Date.now())
			}
		}
	}
	//初始化
	this.initBeherrscher = function() {
		console.log("initBeherrscher")
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
		var uids = [beherrscherInfo["seat_1"],beherrscherInfo["seat_2"],beherrscherInfo["seat_3"]]
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
		local.changeData("seat_1",0)
		local.changeData("seat_2",0)
		local.changeData("seat_3",0)
		self.redisDao.db.del("area:area"+self.areaId+":"+main_name+":1")
		self.redisDao.db.del("area:area"+self.areaId+":"+main_name+":2")
		self.redisDao.db.del("area:area"+self.areaId+":"+main_name+":3")
	}
	//活动结束
	this.endBeherrscher = function() {
		console.log("endBeherrscher")
		//发放奖励
		local.changeData("state",0)
		for(var i = 1;i <= 3;i++){
			if(beherrscherInfo["seat_"+i] != 0){
				self.sendMail(beherrscherInfo["seat_"+i],beherrscher_cfg["mail_"+i]["name"],beherrscher_cfg["mail_"+i]["value"],beherrscher_cfg["award_"+i]["value"])
			}
		}
	}
	//挑战
	this.challengeBeherrscher = function(uid,index,cb) {
		if(beherrscherInfo["seat_"+index] === undefined){
			cb(false,"index error "+index)
			return
		}
		if(beherrscherInfo["state" != 1]){
			cb(false,"活动未开启")
			return
		}
		if(beherrscherInfo["seat_1"] == uid || beherrscherInfo["seat_2"] == uid || beherrscherInfo["seat_3"] == uid){
			cb(false,"当前已有席位")
			return
		}
		if(challengeMap[uid] && challengeMap[uid] > Date.now()){
			cb(false,"挑战冷却中,"+Math.ceil((challengeMap[uid] - Date.now()) / 1000)+"秒后可挑战")
			return
		}
		var info = {}
		var atkTeam = this.getUserTeam(uid)
		var defTeam
		var fightOtps = Object.assign({seededNum : Date.now()},scene_otps[index])
		async.waterfall([
			function(next) {
				//获取防守方阵容
				if(beherrscherInfo["seat_"+index] == 0){
					//挑战守军
				    defTeam = beherrscher_cfg["team_"+index]
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
				challengeMap[uid] = Date.now() + 3000
				//获胜处理
				if(info.winFlag){
					if(beherrscherInfo["seat_"+index] != 0){
						var arr = []
						arr.push(uid)
						arr.push(beherrscherInfo["seat_"+index])
						self.sendMail(beherrscherInfo["seat_"+index],beherrscher_cfg["faild_mail"]["name"],beherrscher_cfg["faild_mail"]["value"])
						//记录战报
						self.getPlayerInfoByUids(arr,function(userInfos) {
							info.atkInfo = userInfos[0]
							info.defInfo = userInfos[1]
							local.addRecord(index,info)
						})
					}
					local.changeData("seat_"+index,uid)
					cb(true,info)
				}else{
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