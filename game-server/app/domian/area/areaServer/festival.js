//节假日活动
const festival_cfg = require("../../../../config/gameCfg/festival_cfg.json")
var festival_list = {}
for(var festivalId in festival_cfg){
	festival_list[festivalId] = require("../../../../config/gameCfg/"+festivalId+".json")
	festival_list[festivalId]["bossTeam"]["value"] = JSON.parse(festival_list[festivalId]["bossTeam"]["value"])
}
const main_name = "festival"
module.exports = function() {
	var self = this
	var treeMaps = {}
	this.festivalId = false
	//活动每日更新
	this.festivalDayUpdate = function() {
		this.festivalId = false
		treeMaps = {}
		var curTime = Date.now()
		for(var festivalId in festival_cfg){
			if(curTime >= festival_cfg[festivalId]["openTime"] && curTime < festival_cfg[festivalId]["endTime"]){
				this.festivalId = festivalId
				break
			}
		}
	}
	//玩家活动数据更新
	this.festivalUserDayUpdate = function(uid) {
		self.delObjAll(uid,main_name)
	}
	//获取活动数据
	this.getFestivalData = function(uid,cb) {
		if(!this.festivalId){
			cb(true,{festivalId : this.festivalId})
			return
		}else{
			self.getObjAll(uid,main_name,function(data) {
				if(!data)
					data = {}
				for(var i in data){
					data[i] = Number(data[i])
				}
				data.festivalId = self.festivalId
				cb(true,data)
			})
		}
	}
	//每日奖励
	this.gainFestivalDayAward = function(uid,cb) {
		if(!this.festivalId){
			cb(false,"节日活动未开启")
			return
		}
		if(treeMaps[uid]){

		}
		self.getObj(uid,main_name,"dayAward",function(data) {
			if(data){
				cb(false,"今日已领取")
			}else{
				var awardList = self.addItemStr(uid,festival_list[self.festivalId]["day_award"]["value"],1,"节日每日奖励"+self.festivalId)
				self.setObj(uid,main_name,"dayAward",1)
				cb(true,awardList)
			}
		})
	}
	//挑战boss
	this.challengeFestivalBoss = function(uid,cb) {
		if(!this.festivalId){
			cb(false,"节日活动未开启")
			return
		}
		self.getObj(uid,main_name,"bossCount",function(data) {
			data = Number(data) || 0
			if(data >= festival_list[self.festivalId]["boss_count"]["value"]){
				cb(false,"挑战已达上限")
			}else{
				self.incrbyObj(uid,main_name,"bossCount",1)
				var atkTeam = self.getUserTeam(uid)
			    var seededNum = Date.now()
			    var defTeam = festival_list[self.festivalId]["bossTeam"]["value"]
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
		    	var allDamage = 0
		    	for(var i = 0;i < overInfo.atkTeam.length;i++)
		    		if(overInfo.atkTeam[i])
		    			allDamage += overInfo.atkTeam[i].totalDamage
		    	info.allDamage = allDamage
		    	var coin = Math.ceil(allDamage*festival_list[self.festivalId]["coin"]["value"])
		    	if(coin > festival_list[self.festivalId]["coin_max"]["value"])
		    		coin = festival_list[self.festivalId]["coin_max"]["value"]
		    	var award = "201:"+coin
		    	if(festival_list[self.festivalId]["baseAward"]["value"])
		    		award += "&"+festival_list[self.festivalId]["baseAward"]["value"]
		    	info.awardList =  self.addItemStr(uid,award,1,"节日boss"+self.festivalId)
		    	info.awardList = info.awardList.concat(self.openChestAward(uid,festival_list[self.festivalId]["chest"]["value"]))
		    	info.bossCount = data+1
		    	cb(true,info)
			}
		})
	}
	//获取摇钱树奖励列表
	this.getFestivalTreeList = function(uid,cb) {
		if(!this.festivalId){
			cb(false,"节日活动未开启")
			return
		}
		if(treeMaps[uid]){
			cb(true,treeMaps[uid])
		}else{
			var list = []
			for(var i = 0;i < festival_list[self.festivalId]["tree_count"]["value"];i++){
				list.push(this.openChestStrNoItem(festival_list[self.festivalId]["tree_chest"]["value"]))
			}
			treeMaps[uid] = list
			cb(true,treeMaps[uid])
		}
	}
	//结算摇钱树奖励
	this.gainFestivalTreeAward = function(uid,count,cb) {
		if(!this.festivalId){
			cb(false,"节日活动未开启")
			return
		}
		if(!treeMaps[uid]){
			cb(false,"未获取奖励列表")
			return
		}
		if(count <= 0){
			self.setObj(uid,main_name,"tree",1)
			cb(true,[])
		}else{
			self.getObj(uid,main_name,"tree",function(data) {
				if(data){
					cb(false,"已领取奖励")
					return
				}
				if(count > festival_list[self.festivalId]["tree_count"]["value"]){
					count = festival_list[self.festivalId]["tree_count"]["value"]
				}
				var str = ""
				for(var i = 0;i < count;i++){
					if(str)
						str += "&"
					str += treeMaps[uid][i]
				}
				var awardList =  self.addItemStr(uid,str,1,"节日摇钱树"+self.festivalId)
				self.setObj(uid,main_name,"tree",1)
				cb(true,awardList)
			})
		}
	}
}