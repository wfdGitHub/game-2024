//家园系统
const manor_builds = require("../../../../config/gameCfg/manor_builds.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const manor_citys = require("../../../../config/gameCfg/manor_citys.json")
const async = require("async")
const heroId = 305010
const hourTime = 3600000
const buyTime = hourTime * 5
const validityTime = hourTime * 8
const build_time = hourTime * 23
const boss_cd = hourTime * 6
const mon_cd = hourTime * 2
const main_name = "manor"
const fightAward = "820:1&810:200"
const actionBasic = 10
const builds = {}
for(var i in manor_builds){
	if(!builds[manor_builds[i]["basic"]])
		builds[manor_builds[i]["basic"]] = require("../../../../config/gameCfg/manor_"+manor_builds[i]["basic"]+".json")
}
for(var i in builds["xmc"]){
	builds["xmc"][i]["allWeight"] = 0
	for(var j = 1; j <= 4;j++){
		if(!builds["xmc"][i]["quality_"+j])
			builds["xmc"][i]["quality_"+j] = 0
		builds["xmc"][i]["allWeight"] += builds["xmc"][i]["quality_"+j]
	}
}
for(var i in builds["qjf"]){
	builds["qjf"][i]["allWeight"] = 0
	for(var j = 1; j <= 4;j++){
		if(!builds["qjf"][i]["quality_"+j])
			builds["qjf"][i]["quality_"+j] = 0
		builds["qjf"][i]["allWeight"] += builds["qjf"][i]["quality_"+j]
	}
}
var mon_weight = {"all":10000,"1":3000,"2":6000,"3":8000,"4":9000,"5":9600,"6":10000}
for(var i in builds["main"]){
	i = Number(i)
	builds["main"][i]["boss_team"] = JSON.parse(builds["main"][i]["boss_team"])
	builds["main"][i]["robot"] = JSON.parse(builds["main"][i]["robot"])
	for(var j = 1;j <= 6;j++){
		builds["main"][i]["mon_"+j] = JSON.parse(builds["main"][i]["mon_"+j])
	}
	//生成机器人主城配置
	var robot_city = {}
	var tmpLand = 0
	for(var k in manor_builds){
		if(manor_builds[k]["main_lv"] <= i){
			robot_city[k] = i
			if(!builds[manor_builds[k]["basic"]][i])
				robot_city[k] = 4
			robot_city["land_"+tmpLand++] = k
		}
	}
	builds["main"][i]["robot_city"] = robot_city
}
var citis = []
for(var i in manor_citys){
	manor_citys[i]["npc_team"] = JSON.parse(manor_citys[i]["npc_team"])
	citis.push(i)
}
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
				self.getBagItem(uid,"810",function(value) {
					data["810"] = value
					cb(true,data)
				})
			}
		})
	}
	//初始化玩家家园
	this.manorInit = function(uid,cb) {
		self.incrbyLordData(uid,"warehouse",builds["main"][1]["food"])
		self.updateSprintRank("manor_rank",uid,manor_builds["main"]["score_rate"])
		var info = {
			"main":1,
			"land_0":"main",
			"action":0,
			"boss_time":0,
			"boss_count":0,
			"buy":0,
			"grid_1":0,
			"grid_2":0,
			"grid_3":0,
			"grid_4":-1,
			"grid_5":-1,
			"810" : 2000
		}
		for(var i = 1;i <= 6;i++){
			info["mon_time_"+i] = 0
			info["mon_lv_"+i] = 1
		}
		self.setHMObj(uid,main_name,info,function() {
			self.addItemStr(uid,"810:2000",1,"家园初始化")
		})
		local.manorAddLevel(uid)
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
		var buildLv = 0
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
					if(bId == "main"){
						var olv = self.getLordAtt(uid,"officer")
						if(mainLv >= olv){
							next("爵位限制")
							return
						}
					}
					next()
				})
			},
			function(next) {
				//获取建筑等级并消耗资源
				self.getObj(uid,main_name,bId,function(data) {
					buildLv = Number(data) || 0
					buildLv++
					if(!builds[basic][buildLv]){
						next("建筑等级已满")
						return
					}
					if(bId != "main" && buildLv > mainLv){
						next("主建筑等级不足")
						return
					}
					//判断格子
					if(buildLv == 1){
						self.getObj(uid,main_name,"land_"+land,function(data) {
							if(data && data != bId)
								next("地块已被占用")
							else
								next()
						})
					}else{
						next()
					}
				})
			},
			function(next) {
				if(builds[basic][buildLv]["upgrade"]){
					self.consumeItems(uid,builds[basic][buildLv]["upgrade"],1,"升级建筑:"+bId+":"+buildLv,function(flag,err) {
						if(flag)
							next(null,buildLv)
						else
							next(err)
					})
				}else{
					next(null,buildLv)
				}
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
						local.manorMoveLevel(uid,buildLv)
					case "cangku":
						var old_food = 0
						if(buildLv > 1)
							old_food = builds[bId][buildLv-1]["food"]
						var add_food = builds[bId][buildLv]["food"] - old_food
						self.incrbyLordData(uid,"warehouse",add_food)
					break
				}
				if(bId == "main")
					self.taskUpdate(uid,"manor_lv",1,buildLv)
				self.updateSprintRank("manor_rank",uid,manor_builds[bId]["score_rate"])
				self.taskUpdate(uid,"manor_score",manor_builds[bId]["score_rate"])
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
		self.getHMObj(uid,main_name,[bId,bId+"_time","fall"],function(data) {
			var buildLv = Number(data[0]) || 0
			var time = Number(data[1]) || 0
			var fall = Number(data[2]) || 0
			if(!buildLv){
				cb(false,"建筑不存在")
				return
			}
			if(fall && fall > Date.now()){
				cb(false,"被占领时不能领取收益")
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
	//打造兵符
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
			self.consumeItems(uid,"810:"+builds[basic][buildLv]["pc"],1,"打造兵符:"+buildLv,function(flag,err) {
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
	//收取兵符
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
				//收取兵符
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
		var maxCount = 4
    	var manor_pri = self.getLordAtt(uid,"manor_pri")
    	if(manor_pri > Date.now()){
    		maxCount += 3
    	}
		async.waterfall([
			function(next) {
				self.getObj(uid,main_name,"buy",function(count) {
					count = Number(count) || 0
					if(count > maxCount){
						next("今日购买已达上限")
						return
					}
					//消耗元宝
					var needGold = count * default_cfg["quick_once"]["value"]
					if(needGold){
						self.consumeItems(uid,"202:"+needGold,2,"购买军令",function(flag,err) {
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
				self.incrbyObj(uid,main_name,"buy",1,function(data) {
					next()
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
		self.getHMObj(uid,main_name,["action","yzyd_1","yzyd_2"],function(list) {
			var action = Number(list[0]) || 0
			var actionMax = actionBasic
			var yzyd_1 = Number(list[1]) || 0
			var yzyd_2 = Number(list[2]) || 0
			var diff = Date.now() - action
			if(diff < hourTime){
				cb(false,"军令不足")
				return
			}
			if(builds["yzyd"][yzyd_1])
				actionMax += builds["yzyd"][yzyd_1]["add"]
			if(builds["yzyd"][yzyd_2])
				actionMax += builds["yzyd"][yzyd_2]["add"]
			if(diff > actionMax * hourTime)
				action = Date.now() - actionMax * hourTime
			action += hourTime
			self.setObj(uid,main_name,"action",action)
			cb(true,action)
		})
	}
	//挑战首领
	this.manorBoss = function(uid,cb) {
		var buildLv = 1
		var bossCount = 0
		var action = 0
		var maxCount = 2
		var rate = 1
    	var manor_pri = self.getLordAtt(uid,"manor_pri")
    	if(manor_pri > Date.now()){
    		maxCount += 1
    		rate = 1.5
    	}
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
					if(bossCount >= maxCount){
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
				var defTeam = self.standardTeam(uid,builds["main"][buildLv]["boss_team"],"worldBoss",self.getLordLv(uid) - 2)
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					var cd = Date.now() + boss_cd
					self.setObj(uid,main_name,"boss_time",cd)
					self.incrbyObj(uid,main_name,"boss_count",1)
					bossCount++
					var awardList = self.addItemStr(uid,builds["main"][buildLv]["boss_award"],rate,"家园BOSS")
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
		var rate = 1
    	var manor_pri = self.getLordAtt(uid,"manor_pri")
    	var monCd = mon_cd
    	if(manor_pri > Date.now()){
    		rate = 1.5
    		monCd = Math.floor(monCd / 4)
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
				var defTeam = self.standardTeam(uid,builds["main"][buildLv]["mon_"+monLv],dl,self.getLordLv(uid) - 5)
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					var cd = Date.now() + monCd
					var awardList = self.addItemStr(uid,builds["main"][buildLv]["mon_award"+monLv],rate,"家园怪物")
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
					local.gainCityAward(city_infos[land]["own"],land)
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
	//特殊地点收益
	local.gainCityAward = function(uid,land,grid) {
		//结算收益
		if(city_infos[land].own && uid == city_infos[land].own){
			var curTime = Date.now()
			if(curTime > city_infos[land].endTime)
				curTime = city_infos[land].endTime
			var awardTime = curTime - city_infos[land].occupyTime
			var item = manor_citys[city_infos[land].id]["award"]
			var cityId = city_infos[land].id
			grid = city_infos[land].grid
			city_infos[land].occupyTime = 0
			city_infos[land].own = 0
			city_infos[land].grid = 0
			delete city_infos[land].atkInfo
			delete city_infos[land].team
			local.saveCity(land)
			self.getHMObj(uid,main_name,["main","zlt"],function(list) {
				var buildLv = Number(list[0]) || 1
				var zlt = Number(list[1]) || 0
				var value = Math.floor(awardTime / hourTime * manor_citys[cityId]["output"] * builds["main"][buildLv]["city_add"])
				if(builds["zlt"][zlt])
					value += Math.floor(builds["zlt"][zlt]["add"] * value)
				var awardStr = ""
				if(value)
					awardStr = item+":"+value
				else
					awardStr = item+":1"
				self.sendTextToMail(uid,"manor_tsdd",awardStr,manor_citys[cityId]["name"])
			})
		}
		if(grid)
			self.setObj(uid,main_name,"grid_"+grid,0)
	}
	//玩家城池收益
	local.gainCityUser = function(uid,cityInfo) {
		//结算收益
		var curTime = Date.now()
		if(curTime > cityInfo.endTime)
			curTime = cityInfo.endTime
		var awardTime = curTime - cityInfo.occupyTime
		var grid = cityInfo.grid
		var value = Math.floor(awardTime / hourTime * cityInfo["output"])
		self.getObj(uid,main_name,"zlt",function(data) {
			var zlt = Number(data) || 0
			if(builds["zlt"][zlt])
				value += Math.floor(builds["zlt"][zlt]["add"] * value)
			var awardStr = ""
			if(value)
				awardStr = "810:"+value
			else
				awardStr = "810:1"
			self.sendTextToMail(uid,"manor_zlsy",awardStr,cityInfo.defInfo.name)
			self.setObj(uid,main_name,"grid_"+grid,0)
			self.redisDao.db.zscore("cross:manorFall",cityInfo.defInfo.uid,function(err,data) {
				if(data && data == cityInfo.endTime){
					self.redisDao.db.zadd("cross:manorFall",0,cityInfo.defInfo.uid)
				}
			})
		})
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
		var targetLv = 1
		var action = 0
		var winFlag = false
		var grid = 0
		var atkInfo = self.getSimpleUser(uid)
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
				//免战判断
				self.getObj(uid,main_name,"truce",function(data) {
					if(data)
						self.redisDao.db.zadd("cross:manorTruce",0,uid)
					next()
				})
			},
			function(next) {
				//统帅厅加成
				self.getObj(uid,main_name,"tst",function(data) {
					if(data && builds["tst"][data]){
						if(!atkTeam[6]["team_atk_add"])
							atkTeam[6]["team_atk_add"] = 0
						atkTeam[6]["team_atk_add"] += builds["tst"][data]["add"]
						if(!atkTeam[6]["team_maxHP_add"])
							atkTeam[6]["team_maxHP_add"] = 0
						atkTeam[6]["team_maxHP_add"] += builds["tst"][data]["add"]
					}
					next()
				})
			},
			function(next) {
				//获取敌方阵容
				if(!city_infos[land]["own"]){
					//机器人队伍
					defTeam = self.standardTeam(uid,manor_citys[city_infos[land].id]["npc_team"],"zhulu_boss",self.getLordLv(uid))
					targetLv = buildLv
					next()
				}else{
					//玩家队伍
					self.getDefendTeam(city_infos[land]["own"],function(team) {
						defTeam = team
						self.getObj(city_infos[land]["own"],main_name,"main",function(data) {
							targetLv = Number(data) || 1
							next()
						})
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
					var value1 = Math.floor(awardTime / hourTime * manor_citys[city_infos[land].id]["output"] * builds["main"][buildLv]["city_add"] * 0.5)
					if(!value1)
						value1 = 1
					var awardStr1 = item+":"+value1
					self.sendTextToMail(uid,"manor_tsddzl",awardStr1,manor_citys[city_infos[land].id]["name"])
					var value2 = Math.floor(awardTime / hourTime * manor_citys[city_infos[land].id]["output"] * builds["main"][targetLv]["city_add"] * 0.5)
					var awardStr2 = ""
					if(!value2)
						value2 = 1
					var awardStr2 = item+":"+value2
					self.sendTextToMail(city_infos[land].own,"manor_bzl",awardStr2,manor_citys[city_infos[land].id]["name"])
					self.setObj(city_infos[land].own,main_name,"grid_"+city_infos[land].grid,0)
					city_infos[land].occupyTime = curTime
					city_infos[land].own = uid
				}else{
					//无人占领
					if(!city_infos[land].endTime)
						city_infos[land].endTime = curTime + validityTime
					city_infos[land].occupyTime = curTime
					city_infos[land].own = uid
				}
				city_infos[land]["team"] = atkTeam
				city_infos[land]["grid"] = grid
				city_infos[land]["atkInfo"] = atkInfo
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
				local.gainCityAward(uid,data.land,grid)
				cb(true)
			}else if(data.type == "user"){
				local.gainCityUser(uid,data)
				cb(true)
			}else{
				cb(false)
			}
		})
	}
	//搜寻玩家
	this.manorFindUser = function(uid,cb) {
		var list = []
		var info = {}
		var buildLv
		async.waterfall([
			function(next) {
				self.getObj(uid,main_name,"main",function(lv) {
					buildLv = Number(lv) || 1
					var targetLv = buildLv
					var rand = Math.random()
					if(rand < 0.3){
						if(targetLv > 1)
							targetLv--
					}else if(rand > 0.9){
						if(targetLv <= 10)
							targetLv++
					}
					local.manorSrandmember(targetLv,2,function(flag,data) {
						if(flag){
							list = data
							next()
						}else{
							self.addItemStr(uid,"810:100",1,"搜寻返还")
							next("找不到可用的目标")
						}
					})
				})
			},
			function(next) {
				for(var i = 0;i < list.length;i++){
					if(list[i] != uid){
						info.uid = list[i]
						break
					}
				}
				if(!info.uid){
					self.addItemStr(uid,"810:100",1,"搜寻返还")
					next("找不到可用的目标")
					return
				}
				next()
			},
			function(next) {
				if(info.uid > 10000){
					self.getPlayerInfoByUids([info.uid],function(data) {
						info.userInfo = data[0]
						next()
					})
				}else{
					info.userInfo = {"uid" : info.uid,"head":heroId,"name" : self.namespace.getNameByIndex(info.uid)}
					next()
				}
			},
			function(next) {
				//获取敌方队伍
				if(info.uid < 10000){
					//机器人队伍
					info.defTeam = builds["main"][buildLv]["robot"]
					next()
				}else{
					//玩家队伍
					self.getDefendTeam(info.uid,function(team) {
						info.defTeam = team
						next()
					})
				}
			},
			function(next) {
				//建筑布局
				if(info.uid > 10000){
					self.getObjAll(info.uid,main_name,function(data) {
						info.cityInfo = data
						next()
					})
				}else{
					info.cityInfo = builds["main"][buildLv]["robot_city"]
					next()
				}
			},
			function(next) {
				if(info.uid > 10000){
					self.redisDao.db.hget("player:user:"+info.uid+":bag","810",function(err,value) {
						info.value = value
						next()
					})
				}else{
					info.value = builds["main"][buildLv]["robot_food"]
					if(info.cityInfo["cangku"] && builds["cangku"][info.cityInfo["cangku"]])
						info.value += builds["cangku"][info.cityInfo["cangku"]]["safety"]
					next()
				}
			},
			function(next) {
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//占领玩家
	this.manorOccupyUser = function(uid,target,cb) {
		if(!target || !Number.isInteger(target)){
			cb(false,"target error")
			return
		}
		var atkTeam = self.getUserTeam(uid)
		var defTeam = []
		var seededNum = Date.now()
		var awardList = []
		var buildLv = 1
		var output = 0
		var targetBlv = 1
		var safety = 0
		var action = 0
		var winFlag = false
		var grid = 0
		var diff = 0
		var atkInfo = self.getSimpleUser(uid)
		var defInfo = {"uid" : target,"head":heroId}
		var endTime = Date.now() + validityTime
		async.waterfall([
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
				//获取对方数据
				if(target < 10000){
					defInfo.name = self.namespace.getNameByIndex(target)
					next()
				}else{
					self.getPlayerKeyByUid(target,"name",function(name) {
						if(!name){
							next("玩家不存在")
							return
						}
						defInfo.name = name
						next()
					})
				}
			},
			function(next) {
				//消耗军令
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
				//免战判断
				self.getObj(uid,main_name,"truce",function(data) {
					if(data)
						self.redisDao.db.zadd("cross:manorTruce",0,uid)
					next()
				})
			},
			function(next) {
				//统帅厅加成
				self.getObj(uid,main_name,"tst",function(data) {
					if(data && builds["tst"][data]){
						if(!atkTeam[6]["team_atk_add"])
							atkTeam[6]["team_atk_add"] = 0
						atkTeam[6]["team_atk_add"] += builds["tst"][data]["add"]
						if(!atkTeam[6]["team_maxHP_add"])
							atkTeam[6]["team_maxHP_add"] = 0
						atkTeam[6]["team_maxHP_add"] += builds["tst"][data]["add"]
					}
					next()
				})
			},
			function(next) {
				//获取敌方队伍
				if(target < 10000){
					//机器人队伍
					defTeam = builds["main"][buildLv]["robot"]
					next()
				}else{
					//玩家队伍
					self.getDefendTeam(target,function(team) {
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
					next()
				}else{
					//失败
					//记录战报
					local.addRecord(winFlag,atkTeam,defTeam,atkInfo,defInfo,{seededNum : seededNum},0)
					awardList = self.addItemStr(uid,fightAward,1,"玩家城池")
					cb(true,{winFlag:winFlag,awardList:awardList,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action})
				}
			},
			function(next) {
				//获取收益
				if(target > 10000){
					self.getHMObj(target,main_name,["nc_1","nc_2","cangku","main"],function(data) {
						output = 0
						if(builds["nc"][data[0]])
							output += builds["nc"][data[0]]["output"]
						if(builds["nc"][data[1]])
							output += builds["nc"][data[1]]["output"]
						if(!output)
							output = 100
						var cangku = data[2] || 0
						if(builds["cangku"][cangku])
							safety = builds["cangku"][cangku]["safety"]
						targetBlv = data[3] || 1
						next()
					})
				}else{
					output = builds["main"][buildLv]["robot_output"]
					next()
				}
			},
			function(next) {
				//转移至占领列表
				if(target > 10000){
					local.manorAddFall(target,targetBlv,endTime,function(data) {
						if(data)
							next()
						else
							next("该玩家不能占领")
					})
				}else{
					next()
				}
			},
			function(next) {
				//胜利
				awardList = self.addItemStr(uid,fightAward,2,"玩家城池")
				//获取保护资源之外的资源的30%
				if(target > 10000){
					self.redisDao.db.hget("player:user:"+target+":bag","810",function(err,value) {
						if(value && value > safety){
							diff = Math.floor((value - safety) * 0.3)
							awardList = awardList.concat(self.addItemStr(uid,"810:"+diff,1,"玩家城池"))
							self.redisDao.db.hincrby("player:user:"+target+":bag",810,-diff)
							next()
						}else{
							next()
						}
						//记录战报
						local.addRecord(winFlag,atkTeam,defTeam,atkInfo,defInfo,{seededNum : seededNum},diff)
					})
				}else{
					diff = builds["main"][buildLv]["robot_food"]
					awardList = awardList.concat(self.addItemStr(uid,"810:"+diff,1,"机器人城池"))
					//记录战报
					local.addRecord(winFlag,atkTeam,defTeam,atkInfo,defInfo,{seededNum : seededNum},diff)
					next()
				}
			},
			function(next) {
				//数据处理
				var cityInfo = {
					"type" : "user", 											//特殊地点
					"defInfo" : defInfo,    									//玩家信息
					"occupyTime" : Date.now(),  								//占领时间
					"endTime" : endTime,      									//结束时间
					"output" : output, 											//产出速度
					"grid" : grid, 												//地块
					"team" : defTeam 										//敌方阵容
				}
				self.setObj(uid,main_name,"grid_"+grid,JSON.stringify(cityInfo))
				if(target > 10000){
					self.setObj(target,main_name,"fall",cityInfo.endTime)
					atkInfo.grid = grid
					self.setObj(target,main_name,"fallUser",JSON.stringify(atkInfo))
				}
				cb(true,{winFlag:winFlag,awardList:awardList,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action,"grid":grid,cityInfo:cityInfo,diff:diff})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//反击
	this.manorRevolt = function(uid,cb) {
		var atkTeam = self.getUserTeam(uid)
		var defTeam = []
		var seededNum = Date.now()
		var atkInfo = self.getSimpleUser(uid)
		var defInfo = {}
		async.waterfall([
			function(next) {
				//占领状态
				self.redisDao.db.zscore("cross:manorFall",uid,function(err,data) {
					if(err || !data)
						next("未被占领")
					else
						next()
				})
			},
			function(next) {
				self.getObj(uid,main_name,"fallUser",function(data) {
					if(data){
						defInfo = JSON.parse(data)
						next(null)
					}else{
						next("未被占领")
					}
				})
			},
			function(next) {
				//统帅厅加成
				self.getObj(uid,main_name,"tst",function(data) {
					if(data && builds["tst"][data]){
						if(!atkTeam[6]["team_atk_add"])
							atkTeam[6]["team_atk_add"] = 0
						atkTeam[6]["team_atk_add"] += builds["tst"][data]["add"]
						if(!atkTeam[6]["team_maxHP_add"])
							atkTeam[6]["team_maxHP_add"] = 0
						atkTeam[6]["team_maxHP_add"] += builds["tst"][data]["add"]
					}
					next()
				})
			},
			function(next) {
				//家园特权加成
		    	var manor_pri = self.getLordAtt(uid,"manor_pri")
		    	if(manor_pri > Date.now()){
					if(!atkTeam[6]["team_atk_add"])
						atkTeam[6]["team_atk_add"] = 0
					atkTeam[6]["team_atk_add"] += 1
					if(!atkTeam[6]["team_maxHP_add"])
						atkTeam[6]["team_maxHP_add"] = 0
					atkTeam[6]["team_maxHP_add"] += 1
		    	}
		    	next()
			},
			function(next) {
				//玩家队伍
				self.getDefendTeam(defInfo.uid,function(team) {
					defTeam = team
					next()
				})
			},
			function(next) {
				//开始战斗
				winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					//胜利
					local.addRecord(winFlag,atkTeam,defTeam,atkInfo,defInfo,{seededNum : seededNum},0,true)
					//解除占领状态
					self.setObj(defInfo.uid,main_name,"grid_"+defInfo.grid,0)
					self.redisDao.db.zadd("cross:manorFall",0,uid)
				}
				cb(true,{winFlag:winFlag,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//添加记录
	local.addRecord = function(winFlag,atkTeam,defTeam,atkUser,defUser,fightInfo,diff,revolt) {
		if(revolt){
			if(atkUser.uid > 10000){
				var info = {"type":"revolt_atk",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,diff : diff,time : Date.now()}
				self.redisDao.db.rpush("player:user:"+atkUser.uid+":manorRecord",JSON.stringify(info),function(err,num) {
					if(num > 5){
						self.redisDao.db.ltrim("player:user:"+atkUser.uid+":manorRecord",-5,-1)
					}
				})
			}
			if(defUser.uid > 10000){
				var info = {"type":"revolt_def",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,diff : diff,time : Date.now()}
				self.redisDao.db.rpush("player:user:"+defUser.uid+":manorRecord",JSON.stringify(info),function(err,num) {
					if(num > 5){
						self.redisDao.db.ltrim("player:user:"+defUser.uid+":manorRecord",-5,-1)
					}
				})
			}
		}else{
			if(atkUser.uid > 10000){
				var info = {"type":"atk",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,diff : diff,time : Date.now()}
				self.redisDao.db.rpush("player:user:"+atkUser.uid+":manorRecord",JSON.stringify(info),function(err,num) {
					if(num > 5){
						self.redisDao.db.ltrim("player:user:"+atkUser.uid+":manorRecord",-5,-1)
					}
				})
			}
			if(defUser.uid > 10000){
				var info = {"type":"def",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,diff : diff,time : Date.now()}
				self.redisDao.db.rpush("player:user:"+defUser.uid+":manorRecord",JSON.stringify(info),function(err,num) {
					if(num > 5){
						self.redisDao.db.ltrim("player:user:"+defUser.uid+":manorRecord",-5,-1)
					}
				})
			}
		}
	}
	//获取记录
	this.manorRerord = function(uid,cb) {
		self.redisDao.db.lrange("player:user:"+uid+":manorRecord",0,-1,function(err,list) {
			if(err || !list){
				cb(true,[])
			}else{
				cb(true,list)
			}
		})
	}
	//添加玩家等级集合
	local.manorAddLevel = function(uid) {
		self.redisDao.db.sadd("cross:manorLevel:1",uid)
	}
	//转移玩家等级集合
	local.manorMoveLevel = function(uid,newLv) {
		self.redisDao.db.smove("cross:manorLevel:"+(newLv-1),"cross:manorLevel:"+newLv,uid,function(err,data) {
			if(err || !data){
				console.error("转移玩家等级错误 uid:" +uid+"  lv:"+newLv+" err:"+err+"data:"+data)
			}
		})
	}
	//添加进占领列表
	local.manorAddFall = function(uid,lv,endTime,cb) {
		self.redisDao.db.srem("cross:manorLevel:"+lv,uid,function(err,data) {
			if(!err && data){
				self.redisDao.db.zadd("cross:manorFall",endTime,uid)
				cb(true)
			}else{
				cb(false)
			}
		})
	}
	//随机获取玩家集合
	local.manorSrandmember = function(lv,count,cb) {
		self.redisDao.db.scard("cross:manorLevel:"+lv,function(err,data) {
			if(!err && data < 20){
				var list = []
				for(var i = 0;i < count;i++){
					list.push(Math.floor(Math.random() * 9000 + 1000))
				}
				cb(true,list)
			}else{
				self.redisDao.db.srandmember("cross:manorLevel:"+lv,count,function(err,data) {
					if(err || !data){
						cb(false)
					}else{
						cb(true,data)
					}
				})
			}
		})
	}
}