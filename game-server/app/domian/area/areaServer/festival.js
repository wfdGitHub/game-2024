//节假日活动  签到  摇钱树  BOSS  兑换
const main_name = "festival"
const oneDayTime = 86400000
const async = require("async")
module.exports = function() {
	var self = this
	var festivalInfo = {}
	var basicInfo = {
		"type" : "",  		//类型
		"beginTime" : 0,	//开始时间  当天零点时间戳
		"duration" : 0, 	//持续时间
		"signAward" : [], 	//签到奖励列表
		"bossTeam" : [],	//boss阵容
		"bossAward" : [],	//boss奖励
		"bossCount" : 0,  	//boss次数
		"shopList" : [],	//兑换列表
		"dropItem" : "", 	//掉落道具 itemId	  快速作战   日常任务   逐鹿之战  竞技场  跨服竞技场 日冲副本
		"open" : {"signin" : true,"boss" : true,"shop" : true}
	}
	this.festivalDrop = function() {
		if(Date.now() > festivalInfo["beginTime"] && Date.now() < festivalInfo["endTime"]){
			return festivalInfo["dropItem"]
		}else{
			return false
		}
	}
	//设置活动信息  
	this.setFestivalInfo = function(data) {
		//检查参数
		festivalInfo = data 
		festivalInfo["key"] = festivalInfo["type"] + "_" + festivalInfo["beginTime"]
		festivalInfo["endTime"] = festivalInfo["beginTime"] + (festivalInfo["duration"] * oneDayTime) - 1000
		festivalInfo["hideTime"] = festivalInfo["endTime"] + (2 * oneDayTime)
	}
	//更新活动信息
	this.updateFestivalInfo = function(data,cb) {
		//检查参数
		self.redisDao.db.get("game:festival",function(err,data) {
			if(!data)
				data = basicInfo
			else
				data = JSON.parse(data)
			self.setFestivalInfo(data)
		})
	}
	//玩家获取活动信息
	this.getFestivalData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			if(data["key"] != festivalInfo["key"]){
				self.delObjAll(uid,main_name,function() {
					self.setObj(uid,main_name,"key",festivalInfo["key"])
				})
				data = {"key" : festivalInfo["key"]}
			}else{
				for(var i in data){
					if(i != "key")
						data[i] = Number(data[i])
				}
			}
			var info = {
				"festivalInfo" : festivalInfo,
				"data" : data
			}
			cb(true,info)
		})
	}
	//玩家活动数据更新
	this.festivalUserDayUpdate = function(uid) {
		self.delObj(uid,main_name,"bossCount")
	}
	//签到
	this.festivalSignIn = function(uid,index,cb) {
		if(Date.now() > festivalInfo["endTime"]){
			cb(false,"活动已结束")
			return
		}
		if(index >= festivalInfo["duration"]){
			cb(false,"index error "+index)
			return
		}
		if(!festivalInfo["signAward"][index]){
			cb(false,"award error "+festivalInfo["signAward"][index])
			return
		}
		if(Date.now() < festivalInfo["beginTime"] + (index * oneDayTime)){
			cb(false,"未到领取时间")
			return
		}
		self.getObj(uid,main_name,"dayAward_"+index,function(data) {
			if(data){
				cb(false,"已领取")
			}else{
				var awardList = self.addItemStr(uid,festivalInfo["signAward"][index],1,"节日签到"+festivalInfo.type)
				self.setObj(uid,main_name,"dayAward_"+index,1)
				cb(true,awardList)
			}
		})
	}
	//挑战BOSS
	this.challengeFestivalBoss = function(uid,cb) {
		if(Date.now() > festivalInfo["endTime"]){
			cb(false,"活动已结束")
			return
		}
		self.getObj(uid,main_name,"bossCount",function(data) {
			data = Number(data) || 0
			if(data >= festivalInfo["bossCount"]){
				cb(false,"挑战已达上限")
			}else{
				self.incrbyObj(uid,main_name,"bossCount",1)
				var atkTeam = self.getUserTeam(uid)
			    var seededNum = Date.now()
			    var defTeam = festivalInfo["bossTeam"]
				defTeam[4].boss = true
				var fightOtps = {seededNum : seededNum,maxRound:5}
			    self.fightContorl.beginFight(atkTeam,defTeam,fightOtps)
			    var info = {
			    	atkTeam : atkTeam,
			    	defTeam : defTeam,
			    	fightOtps : fightOtps
			    }
		    	var list = self.fightContorl.getFightRecord()
		    	var overInfo = list[list.length - 1]
		    	var allDamage = overInfo.atkDamage
		    	info.allDamage = allDamage
		    	var coin = Math.ceil(allDamage*0.1)
		    	if(coin > 1000000)
		    		coin = 1000000
		    	var award = "201:"+coin
		    	if(festivalInfo["bossAward"])
		    		award += "&"+festivalInfo["bossAward"]
		    	info.awardList =  self.addItemStr(uid,award,1,"节日boss")
		    	info.bossCount = data+1
		    	cb(true,info)
			}
		})
	}
	//兑换物品
	this.festivalShop = function(uid,index,cb) {
		if(Date.now() > festivalInfo["hideTime"]){
			cb(false,"活动已结束")
			return
		}
		if(!festivalInfo["shopList"][index]){
			cb(false,"商品不存在"+index)
			return
		}
		async.waterfall([
			function(next) {
				self.getObj(uid,main_name,"shop_"+index,function(value) {
					value = Number(value) || 0
					if(festivalInfo["shopList"][index]["max"] >= value + 1){
						next()
					}else{
						next("购买次数到达上限")
					}
				})
			},
			function(next) {
				self.consumeItems(uid,festivalInfo["shopList"][index].pc,1,"节日商城"+index,function(flag,err) {
					if(!flag){
						cb(flag,err)
						return
					}
					self.incrbyObj(uid,main_name,"shop_"+index,1)
					var awardList = self.addItemStr(uid,festivalInfo["shopList"][index].pa,1,"节日商城"+index)
					cb(true,awardList)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
}