//英雄DB
const uuid = require("uuid")
const herosCfg = require("../../config/gameCfg/heros.json")
const lv_cfg = require("../../config/gameCfg/lv_cfg.json")
const star_base = require("../../config/gameCfg/star_base.json")
const hero_ad = require("../../config/gameCfg/hero_ad.json")
const hero_tr = require("../../config/gameCfg/hero_tr.json")
const recruit_base = require("../../config/gameCfg/recruit_base.json")
const recruit_list = require("../../config/gameCfg/recruit_list.json")
const equip_st = require("../../config/gameCfg/equip_st.json")
const artifact_level = require("../../config/gameCfg/artifact_level.json")
const artifact_talent = require("../../config/gameCfg/artifact_talent.json")
const stone_base = require("../../config/gameCfg/stone_base.json")
const stone_skill = require("../../config/gameCfg/stone_skill.json")
const stone_cfg = require("../../config/gameCfg/stone_cfg.json")
const default_cfg = require("../../config/gameCfg/default_cfg.json")
const hufu_skill = require("../../config/gameCfg/hufu_skill.json")
const beauty_base = require("../../config/gameCfg/beauty_base.json")
const train_arg = require("../../config/gameCfg/train_arg.json")
const battle_team = require("../../config/gameCfg/battle_team.json")
const util = require("../../util/util.js")
const async = require("async")
const first_recruit = default_cfg["first_hero"]["value"]
const baseStone = {
	"1" : 4110,
	"2" : 4210,
	"3" : 4310,
	"4" : 4410
}
for(let i in recruit_base){
	recruit_base[i]["weights"] = JSON.parse(recruit_base[i]["weights"])
	recruit_base[i].allWeight = 0
	for(let j in recruit_base[i]["weights"]){
	  recruit_base[i]["weights"][j] += recruit_base[i].allWeight
	  recruit_base[i].allWeight = Number(recruit_base[i]["weights"][j])
	}
}
for(let i in recruit_list){
	recruit_list[i].heroList = JSON.parse(recruit_list[i].heroList)
}
var hufu_map = {}
for(var i in hufu_skill){
  for(var j = 1;j<= 5;j++){
    hufu_map[hufu_skill[i]["lv"+j]] = {"id":i,"lv":j}
  }
}
var bearcat = require("bearcat")
var heroDao = function() {
}
//增加英雄背包栏
heroDao.prototype.addHeroAmount = function(uid,cb) {
	this.redisDao.db.hincrby("player:user:"+uid+":playerInfo","heroAmount",20,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//获取英雄背包栏数量
heroDao.prototype.getHeroAmount = function(uid,cb) {
	var multiList = []
	multiList.push(["hget","player:user:"+uid+":playerInfo","heroAmount"])
	multiList.push(["hlen","player:user:"+uid+":heroMap"])
	this.redisDao.multi(multiList,function(err,list) {
		if(err){
			console.error("getHeroAmount",err)
		}
		cb(true,{max : Number(list[0]) || 0,cur : Number(list[1]) || 0})
	})
}
//英雄锁定检测
heroDao.prototype.heroLockCheck = function(heroInfo) {
	if(!heroInfo)
		return "英雄不存在"
	if(heroInfo.custom)
		return "定制英雄"
	if(heroInfo.combat)
		return "英雄已出战"
	if((heroInfo.zf_1 && heroInfo.zf_1 != 1) || (heroInfo.zf_2 && heroInfo.zf_2 != 1) || (heroInfo.zf_3 && heroInfo.zf_3 != 1))
		return "英雄已穿戴战法"
	if(heroInfo.lock)
		return "英雄已锁定"
	console.log(heroInfo,herosCfg[heroInfo.id])
	if(herosCfg[heroInfo.id] && herosCfg[heroInfo.id]["type"] != 0)
		return "神兽珍兽不可分解"
	return false
}
//批量删除英雄
heroDao.prototype.removeHeroList = function(areaId,uid,hIds,cb,reason) {
	var self = this
	var multiList = []
	for(var i = 0;i < hIds.length;i++){
		multiList.push(["hdel","player:user:"+uid+":heroMap",hIds[i]])
		multiList.push(["del","player:user:"+uid+":heros:"+hIds[i]])
	}
	self.redisDao.multi(multiList,function(err) {
		if(err){
			cb(false,err)
			return
		}
		cb(true)
	})
}
//删除英雄
heroDao.prototype.removeHero = function(areaId,uid,hId,cb) {
	console.error("接口已弃用")
	return
	// var self = this
	// self.getHeroOne(uid,hId,function(flag,heroInfo) {
	// 	if(!flag){
	// 		cb(false,"英雄不存在")
	// 		return
	// 	}
	// 	if(heroInfo.combat){
	// 		cb(false,"英雄已出战")
	// 		return
	// 	}
	// 	self.redisDao.db.hdel("player:user:"+uid+":heroMap",hId,function(err,data) {
	// 		if(err || !data){
	// 			console.error("removeHero ",err,data)
	// 			if(cb)
	// 				cb(false)
	// 			return
	// 		}
	// 		self.redisDao.db.del("player:user:"+uid+":heros:"+hId)
	// 		cb(true,heroInfo)
	// 	})
	// })
}
//修改英雄属性
heroDao.prototype.incrbyHeroInfo = function(areaId,uid,hId,name,value,cb) {
	var self = this
	this.redisDao.db.hincrby("player:user:"+uid+":heros:"+hId,name,value,function(err,data) {
		if(err)
			console.error(err)
		else{
			if(self.areaManager.areaMap[areaId]){
				switch(name){
					case "star":
						self.areaManager.areaMap[areaId].taskUpdate(uid,"hero",1,data)
						self.getHeroInfo(uid,hId,"id",function(id) {
							id = Number(id) || 0
							self.updateHeroArchive(areaId,uid,id,data)
							self.cacheDao.saveCache({messagetype:"itemChange",areaId:areaId,uid:uid,itemId:777000000+id,value:1,curValue:data,reason:"升星-"+hId})
						})
					break
					case "lv":
						self.areaManager.areaMap[areaId].taskUpdate(uid,"heroLv",1,data)
						if(self.areaManager.areaMap[areaId].players[uid] && self.areaManager.areaMap[areaId].players[uid]["heroLv"] < data)
							self.areaManager.areaMap[areaId].chageLordData(uid,"heroLv",data)
					break
					case "ad":
						self.areaManager.areaMap[areaId].taskUpdate(uid,"heroAd",1,data)
					break
				}
				self.areaManager.areaMap[areaId].incrbyCEInfo(uid,hId,name,value)
				self.updateHeroCe(areaId,uid,hId)
			}
		}
		if(cb)
			cb(true,data)
	})
}
//设置英雄属性
heroDao.prototype.setHeroInfo = function(areaId,uid,hId,name,value,cb) {
	var self = this
	this.redisDao.db.hset("player:user:"+uid+":heros:"+hId,name,value,function(err,data) {
		if(err){
			console.error(err)
			if(cb)
				cb(false,err)
		}
		else{
			self.areaManager.areaMap[areaId].setCEInfo(uid,hId,name,value)
			self.updateHeroCe(areaId,uid,hId)
			if(cb)
				cb(true,data)
		}
	})
}
//仅设置属性
heroDao.prototype.onlySetHeroInfo = function(uid,hId,name,value) {
	this.redisDao.db.hset("player:user:"+uid+":heros:"+hId,name,value)
}
//仅删除属性
heroDao.prototype.onlyDelHeroInfo = function(uid,hId,name) {
	this.redisDao.db.hdel("player:user:"+uid+":heros:"+hId,name)
}
//批量设置英雄属性
heroDao.prototype.setHMHeroInfo = function(areaId,uid,hId,obj,cb) {
	var self = this
	this.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,obj,function(err,data) {
		if(err){
			console.error(err)
			if(cb)
				cb(false,err)
		}else{
			for(var i in obj)
				self.areaManager.areaMap[areaId].setCEInfo(uid,hId,i,obj[i])
			self.updateHeroCe(areaId,uid,hId)
			if(cb)
				cb(true,data)
		}
	})
}
//获取英雄属性
heroDao.prototype.getHeroInfo = function(uid,hId,name,cb) {
	this.redisDao.db.hget("player:user:"+uid+":heros:"+hId,name,function(err,data) {
		cb(data)
	})
}
//删除英雄属性
heroDao.prototype.delHeroInfo = function(areaId,uid,hId,name,cb) {
	var self = this
	this.redisDao.db.hdel("player:user:"+uid+":heros:"+hId,name,function(err,data) {
		if(err)
			console.error(err)
		else{
			self.areaManager.areaMap[areaId].delCEInfo(uid,hId,name)
			self.updateHeroCe(areaId,uid,hId)
		}
		if(cb)
			cb(true,data)
	})
}
//获取英雄列表
heroDao.prototype.getHeros = function(uid,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+uid+":heroMap",function(err,data) {
		if(err || !data){
			cb(true,{})
			return
		}
		var multiList = []
		var hIds = []
		for(var hId in data){
			hIds.push(hId)
			multiList.push(["hgetall","player:user:"+uid+":heros:"+hId])
		}
		self.redisDao.multi(multiList,function(err,list) {
			var hash = {}
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
				list[i].hId = hIds[i]
				hash[list[i].hId] = list[i]
			}
			cb(true,hash)
		})
	})
}
//更新英雄战力
heroDao.prototype.updateHeroCe = function(areaId,uid,hId) {
	var self = this
	self.getHeroOne(uid,hId,function(flag,data) {
		if(flag && data){
			var ce = self.areaManager.areaMap[areaId].fightContorl.getTeamCE([data,0,0,0,0,0])
			if(ce >= 200000){
				self.areaManager.areaMap[areaId].update_heroRank(uid,data.id,hId,ce)
			}else{
				self.areaManager.areaMap[areaId].remove_heroRank(uid,data.id,hId)
			}
		}
	})
}
//获取单个英雄
heroDao.prototype.getHeroOne = function(uid,hId,cb) {
	this.redisDao.db.hgetall("player:user:"+uid+":heros:"+hId,function(err,data) {
		if(err || !data){
			cb(false,err)
		}else{
			for(var j in data){
				var tmp = Number(data[j])
				if(tmp == data[j])
					data[j] = tmp
			}
			cb(true,data)
		}
	})
}
//获取指定英雄列表
heroDao.prototype.getHeroList = function(uid,hIds,cb) {
	if(!hIds || !hIds.length){
		cb(true,[])
		return
	}
	var multiList = []
	for(var i = 0;i < hIds.length;i++){
		multiList.push(["hgetall","player:user:"+uid+":heros:"+hIds[i]])
	}
	this.redisDao.multi(multiList,function(err,list) {
		if(err){
			cb(false,err)
			return
		}
		for(var i = 0;i < list.length;i++){
			if(list[i]){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
			}else{
				list[i] = 0
			}
		}
		cb(true,list)
	})
}
//获取不同玩家指定英雄列表
heroDao.prototype.getDiffHeroList = function(uids,hIds,cb) {
	if(!uids || !hIds || !hIds.length || hIds.length != uids.length){
		cb(true,[])
		return
	}
	var multiList = []
	for(var i = 0;i < hIds.length;i++){
		multiList.push(["hgetall","player:user:"+uids[i]+":heros:"+hIds[i]])
	}
	this.redisDao.multi(multiList,function(err,list) {
		if(err){
			cb(false,err)
			return
		}
		for(var i = 0;i < list.length;i++){
			for(var j in list[i]){
				var tmp = Number(list[i][j])
				if(tmp == list[i][j])
					list[i][j] = tmp
			}
		}
		cb(true,list)
	})
}
//批量获取指定英雄列表
heroDao.prototype.getMultiHeroList = function(uids,hIdsList,cb) {
	var self = this
	var multiList = []
	for(var i = 0;i < uids.length;i++){
		var hIds = JSON.parse(hIdsList[i])
		if(!hIds){
			console.log("hIds error ",hIds,uids,hIdsList)
			hIds = [0,0,0,0,0,0]
		}
		for(var j = 0;j < hIds.length;j++)
			multiList.push(["hgetall","player:user:"+uids[i]+":heros:"+hIds[j]])
	}
	var teams = []
	self.redisDao.multi(multiList,function(err,list) {
		if(err){
			cb(false,err)
			return
		}
		for(var i = 0;i < list.length;i++){
			for(var j in list[i]){
				var tmp = Number(list[i][j])
				if(tmp == list[i][j])
					list[i][j] = tmp
			}
		}
		for(var i = 0;i < uids.length;i++){
			teams.push(list.splice(0,6))
		}
		multiList = []
		for(var i = 0;i < uids.length;i++){
			multiList.push(["hmget","player:user:"+uids[i]+":guild",["skill_1","skill_2","skill_3","skill_4"]])
		}
		self.redisDao.multi(multiList,function(err,list) {
			if(err){
				cb(false,err)
				return
			}
			for(var i = 0;i < uids.length;i++){
				var info = {
					"g1" : Number(list[i][0]) || 0,
					"g2" : Number(list[i][1]) || 0,
					"g3" : Number(list[i][2]) || 0,
					"g4" : Number(list[i][3]) || 0
				}
				teams[i][6] = info
			}
		})
		cb(true,teams)
	})
}
//获取出场阵容
heroDao.prototype.getFightTeam = function(uid,cb) {
	var self = this
	var fightData = []
	async.waterfall([
		function(next) {
			self.getFightTeamCfgWithPower(uid,function(teamCfg) {
				fightData.push(teamCfg)
				next()
			})
		},
		function(next) {
			self.getTeamByType(uid,"normal",function(flag,teams) {
				if(!flag){
					next(teams)
					return
				}
				fightData = fightData.concat(teams)
				cb(true,fightData)
			})
		}
	],function(err) {
		cb(false,err)
	})
}
//获取主动技能
heroDao.prototype.getFightPower = function(uid,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+uid+":power",function(err,data) {
		if(!data || !data.fightMap){
			cb({},0)
		}else{
			var fightMap = JSON.parse(data.fightMap)
			var index = 0
			var powers = {}
			for(var i in fightMap){
				var id = fightMap[i]
				var lv = Number(data[id+"_lv"])
				var ad = Number(data[id+"_ad"])
				var star = Number(data[id+"_star"])
				if(lv && ad && star){
					var powerInfo = {id : id,lv:lv,ad:ad,star:star}
					index++
					powers["power"+index] = powerInfo
				}
			}
			cb(powers,data.manualModel)
		}
	})
}
//获取红颜技能
heroDao.prototype.getBeautys = function(uid,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+uid+":beaut",function(err,data) {
		if(!data){
			cb({},0)
		}else{
			var beautys = {}
			for(var id in beauty_base){
				if(data[id+"_star"]){
					var ad = Number(data[id+"_ad"])
					var star = Number(data[id+"_star"])
					var att1 = Number(data[id+"_att1"])
					var att2 = Number(data[id+"_att2"])
					var att3 = Number(data[id+"_att3"])
					var att4 = Number(data[id+"_att4"])
					var opinion = Number(data[id+"_opinion"])
					var beautyInfo = {id : id,ad:ad,star:star,att1:att1,att2:att2,att3:att3,att4:att4,opinion:opinion}
					beautys["beaut_"+id] = beautyInfo
				}
			}
			if(data["bcombat"])
				beautys["bcombat"] = data["bcombat"] 
			cb(beautys)
		}
	})
}
//设置逐鹿之战出场阵容
heroDao.prototype.setZhuluTeam = function(areaId,uid,hIds,cb) {
	var self = this
	self.getHeroList(uid,hIds,function(flag,heroList) {
		if(!flag || !heroList){
			cb(false,"阵容错误")
			return
		}
		for(var i = 0;i < heroList.length;i++){
			if(hIds[i] && !heroList[i]){
				cb(false,"武将不存在"+hIds[i])
				return
			}
		}
		self.redisDao.db.set("player:user:"+uid+":zhuluTeam",JSON.stringify(hIds),function(err,data) {
			if(err)
				cb(false,err)
			else
				cb(true)
		})
	})
}
//获取逐鹿出场阵容
heroDao.prototype.getZhuluTeam = function(uid,cb) {
	var self = this
	self.redisDao.db.get("player:user:"+uid+":zhuluTeam",function(err,data) {
		if(err || !data){
			cb(false,"未设置阵容")
			return
		}
		var zhuluTeam = JSON.parse(data)
		var multiList = []
		var hIds = []
		for(var i = 0;i < zhuluTeam.length;i++){
			if(zhuluTeam[i]){
				hIds.push(zhuluTeam[i])
				multiList.push(["hgetall","player:user:"+uid+":heros:"+zhuluTeam[i]])
			}
		}
		self.redisDao.multi(multiList,function(err,list) {
			var hash = {}
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
				if(list[i]){
					list[i].hId = hIds[i]
					hash[list[i].hId] = list[i]
				}
			}
			for(var i = 0;i < zhuluTeam.length;i++){
				zhuluTeam[i] = hash[zhuluTeam[i]]
			}
			cb(true,zhuluTeam)
		})
	})
}
//设置出场阵容
heroDao.prototype.setTeamByType = function(uid,type,hIds,cb) {
	var self = this
	async.waterfall([
		function(next) {
			if(!battle_team[type]){
				next("type error "+type)
				return
			}
			if(!hIds.length){
				next("至少上阵一个英雄")
				return
			}
			if(hIds.length > battle_team[type]["maxNum"]){
				next("超过最大上阵限制")
				return
			}
			//参数判断
		  for(var i = 0;i < hIds.length;i++){
		    if(!hIds[i])
		    	continue
		    for(var j = i + 1;j < hIds.length;j++){
		      if(hIds[i] == hIds[j]){
		        next(null,{flag : false,data : "不能有重复的hId"})
		        return
		      }
		    }
		  }
		  next()
		},
		function(next) {
			self.getHeroList(uid,hIds,function(flag,heroList) {
				if(!flag || !heroList){
					cb(false,"阵容错误")
					return
				}
				for(var i = 0;i < heroList.length;i++){
					if(hIds[i] && !heroList[i]){
						cb(false,"英雄不存在"+hIds[i])
						return
					}
				}
				self.redisDao.db.set("player:user:"+uid+":fightTeam:"+type,JSON.stringify(hIds),function(err,data) {
					if(err){
						if(cb)
							cb(false,err)
					}else{
						if(cb)
							cb(true,heroList)
					}
				})
			})
		}
	],function(err) {
		cb(false,err)
	})
}
//获取出场阵容
heroDao.prototype.getTeamByType = function(uid,type,cb) {
	var self = this
	var teams = []
	var fightTeam = []
	self.redisDao.db.get("player:user:"+uid+":fightTeam:"+type,function(err,data) {
		if(!data)
			fightTeam = []
		else
			fightTeam = JSON.parse(data)
		var multiList = []
		var hIds = []
		for(var i = 0;i < fightTeam.length;i++){
			if(fightTeam[i]){
				hIds.push(fightTeam[i])
				multiList.push(["hgetall","player:user:"+uid+":heros:"+fightTeam[i]])
			}
		}
		self.redisDao.multi(multiList,function(err,list) {
			var hash = {}
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
				list[i].hId = hIds[i]
				hash[list[i].hId] = list[i]
			}
			for(var i = 0;i < fightTeam.length;i++){
				if(hash[fightTeam[i]]){
					teams.push(hash[fightTeam[i]])
				}
			}
			cb(true,teams)
		})
	})
}
//获取出场团队数据（含主动技）
heroDao.prototype.getFightTeamCfgWithPower = function(uid,cb) {
	var self = this
	self.getFightTeamCfg(uid,function(teamCfg) {
		self.getFightPower(uid,function(powers,manualModel) {
			for(var i in powers)
				teamCfg[i] = powers[i]
			cb(teamCfg)
		})
	})
}
//获取出场团队数据
heroDao.prototype.getFightTeamCfg = function(uid,cb) {
	var self = this
	var teamCfg = {}
	async.waterfall([
		function(next) {
			//称号
			self.redisDao.db.hget("player:user:"+uid+":playerInfo","title",function(err,data) {
				if(data)
					teamCfg["title"] = Number(data) || 0
				next()
			})
		},
		function(next) {
			//官职
			self.redisDao.db.hget("player:user:"+uid+":playerInfo","officer",function(err,data) {
				if(data)
					teamCfg["officer"] = Number(data) || 0
				next()
			})
		},
		function(next) {
			//家园建筑
			self.redisDao.db.hmget("player:user:"+uid+":manor",["gjy","dby","qby"],function(err,data) {
				if(data){
					teamCfg["gjy"] = Number(data[0]) || 0
					teamCfg["dby"] = Number(data[1]) || 0
					teamCfg["qby"] = Number(data[2]) || 0
				}
				next()
			})
		},
		function(next) {
			//公会技能
			self.redisDao.db.hmget("player:user:"+uid+":guild",["skill_1","skill_2","skill_3","skill_4"],function(err,data) {
				if(data){
					teamCfg["g1"] = Number(data[0]) || 0
					teamCfg["g2"] = Number(data[1]) || 0
					teamCfg["g3"] = Number(data[2]) || 0
					teamCfg["g4"] = Number(data[3]) || 0
				}
				cb(teamCfg)
			})
		}
	],function(err) {
		cb(false,err)
	})
}
module.exports = {
	id : "heroDao",
	func : heroDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "areaManager",
		ref : "areaManager"
	},{
		name : "cacheDao",
		ref : "cacheDao"
	}]
}