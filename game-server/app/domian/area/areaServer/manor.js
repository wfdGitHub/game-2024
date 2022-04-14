//家园系统
const manor_builds = require("../../../../config/gameCfg/manor_builds.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const manor_citys = require("../../../../config/gameCfg/manor_citys.json")
const async = require("async")
const builds = {}
for(var i in manor_builds){
	if(!builds[manor_builds[i]["basic"]])
		builds[manor_builds[i]["basic"]] = require("../../../../config/gameCfg/manor_"+manor_builds[i]["basic"]+".json")
}
for(var i in builds["xmc"]){
	builds["xmc"][i]["allWeight"] = 0
	for(var j = 1; j <= 4;j++)
		if(builds["xmc"][i]["quality_"+j])
			builds["xmc"][i]["allWeight"] +=builds["xmc"][i]["quality_"+j]
}
for(var i in builds["qjf"]){
	builds["qjf"][i]["allWeight"] = 0
	for(var j = 1; j <= 4;j++)
		if(builds["qjf"][i]["quality_"+j])
			builds["qjf"][i]["allWeight"] +=builds["qjf"][i]["quality_"+j]
}
var mon_weight = {"all":10000,"1":3000,"2":5000,"3":7000,"4":8500,"5":9500,"6":10000}
for(var i in builds["main"]){
	builds["main"][i]["boss_team"] = JSON.parse(builds["main"][i]["boss_team"])
	for(var j = 1;j <= 6;j++){
		builds["main"][i]["mon_"+j] = JSON.parse(builds["main"][i]["mon_"+j])

	}
}
var citis = []
for(var i in manor_citys){
	manor_citys[i]["npc_team"] = JSON.parse(manor_citys[i]["npc_team"])
	citis.push(i)
}
const hourTime = 3600000
const buyTime = hourTime * 5
const validityTime = hourTime * 8
const build_time = 3000
const boss_cd = hourTime * 6
const mon_cd = hourTime * 2
const main_name = "manor"
const fightAward = "820:1&810:200"
module.exports = function() {
	var self = this
	var local = {}
	var city_infos = {}
	//家园初始化
	this.manorInitData = function() {
		var arr = []
		for(var i = 0;i < 9;i++)
			arr.push("city_"+i)
		self.getAreaHMObj(main_name,arr,function(data) {
			city_infos = {}
			for(var i = 0;i < data.length;i++){
				if(data[i]){
					city_infos[i] = JSON.parse(data[i])
				}else{
					city_infos[i] = false
				}
			}
		})
	}
	//获取家园数据
	this.manorData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data || !data.main){
				self.manorInit(uid,cb)
			}else{
				cb(true,data)
			}
		})
	}
	//初始化玩家家园
	this.manorInit = function(uid,cb) {
		console.log("manorInit",uid)
		self.incrbyLordData(uid,"warehouse",builds["main"][1]["food"])
		var info = {
			"main":1,
			"action":0,
			"boss_time":0,
			"boss_count":0,
			"buy":0,
			"grid_1":0,
			"grid_2":0,
			"grid_3":0,
			"grid_4":-1,
			"grid_5":-1
		}
		for(var i = 1;i <= 6;i++){
			info["mon_time_"+i] = 0
			info["mon_lv_"+i] = 1
		}
		console.log("info",info)
		self.setHMObj(uid,main_name,info)
		if(cb)
			cb(true,info)
	}
	//家园每秒刷新
	this.manorUpdate = function() {
		local.manorCitysUpdate()
	}
	//玩家每日刷新
	this.manorDayUpdate = function(uid) {
		self.setObj(uid,main_name,"buy",0)
		self.setObj(uid,main_name,"boss_count",0)
	}
	//建设升级建筑
	this.manorBuild = function(uid,bId,land,cb) {
		if(!manor_builds[bId]){
			cb(false,"bId error "+bId)
			return
		}
		if(!Number.isInteger(land)){
			cb(false,"land error "+land)
			return
		}
		var mainLv = 0
		var basic = manor_builds[bId]["basic"]
		async.waterfall([
			function(next) {
				//获取主建筑等级
				self.getObj(uid,main_name,"main",function(data) {
					mainLv = Number(data) || 0
					if(manor_builds[bId]["main_lv"] > mainLv){
						next("主建筑等级不足")
						return
					}
					next()
				})
			},
			function(next) {
				//判断格子
				self.getObj(uid,main_name,"land_"+land,function(data) {
					if(data && data != bId)
						next("地块已被占用")
					else
						next()
				})
			},
			function(next) {
				//获取建筑等级并消耗资源
				self.getObj(uid,main_name,bId,function(buildLv) {
					buildLv = Number(buildLv) || 0
					buildLv++
					if(!builds[basic][buildLv]){
						next("建筑等级已满")
						return
					}
					if(bId != "main" && buildLv > mainLv){
						next("主建筑等级不足")
						return
					}
					if(builds[basic][buildLv]["upgrade"]){
						self.consumeItems(uid,builds[basic][buildLv]["upgrade"],1,"升级建筑:"+bId+":"+buildLv,function(flag,err) {
							if(flag)
								next(null,buildLv)
							else
								next(err)
						})
					}else{
						next()
					}
				})
			},
			function(buildLv,next) {
				var info = {}
				info.buildLv = buildLv
				if(buildLv == 1){
					//设置地块
					self.setObj(uid,main_name,"land_"+land,bId)
					if(manor_builds[bId]["type"] == "res")
						self.setObj(uid,main_name,bId+"_time",Date.now())
					if(bId == "yzyd_1"){
						info["grid_4"] = 0
						self.setObj(uid,main_name,"grid_4",0)
					}else if(bId == "yzyd_2"){
						info["grid_5"] = 0
						self.setObj(uid,main_name,"grid_5",0)
					}
				}
				//升级建筑
				self.setObj(uid,main_name,bId,buildLv)
				//建筑类型判断
				switch(bId){
					case "gjy":
					case "dby":
					case "qby":
						self.setBuildLv(uid,bId,buildLv)
					break
					case "main":
					case "cangku":
						var old_food = 0
						if(buildLv > 1)
							old_food = builds[bId][buildLv-1]["food"]
						var add_food = builds[bId][buildLv]["food"] - old_food
						self.incrbyLordData(uid,"warehouse",add_food)
					break
				}
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//交换建筑
	this.manorSwap = function(uid,land1,land2,cb) {
		if(!Number.isInteger(land1) || !Number.isInteger(land2)){
			cb(false,"land error "+land1+" "+land2)
			return
		}
		var bId1 = ""
		var bId2 = ""
		self.getObj(uid,main_name,"land_"+land1,function(data) {
			bId1 = data
			self.getObj(uid,main_name,"land_"+land2,function(data) {
				bId2 = data
				if(bId2)
					self.setObj(uid,main_name,"land_"+land1,bId2)
				else
					self.delObj(uid,main_name,"land_"+land1)
				if(bId1)
					self.setObj(uid,main_name,"land_"+land2,bId1)
				else
					self.delObj(uid,main_name,"land_"+land2)
				cb(true)
			})
		})
	}
	//获取收益
	this.manorReap = function(uid,bId,cb) {
		if(!manor_builds[bId]){
			cb(false,"bId error "+bId)
			return
		}
		if(manor_builds[bId]["type"] != "res"){
			cb(false,"非资源建筑")
			return
		}
		var basic = manor_builds[bId]["basic"]
		var item = manor_builds[bId]["award"]
		var curTime = Date.now()
		self.getHMObj(uid,main_name,[bId,bId+"_time"],function(data) {
			var buildLv = Number(data[0]) || 0
			var time = Number(data[1]) || 0
			if(!buildLv){
				cb(false,"建筑不存在")
				return
			}
			var awardTime = curTime - time
			var value = Math.floor(awardTime / hourTime * builds[basic][buildLv]["output"])
			if(awardTime < 10000 || value < 1){
				cb(false,"资源正在生产中")
				return
			}
			if(value > builds[basic][buildLv]["capacity"])
				value = builds[basic][buildLv]["capacity"]
			var awardList = self.addItemStr(uid,item+":"+value,1,"收获"+bId)
			self.setObj(uid,main_name,bId+"_time",curTime)
			cb(true,{awardList:awardList,time:curTime})
		})
	}
	//驯养马匹
	this.manorStartHorse = function(uid,cb) {
		var bId = "xmc"
		var basic = "xmc"
		self.getHMObj(uid,main_name,[bId,bId+"_time"],function(data) {
			var buildLv = Number(data[0]) || 0
			if(!buildLv){
				cb(false,"建筑不存在")
				return
			}
			if(data[1]){
				cb(false,"正在生产中")
				return
			}
			var time = Number(data[1]) || 0
			self.consumeItems(uid,"810:"+builds[basic][buildLv]["pc"],1,"驯养马匹:"+buildLv,function(flag,err) {
				if(flag){
					var curTime = Date.now() + build_time
					self.setObj(uid,main_name,bId+"_time",curTime)
					cb(true,curTime)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//收取马匹
	this.manorGainHorse = function(uid,cb) {
		var bId = "xmc"
		var basic = "xmc"
		self.getHMObj(uid,main_name,[bId,bId+"_time"],function(data) {
			var buildLv = Number(data[0]) || 0
			if(!buildLv){
				cb(false,"建筑不存在")
				return
			}
			if(!data[1]){
				cb(false,"不在生产中")
				return
			}
			var time = Number(data[1]) || 0
			if(Date.now() > time){
				//获得马匹
				var rand = Math.random() * builds[bId][buildLv]["allWeight"]
				var lv = 1
				for(var i = 1; i <= 4;i++){
					if(rand < builds[bId][buildLv]["quality_"+i]){
						lv = i
						break
					}else{
						rand -= builds[bId][buildLv]["quality_"+i]
					}
				}
				var horseInfo = self.gainRandHorse(uid,lv)
				self.delObj(uid,main_name,bId+"_time")
				cb(true,horseInfo)
			}else{
				cb(false,"未到收取时间")
			}
		})
	}
	//打造护符
	this.manorStartHufu = function(uid,cb) {
		var bId = "qjf"
		var basic = "qjf"
		self.getHMObj(uid,main_name,[bId,bId+"_time"],function(data) {
			var buildLv = Number(data[0]) || 0
			if(!buildLv){
				cb(false,"建筑不存在")
				return
			}
			if(data[1]){
				cb(false,"正在生产中")
				return
			}
			var time = Number(data[1]) || 0
			self.consumeItems(uid,"810:"+builds[basic][buildLv]["pc"],1,"打造护符:"+buildLv,function(flag,err) {
				if(flag){
					var curTime = Date.now() + build_time
					self.setObj(uid,main_name,bId+"_time",curTime)
					cb(true,curTime)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//收取护符
	this.manorGainHufu = function(uid,cb) {
		var bId = "qjf"
		var basic = "qjf"
		self.getHMObj(uid,main_name,[bId,bId+"_time"],function(data) {
			var buildLv = Number(data[0]) || 0
			if(!buildLv){
				cb(false,"建筑不存在")
				return
			}
			if(!data[1]){
				cb(false,"不在生产中")
				return
			}
			var time = Number(data[1]) || 0
			if(Date.now() > time){
				//收取护符
				var rand = Math.random() * builds[bId][buildLv]["allWeight"]
				var lv = 1
				for(var i = 1; i <= 4;i++){
					if(rand < builds[bId][buildLv]["quality_"+i]){
						lv = i
						break
					}else{
						rand -= builds[bId][buildLv]["quality_"+i]
					}
				}
				var hufuInfo = self.gainRandHufu(uid,lv)
				self.delObj(uid,main_name,bId+"_time")
				cb(true,hufuInfo)
			}else{
				cb(false,"未到收取时间")
			}
		})
	}
	//===============贼寇==============//
	//购买军令
	this.manorBuyAction = function(uid,cb) {
		async.waterfall([
			function(next) {
				self.getObj(uid,main_name,"buy",function(count) {
					count = Number(count) || 0
					//消耗元宝
					var needGold = count * default_cfg["quick_once"]["value"]
					if(needGold > default_cfg["quick_max"]["value"])
						needGold = default_cfg["quick_max"]["value"]
					if(needGold){
						self.consumeItems(uid,"202:"+needGold,1,"购买军令",function(flag,err) {
							if(flag)
								next()
							else
								next(err)
						})
					}else{
						next()
					}
				})
			},
			function(next) {
				self.incrbyObj(uid,main_name,"action",-buyTime,function(data) {
					cb(true,data)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//消耗军令
	this.manorActionTime = function(uid,cb) {
		self.getObj(uid,main_name,"action",function(data) {
			data = Number(data) || 0
			var diff = Date.now() - data
			if(diff < hourTime){
				cb(false,"军令不足")
				return
			}
			if(diff > 10 * hourTime)
				data = Date.now() - 10 * hourTime
			data += hourTime
			self.setObj(uid,main_name,"action",data)
			cb(true,data)
		})
	}
	//挑战首领
	this.manorBoss = function(uid,cb) {
		var buildLv = 1
		var bossCount = 0
		var action = 0
		async.waterfall([
			function(next) {
				self.getHMObj(uid,main_name,["main","boss_count","boss_time"],function(data) {
					buildLv = Number(data[0]) || 1
					bossCount = Number(data[1]) || 0
					var bossTime = Number(data[2]) || 0
					if(Date.now() < bossTime){
						next("冷却中")
						return
					}
					if(bossCount >= 2){
						next("挑战次数已满")
						return
					}
					next()
				})
			},
			function(next) {
				self.manorActionTime(uid,function(flag,data) {
					if(flag){
						action = data
						next()
					}else{
						next("军令不足")
					}
				})
			},
			function(next) {
				//战斗结算
				var atkTeam = self.getUserTeam(uid)
				var seededNum = Date.now()
				var defTeam = self.standardTeam(uid,builds["main"][buildLv]["boss_team"],"worldBoss",self.getLordLv(uid))
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					var cd = Date.now() + boss_cd
					self.setObj(uid,main_name,"boss_time",cd)
					self.incrbyObj(uid,main_name,"boss_count",1)
					bossCount++
					var awardList = self.addItemStr(uid,builds["main"][buildLv]["boss_award"],1,"家园BOSS")
					cb(true,{winFlag:winFlag,awardList:awardList,bossCount:bossCount,cd:cd,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action})
				}else{
					cb(true,{winFlag:winFlag,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action})
				}
			}
		],function(err) {
			cb(false,err)
		})
	}
	//挑战山贼
	this.manorMon = function(uid,monId,cb) {
		var buildLv = 1
		var monLv = 1
		var action = 0
		if(!Number.isInteger(monId) || monId < 1 || monId > 6){
			cb(false,"monId error "+monId)
			return
		}
		async.waterfall([
			function(next) {
				self.getHMObj(uid,main_name,["main","mon_time_"+monId,"mon_lv_"+monId],function(data) {
					buildLv = Number(data[0]) || 1
					var monTime = Number(data[1]) || 0
					if(Date.now() < monTime){
						next("冷却中")
						return
					}
					monLv = Number(data[2]) || 1
					next()
				})
			},
			function(next) {
				self.manorActionTime(uid,function(flag,data) {
					if(flag){
						action = data
						next()
					}else{
						next("军令不足")
					}
				})
			},
			function(next) {
				//战斗结算
				var atkTeam = self.getUserTeam(uid)
				var seededNum = Date.now()
				var dl = "zhulu_normal"
				if(monLv >= 4)
					dl = "zhulu_boss"
				else if(monLv >= 2)
					dl = "zhulu_elite"
				var defTeam = self.standardTeam(uid,builds["main"][buildLv]["mon_"+monLv],dl,self.getLordLv(uid))
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					var cd = Date.now() + mon_cd
					var awardList = self.addItemStr(uid,builds["main"][buildLv]["mon_award"+monLv],1,"家园怪物")
					//新等级
					var rand = Math.random() * mon_weight["all"]
					var lv = 1
					for(var i = 1; i <= 6;i++){
						if(rand < mon_weight[i]){
							lv = i
							break
						}
					}
					self.setObj(uid,main_name,"mon_lv_"+monId,lv)
					self.setObj(uid,main_name,"mon_time_"+monId,cd)
					cb(true,{winFlag:winFlag,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,awardList:awardList,cd:cd,lv:lv,action:action})
				}else{
					cb(true,{winFlag:winFlag,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action})
				}
			}
		],function(err) {
			cb(false,err)
		})
	}
	//家园特殊地点刷新
	local.manorCitysUpdate = function() {
		var curTime = Date.now()
		for(var land in city_infos){
			if(city_infos[land]["own"]){
				//存在拥有者,判断收益
				if(Date.now() > city_infos[land]["endTime"]){
					local.gainCityAward(land)
				}
			}else{
				//不存在拥有者,判断刷新
				if(!city_infos[land] || Date.now() > city_infos[land]["overTime"]){
					local.manorCreateCity(land)
				}
			}
		}
	}
	//生成新地点
	local.manorCreateCity = function(land) {
		city_infos[land] = {
			"type" : "city", 											//特殊地点
			"id" : citis[Math.floor(citis.length * Math.random())],    	//城池类型
			"occupyTime" : 0,  									   		//占领时间
			"endTime" : 0,      									   	//结束时间
			"overTime" : Date.now() + validityTime + validityTime,      //过期时间
			"own" : 0,                                              	//拥有者
			"land" : land,  											//位置
			"grid" : 0 													//地块
		}
		local.saveCity(land)
	}
	local.saveCity = function(land) {
		self.setAreaObj(main_name,"city_"+land,JSON.stringify(city_infos[land]))
	}
	local.gainCityAward = function(land) {
		//结算收益
		if(city_infos[land].own){
			var ownUid = city_infos[land].own
			var curTime = Date.now()
			if(curTime > city_infos[land].endTime)
				curTime = city_infos[land].endTime
			var awardTime = curTime - city_infos[land].occupyTime
			var item = manor_citys[city_infos[land].id]["award"]
			var cityId = city_infos[land].id
			var grid = city_infos[land].grid
			city_infos[land].occupyTime = 0
			city_infos[land].own = 0
			city_infos[land].grid = 0
			local.saveCity(land)
			self.setObj(ownUid,main_name,"grid_"+grid,0)
			self.getObj(ownUid,main_name,"main",function(data) {
				var buildLv = Number(data) || 1
				var value = Math.floor(awardTime / hourTime * manor_citys[cityId]["output"] * builds["main"][buildLv]["city_add"])
				var awardStr = ""
				if(value)
					awardStr = item+":"+value
				else
					awardStr = item+":1"
				self.sendMail(ownUid,"特殊地点收益","您占领的【"+manor_citys[cityId]["name"]+"】已获得收益",awardStr)
			})
		}
	}
	//获取特殊地点数据
	this.manorCityInfos = function(cb) {
		cb(true,city_infos)
	}
	//占领特殊地点
	this.manorOccupyCity = function(uid,land,cb) {
		if(!city_infos[land]){
			cb(false,"land error "+land)
			return
		}
		var atkTeam = self.getUserTeam(uid)
		var defTeam = []
		var seededNum = Date.now()
		var awardList = []
		var buildLv = 1
		var action = 0
		var winFlag = false
		var grid = 0
		async.waterfall([
			function(next) {
				//条件判定
				if(city_infos[land].endTime && Date.now() > city_infos[land].endTime){
					next("该地点不可占领")
					return
				}
				if(city_infos[land].own == uid){
					next("不能攻打自己的城池")
					return
				}
				next()
			},
			function(next) {
				self.getHMObj(uid,main_name,["main","grid_1","grid_2","grid_3","grid_4","grid_5"],function(data) {
					buildLv = Number(data[0]) || 1
					for(var i = 1;i <= 5;i++){
						if(data[i] == 0){
							grid = i
							break
						}
					}
					if(!grid){
						cb(false,"占领城池已到上限")
					}else{
						next()
					}
				})
			},
			function(next) {
				self.manorActionTime(uid,function(flag,data) {
					if(flag){
						action = data
						next()
					}else{
						next("军令不足")
					}
				})
			},
			function(next) {
				//获取敌方阵容
				if(!city_infos[land]["own"]){
					//机器人队伍
					defTeam = self.standardTeam(uid,manor_citys[city_infos[land].id]["npc_team"],"zhulu_boss",self.getLordLv(uid))
					next()
				}else{
					//玩家队伍
					self.getDefendTeam(city_infos[land]["own"],function(team) {
						defTeam = team
						next()
					})
				}
			},
			function(next) {
				//开始战斗
				winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					//胜利
					awardList = self.addItemStr(uid,fightAward,2,"特殊地点")
					next()
				}else{
					//失败
					awardList = self.addItemStr(uid,fightAward,1,"特殊地点")
					cb(true,{winFlag:winFlag,awardList:awardList,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action})
				}
			},
			function(next) {
				//占领成功
				var curTime = Date.now()
				if(city_infos[land].own){
					//有人 结算收益
					if(curTime > city_infos[land].endTime)
						curTime = city_infos[land].endTime
					var awardTime = curTime - city_infos[land].occupyTime
					var item = manor_citys[city_infos[land].id]["award"]
					var value = Math.floor(awardTime / hourTime * manor_citys[city_infos[land].id]["output"] * builds["main"][buildLv]["city_add"] * 0.5)
					var awardStr = ""
					if(value)
						awardStr = item+":"+value
					else
						awardStr = item+":1"
					self.sendMail(uid,"占领特殊地点","您已经成功占领了【"+manor_citys[city_infos[land].id]["name"]+"】,夺取了50%占领收益",awardStr)
					self.sendMail(city_infos[land].own,"特殊地点被占领","您所占领的【"+manor_citys[city_infos[land].id]["name"]+"】已被夺走,失去了50%收益,请前往夺回！",awardStr)
					city_infos[land].occupyTime = curTime
					city_infos[land].own = uid
				}else{
					//无人占领
					if(!city_infos[land].endTime)
						city_infos[land].endTime = curTime + validityTime
					city_infos[land].occupyTime = curTime
					city_infos[land].own = uid
				}
				city_infos[land]["grid"] = grid
				self.setObj(uid,main_name,"grid_"+grid,JSON.stringify(city_infos[land]))
				local.saveCity(land)
				cb(true,{winFlag:winFlag,awardList:awardList,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action,"grid":grid,cityInfo:city_infos[land]})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//放弃地点
	this.manorGiveUp = function(uid,grid,cb) {
		if(!Number.isInteger(grid) || grid < 1 || grid > 5){
			cb(false,"grid error "+grid)
			return
		}
		self.getObj(uid,main_name,"grid_"+grid,function(data) {
			if(data == 0 || data == -1){
				cb(false)
				return
			}
			data = JSON.parse(data)
			if(data.type == "city"){
				local.gainCityAward(data.land)
				cb(true)
			}
		})
	}
}