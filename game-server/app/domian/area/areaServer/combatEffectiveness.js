//战力
const async = require("async")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const power_base = require("../../../../config/gameCfg/power_base.json")
const power_lv = require("../../../../config/gameCfg/power_lv.json")
const power_ad = require("../../../../config/gameCfg/power_ad.json")
const power_star = require("../../../../config/gameCfg/power_star.json")
const power_aptitude = require("../../../../config/gameCfg/power_aptitude.json")
const power_slot = require("../../../../config/gameCfg/power_slot.json")
const lord_lv = require("../../../../config/gameCfg/lord_lv.json")
const battle_team = require("../../../../config/gameCfg/battle_team.json")
const battle_cfg = require("../../../../config/gameCfg/battle_cfg.json")
const main_name = "CE"
const oneDayTime = 86400000
//消耗倍率
var powerRates = {}
for(var i in power_base)
	powerRates[i] = power_aptitude[power_base[i]["aptitude"]]["upRate"]
module.exports = function() {
	var self = this
	var local = {}
	var userTeams = {}            //玩家阵容
	var usersCes = {} 			  //玩家战力
	var userTeamMaps = {}  		  //玩家上阵英雄
	//加载角色阵容数据
	this.CELoad = function(uid,cb) {
		//玩家阵容
		self.heroDao.getFightTeam(uid,function(flag,data) {
			if(flag && data){
				userTeams[uid] = data
				userTeamMaps[uid] = {}
				for(var i = 1;i < data.length;i++){
					if(data[i])
						userTeamMaps[uid][data[i].hId] = i
				}
				self.updateCE(uid)
			}
			if(cb)
				cb(flag)
		})
	}
	//移除角色阵容数据
	this.CEUnload = function(uid) {
		delete userTeams[uid]
		delete usersCes[uid]
		delete userTeamMaps[uid]
	}
	//获得英雄属性
	this.getHeroInfo = function(uid,hId) {
		if(userTeams[uid] && userTeamMaps[uid] && userTeamMaps[uid][hId]){
			return userTeamMaps[uid][hId]
		}
	}
	//修改英雄属性
	this.incrbyCEInfo = function(uid,hId,name,value) {
		if(userTeams[uid] && userTeamMaps[uid] && userTeamMaps[uid][hId] !== undefined){
			var index = userTeamMaps[uid][hId]
			var oldValue = userTeams[uid][index][name]
			if(!userTeams[uid][index][name])
				userTeams[uid][index][name] = 0
			userTeams[uid][index][name] += value
			this.incrbyCE(uid,name,oldValue,userTeams[uid][index][name])
		}
	}
	//设置英雄属性
	this.setCEInfo = function(uid,hId,name,value) {
		if(userTeams[uid] && userTeamMaps[uid] && userTeamMaps[uid][hId] !== undefined){
			var index = userTeamMaps[uid][hId]
			var oldValue = userTeams[uid][index][name]
			userTeams[uid][index][name] = value
			this.incrbyCE(uid,name,oldValue,userTeams[uid][index][name])
		}
	}
	//删除英雄属性
	this.delCEInfo = function(uid,hId,name) {
		if(userTeams[uid] && userTeamMaps[uid] && userTeamMaps[uid][hId] !== undefined){
			var index = userTeamMaps[uid][hId]
			var oldValue = userTeams[uid][index][name]
			delete userTeams[uid][index][name]
			this.incrbyCE(uid,name,oldValue,userTeams[uid][index][name])
		}
	}
	//改变战力
	this.incrbyCE = function(uid,name,oldValue,newValue) {
		var ce = self.fightContorl.calcCEDiff(name,oldValue,newValue)
		local.updateCENotify(uid,ce)
	}
	local.updateCENotify = function(uid,ce) {
		if(usersCes[uid] && ce){
			var oldCE = usersCes[uid]
			usersCes[uid] += ce
			self.taskUpdate(uid,"totalCe",usersCes[uid])
			self.addZset("ce_rank",uid,usersCes[uid])
			self.playerDao.setPlayerInfo({uid:uid,key:"CE",value:usersCes[uid]})
			var notify = {
				type : "updateCE",
				oldCE : oldCE,
				newCE : usersCes[uid]
			}
			self.sendToUser(uid,notify)
		}
	}
	//更新战力
	this.updateCE = function(uid) {
		if(userTeams[uid]){
			let oldCE = usersCes[uid]
			let newCE = self.fightContorl.getTeamCE(userTeams[uid])
			usersCes[uid] = newCE
			if(!oldCE || oldCE != newCE){
				let notify = {
					type : "updateCE",
					oldCE : oldCE,
					newCE : newCE
				}
				self.sendToUser(uid,notify)
				self.taskUpdate(uid,"totalCe",newCE)
				self.addZset("ce_rank",uid,newCE)
				self.playerDao.setPlayerInfo({uid:uid,key:"CE",value:newCE})
			}
		}
	}
	//获取战力
	this.getCE = function(uid) {
		return usersCes[uid] || 1
	}
	//获取上阵英雄数量
	this.getTeamNum = function(uid) {
		var count = 0
		if(userTeamMaps[uid])
			for(var i in userTeamMaps[uid])
				count++
		return count
	}
	//升级技能属性
	this.incrbyGuildCareerSkill = function(uid,career) {
		self.incrbyObj(uid,"guild","skill_"+career,1)
		if(userTeams[uid] && userTeams[uid][0] && userTeams[uid][0]["g"+career] !== undefined){
			userTeams[uid][0]["g"+career] ++
			this.updateCE(uid)
		}
	}
	//设置天书属性
	this.setBookInfo = function(uid,bookType,name,value) {
		self.setObj(uid,"book",bookType+"_"+name,value)
		if(userTeams[uid] && userTeams[uid][0] && userTeams[uid][0][bookType]){
			userTeams[uid][0][bookType][name] = value
			this.updateCE(uid)
		}
	}
	//更改称号
	this.setTitle = function(uid,title) {
		if(userTeams[uid] && userTeams[uid][0]){
			userTeams[uid][0]["title"] = title
			this.updateCE(uid)
		}
	}
	//更改官职
	this.setOfficer = function(uid,officer) {
		if(userTeams[uid] && userTeams[uid][0]){
			userTeams[uid][0]["officer"] = officer
			this.updateCE(uid)
		}
	}
	//更新建筑等级
	this.setBuildLv = function(uid,bId,lv) {
		if(userTeams[uid] && userTeams[uid][0]){
			userTeams[uid][0][bId] = lv
			this.updateCE(uid)
		}
	}
	//获取主动技能数据
	this.getPowerData = function(uid,cb) {
		this.getObjAll(uid,"power",function(data) {
			if(!data)
				data = {}
			for(var i in data){
				if(i == "fightMap")
					data[i] = JSON.parse(data[i])
				else
					data[i] = Number(data[i])
			}
			cb(true,data)
		})
	}
	//设置技能属性
	this.setPowerInfo = function(uid,powerId,name,value) {
		self.setObj(uid,"power",powerId+"_"+name,value)
		if(userTeams[uid] && userTeams[uid][0]){
			for(var i = 0;i <= 4;i++){
				if(userTeams[uid][0]["power"+i] && userTeams[uid][0]["power"+i]["id"] == powerId){
					userTeams[uid][0]["power"+i][name] = value
					this.updateCE(uid)
					break
				}
			}
		}
	}
	//主动技能升星
	this.upPowerStar = function(uid,powerId,cb) {
		if(!power_base[powerId]){
			cb(false,"powerId not find "+powerId)
			return
		}
		var rate = powerRates[powerId]
		var item = power_base[powerId]["item"]
		self.getObj(uid,"power",powerId+"_star",function(star) {
			star = Number(star) || 0
			star++
			if(!power_star[star]){
				cb(false,"不可升星")
				return
			}
			var str = item+":"+power_star[star]["itemValue"]
			if(power_star[star]["foodValue"])
				str += "&1000730:"+power_star[star]["foodValue"]
			self.consumeItems(uid,str,rate,"主动技能升星"+powerId,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					self.setPowerInfo(uid,powerId,"star",star)
					self.taskUpdate(uid,"power_star",1,powerId)
					if(star == 1){
						self.setObj(uid,"power",powerId+"_lv",1)
						self.setObj(uid,"power",powerId+"_ad",1)
					}
					cb(true,star)
				}
			})
		})
	}
	//主动技能升级
	this.upPowerLv = function(uid,powerId,cb) {
		if(!power_base[powerId]){
			cb(false,"powerId not find "+powerId)
			return
		}
		var rate = powerRates[powerId]
		self.getHMObj(uid,"power",[powerId+"_lv",powerId+"_ad"],function(list) {
			var lv = Number(list[0]) || 1
			var ad = Number(list[1]) || 1
			if(lv >= power_ad[ad]["lv_limit"]){
				cb(false,"已满级，需要升阶")
				return
			}
			var str = power_lv[lv]["pc"]
			self.consumeItems(uid,str,rate,"主动技能升级"+powerId,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					lv++
					self.setPowerInfo(uid,powerId,"lv",lv)
					cb(true,lv)
				}
			})
		})
	}
	//主动技能升阶
	this.upPowerAd = function(uid,powerId,cb) {
		if(!power_base[powerId]){
			cb(false,"powerId not find "+powerId)
			return
		}
		var rate = powerRates[powerId]
		self.getHMObj(uid,"power",[powerId+"_lv",powerId+"_ad"],function(list) {
			var lv = Number(list[0]) || 1
			var ad = Number(list[1]) || 1
			if(lv < power_ad[ad]["lv_limit"]){
				cb(false,"先升满级"+lv+"/"+power_ad[ad]["lv_limit"])
				return
			}
			var str = power_ad[ad]["pc"]
			self.consumeItems(uid,str,rate,"主动技能升阶"+powerId,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					ad++
					self.setPowerInfo(uid,powerId,"ad",ad)
					cb(true,ad)
				}
			})
		})
	}
	//设置上阵技能
	this.setPowerFight = function(uid,list,cb) {
		if(!Array.isArray(list)){
			cb(false,"参数错误")
			return
		}
		var map = {}
		for(var i = 0;i < list.length;i++){
			if(list[i]){
				if(map[list[i]]){
					cb(false,"技能重复")
					return
				}
				map[list[i]] = true
			}
		}
		var lv = self.getLordLv(uid)
		for(var i = 0;i < list.length;i++){
			if(list[i]){
				if(!power_base[list[i]]){
					cb(false,"power not find"+list[i])
					return
				}
				var index = i+1
				if(!power_slot[index]){
					cb(false,"插槽不存在"+index)
					return
				}
				if(lv < power_slot[index]["lv"]){
					cb(false,"插槽未开启"+index)
					return
				}
			}
		}
		self.setObj(uid,"power","fightMap",JSON.stringify(list),function() {
			self.CELoad(uid)
		})
		cb(true)
	}
	//主动技能重生
	this.resetPower = function(uid,powerId,cb) {
		if(!power_base[powerId]){
			cb(false,"powerId not find "+powerId)
			return
		}
		self.getHMObj(uid,"power",[powerId+"_lv",powerId+"_ad"],function(list) {
			var lv = Number(list[0]) || 1
			var ad = Number(list[1]) || 1
			if(lv == 1){
				cb(false,"当前不可重生")
				return
			}
			self.consumeItems(uid,default_cfg["default_pc_2"]["value"],1,"重生消耗"+powerId,function(flag,err) {
				if(flag){
					var str = power_lv[lv]["pr"]
					if(power_ad[ad]["pr"])
						str += "&"+power_ad[ad]["pr"]
					self.setPowerInfo(uid,powerId,"lv",1)
					self.setPowerInfo(uid,powerId,"ad",1)
					var rate = powerRates[powerId]
					var awardList = self.addItemStr(uid,str,rate,"重生技能"+powerId)
					cb(true,awardList)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//设置释放偏好
	this.setManualModel = function(uid,type,cb) {
		if(type !== 0 && type !== 1){
			cb(false,"type error "+type)
			return
		}
		userTeams[uid][0]["manualModel"] = type
		self.setObj(uid,"power","manualModel",type,function(){})
		cb(true)
	}
	//获取常规阵容
	this.getUserTeam = function(uid) {
		return JSON.parse(JSON.stringify(userTeams[uid]))
	}
	//根据类型设置阵容
	this.setTeamByType = function(uid,type,hIds,cb) {
		async.waterfall([
			function(next) {
				//常规阵容移除原出战
				if(type == "normal"){
					self.heroDao.getTeamByType(uid,type,function(flag,team) {
						if(flag && team){
							for(var i = 0;i < team.length;i++)
								if(team[i])
									self.heroDao.onlyDelHeroInfo(uid,team[i].hId,"combat")
						}
						next()
					})
				}else{
					next()
				}
			},
			function(next) {
				self.heroDao.setTeamByType(uid,type,hIds,function(flag,data) {
					next(null,flag,data)
				})
			},
			function(flag,data,next) {
				//常规阵容设置出战
				if(flag && type == "normal"){
					for(var i = 0;i < hIds.length;i++)
						self.heroDao.onlySetHeroInfo(uid,hIds[i],"combat",1)
					self.CELoad(uid)
				}
				cb(true)
			}
		],function(err){
			cb(false,err)
		})
	}
	//根据阵容类型获取阵容
	this.getTeamByType = function(uid,type,cb) {
		async.waterfall([
			function(next) {
				if(!battle_team[type]){
					next("type error "+type)
					return
				}
				if(battle_team[type]["power"]){
					self.heroDao.getFightTeamCfgWithPower(uid,function(teamCfg) {
						next(null,teamCfg)
					})
				}else{
					self.heroDao.getFightTeamCfg(uid,function(teamCfg) {
						next(null,teamCfg)
					})
				}
			},
			function(teamCfg,next) {
				teamCfg["comeonNum"] = battle_team[type]["atkComeonNum"]
				self.heroDao.getTeamByType(uid,type,function(flag,teams) {
					if(type == "allstar"){
						var list = []
						list.push([teamCfg].concat(teams.splice(0,3)))
						list.push([teamCfg].concat(teams.splice(0,3)))
						list.push([teamCfg].concat(teams.splice(0,3)))
						cb(true,list)
					}else{
						var list = [teamCfg]
						list = list.concat(teams)
						cb(true,list)
					}
				})
			}
		],function(err) {
			console.error("getUserTeamByType",err)
			cb(false,[])
		})
	}
	//获取自定义阵容
	this.getTeamByCustom = function(uid,hIds,cb) {
		self.heroDao.getHeroList(uid,hIds,function(flag,list) {
			list.unshift({})
			cb(true,list)
		})
	}
}