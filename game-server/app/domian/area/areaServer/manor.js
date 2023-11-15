//家园系统
const manor_type = require("../../../../config/gameCfg/manor_type.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const manor_citys = require("../../../../config/gameCfg/manor_citys.json")
const manor_main = require("../../../../config/gameCfg/manor_main.json")
const manor_make = require("../../../../config/gameCfg/manor_make.json")
const gem_lv = require("../../../../config/gameCfg/gem_lv.json")
const battle_cfg = require("../../../../config/gameCfg/battle_cfg.json")
const async = require("async")
const heroId = 305010
const hourTime = 3600000
const buyTime = hourTime * 5
const validityTime = hourTime * 8
const build_time = hourTime * 23
const boss_cd = hourTime * 6
const mon_cd = hourTime * 2
const main_name = "manor"
const fightAward = "800:10"
const actionBasic = 10
const builds = {}
var mon_weight = {"all":10000,"1":3000,"2":6000,"3":8000,"4":9000,"5":9600,"6":10000}
for(var i in manor_main){
	i = Number(i)
	manor_main[i]["boss_team"] = manor_main[i]["boss_team"]
	manor_main[i]["robot"] = manor_main[i]["robot"]
	for(var j = 1;j <= 6;j++)
		manor_main[i]["mon_"+j] = manor_main[i]["mon_"+j]
	//生成机器人主城配置
	var robot_city = {}
	var tmpLand = 0
	for(var k in manor_type)
		robot_city[k] = i
	manor_main[i]["robot_city"] = robot_city
}
var citis = []
for(var i in manor_citys)
	citis.push(i)
module.exports = function() {
	var self = this
	var local = {}
	var city_infos = {}
	//家园初始化
	this.manorInitData = function() {
		var arr = []
		for(var i = 0;i < 5;i++)
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
		var info = {
			"manorTime":Date.now(),
			"action":0,
			"boss_time":0,
			"boss_count":0,
			"buy":0,
			"grid_1":0,
			"grid_2":0,
			"grid_3":0,
			"grid_4":0,
			"grid_5":0
		}
		for(var i in manor_type)
			info[i] = 0
		for(var i = 1;i <= 6;i++){
			info["mon_time_"+i] = 0
			info["mon_lv_"+i] = 1
		}
		info.main = 1
		self.setHMObj(uid,main_name,info)
		self.updateSprintRank("manor_rank",uid,manor_main[info.main]["score"])
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
	this.manorBuild = function(uid,bId,cb) {
		if(!manor_type[bId]){
			cb(false,"bId error "+bId)
			return
		}
		var mainLv = 0
		var buildLv = 0
		var pc = ""
		var lv = self.getLordLv(uid)
		async.waterfall([
			function(next) {
				//获取建筑等级
				self.getHMObj(uid,main_name,["main",bId],function(list) {
					mainLv = Number(list[0]) || 1
					buildLv = Number(list[1]) || 1
					if(!manor_main[buildLv+1]){
						cb(false,"已满级")
						return
					}
					if(bId == "main"){
						//主建筑
						if(lv < manor_main[mainLv]["lv"]){
							cb(false,"主公等级不足 "+lv+"/"+manor_main[mainLv]["lv"])
							return
						}
						pc = manor_main[mainLv]["main_up"]
						next()
					}else{
						//次建筑
						if(buildLv >= mainLv){
							cb(false,"主建筑等级不足 "+buildLv+"/"+mainLv)
							return
						}
						pc = manor_main[mainLv]["build_up"]
						next()
					}
				})
			},
			function(next) {
				self.consumeItems(uid,pc,1,"升级建筑:"+bId+":"+buildLv,function(flag,err) {
					if(flag){
						next()
					}else
						next(err)
				})
			},
			function(next) {
				buildLv++
				if(bId == "main"){
					local.manorMoveLevel(uid,buildLv)
					self.taskUpdate(uid,"manor_lv",1,buildLv)
				}
				self.updateSprintRank("manor_rank",uid,manor_main[mainLv]["score"])
				self.setObj(uid,main_name,bId,buildLv)
				self.setBuildLv(uid,bId,buildLv)
				cb(true,buildLv)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获取收益
	this.manorReap = function(uid,cb) {
		var output = 0
		var outadd = 1
		var value = 0
		var curTime = Date.now()
		async.waterfall([
			function(next) {
				self.getHMObj(uid,main_name,["main","fall","manorTime"],function(list) {
					mainLv = Number(list[0]) || 1
					output = manor_main[mainLv]["output"]
					var fall = Number(list[1]) || 0
					if(!fall || fall < curTime)
						outadd += manor_main[mainLv]["outadd"]
					var time = Number(list[2])
					var dt = curTime - time
					var timeRate = dt / hourTime
					if(timeRate > 16)
						timeRate = 16
					value = Math.floor(output * timeRate)
					if(dt < 10000 || value < 1){
						cb(false,"资源正在生产中")
						return
					}
					next()
				})
			},
			function(next) {
				//占领加成
				self.getHMObj(uid,main_name,["grid_1","grid_2","grid_3","grid_4","grid_5"],function(list) {
					for(var i = 0;i < list.length;i++){
						if(list[i]){
							var cityInfo = JSON.parse(list[i])
							outadd += cityInfo["outadd"]
						}
					}
					next()
				})
			},
			function(next) {
				var awardList = self.addItemStr(uid,"800:"+value,outadd,"家园获取")
				self.setObj(uid,main_name,"manorTime",curTime)
				cb(true,{awardList:awardList,time:curTime})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//放置属性建筑
	this.manorPutHero = function(uid,bId,list,cb) {
		if(!manor_type[bId] || !manor_type[bId]["ATT"]){
			cb(false,"bId error "+bId)
			return
		}
		if(!Array.isArray(list)){
			cb(false,"list error "+list)
			return
		}
		self.getObj(uid,main_name,bId,function(data) {
			if(!data){
				cb(false,"未建设")
				return
			}
			var buildLv = Number(data) || 0
			if(!buildLv || list.length > manor_main[buildLv]["hero_slot"]){
				cb(false,"槽位不足")
				return
			}
			list = JSON.stringify(list)
			self.setObj(uid,main_name,"slot_"+bId,list)
			var teamCfg = self.setBuildSlot(uid,bId,list)
			cb(true,teamCfg)
		})
	}
	//打造物品
	this.manorMakeItem = function(uid,type,index,cb) {
		async.waterfall([
			function(next) {
				//前置条件参数判断
				if(!manor_make[type] || !manor_make[type]["pc_"+index]){
					next("type error "+type)
					return
				}
				self.getObj(uid,main_name,"make_"+type,function(data) {
					if(data)
						next("正在打造中")
					else
						next()
				})
			},
			function(next) {
				//道具消耗
				self.consumeItems(uid,manor_make[type]["pc_"+index],1,"家园打造"+type,function(flag,err) {
					if(!flag)
						next(err)
					else
						next()
				})
			},
			function(next) {
				//执行操作
				var data = {}
				data.time = Date.now() + manor_make[type]["time_"+index]
				data.index = index
				self.setObj(uid,main_name,"make_"+type,JSON.stringify(data))
				cb(true,data)
			},
		],function(err) {
			cb(false,err)
		})
	}
	//收取打造物品
	this.manorGainMake = function(uid,type,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//前置条件参数判断
				if(!manor_make[type]){
					next("type error "+type)
					return
				}
				self.getObj(uid,main_name,"make_"+type,function(data) {
					if(!data)
						next("当前未打造")
					else{
						info = JSON.parse(data)
						if(info.time > Date.now())
							next("未到收取时间"+info.time+"/"+Date.now())
						else{
							self.delObj(uid,main_name,"make_"+type,function() {
								next()
							})
						}
					}
				})
			},
			function(next) {
				//执行操作
				var award
				var index = info.index
				var list = manor_make[type]["award_"+index]
				var qa = list[Math.floor(list.length * Math.random())]
				switch(type){
					case "hero":
						award = self.gainHeroByLv(uid,qa)
					break
					case "gem":
						award = self.addItemStr(uid,gem_lv[qa]["type_"+Math.floor(1 + 7 * Math.random())]+":1",1,"家园打造") 
					break
					case "fabao":
						award = self.makeFabao(uid,qa)
					break
				}
				cb(true,award)
			},
		],function(err) {
			cb(false,err)
		})
	}
	//加速打造
	this.manorMakeFinish = function(uid,type,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//前置条件参数判断
				if(!manor_make[type]){
					next("type error "+type)
					return
				}
				self.getObj(uid,main_name,"make_"+type,function(data) {
					if(!data)
						next("当前未打造")
					else{
						info = JSON.parse(data)
						next()
					}
				})
			},
			function(next) {
				//道具消耗
				var dt = info.time - Date.now()
				if(dt < 0){
					next("已打造完成")
					return
				}
				var value = Math.ceil(dt / 60000)
				self.consumeItems(uid,"800:"+value,1,"打造加速",function(flag,err) {
					if(!flag)
						next(err)
					else
						next()
				})
			},
			function(next) {
				//执行操作
				info.time = 0
				self.setObj(uid,main_name,"make_"+type,JSON.stringify(info))
				cb(true,info)
			},
		],function(err) {
			cb(false,err)
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
			var actionMax = actionBasic * hourTime
			var yzyd_1 = Number(list[1]) || 0
			var yzyd_2 = Number(list[2]) || 0
			var diff = Date.now() - action
			if(diff < hourTime){
				cb(false,"军令不足")
				return
			}
			if(diff > actionMax)
				action = Date.now() - actionMax
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
				var defTeam = self.fightContorl.getNPCTeamByType("manor_mon",manor_main[buildLv]["boss_team"],self.getLordLv(uid),"lv_4")
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					var cd = Date.now() + boss_cd
					self.setObj(uid,main_name,"boss_time",cd)
					self.incrbyObj(uid,main_name,"boss_count",1)
					bossCount++
					var awardList = self.addItemStr(uid,manor_main[buildLv]["boss_award"],rate,"家园BOSS")
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
				var defTeam = self.fightContorl.getNPCTeamByType("manor_mon",manor_main[buildLv]["mon_"+monLv],self.getLordLv(uid),"lv_2")
				var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
				if(winFlag){
					var cd = Date.now() + monCd
					var awardList = self.addItemStr(uid,manor_main[buildLv]["mon_award"+monLv],rate,"家园怪物")
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
		city_infos[land]["outadd"] = manor_citys[city_infos[land]["id"]]["outadd"]
		local.saveCity(land)
	}
	local.saveCity = function(land) {
		self.setAreaObj(main_name,"city_"+land,JSON.stringify(city_infos[land]))
	}
	//特殊地点收益
	local.gainCityAward = function(uid,land,grid) {
		//结算收益
		if(city_infos[land].own && uid == city_infos[land].own){
			grid = city_infos[land].grid
			city_infos[land].occupyTime = 0
			city_infos[land].own = 0
			city_infos[land].grid = 0
			delete city_infos[land].atkInfo
			delete city_infos[land].team
			local.saveCity(land)
		}
		if(grid)
			self.setObj(uid,main_name,"grid_"+grid,0)
	}
	//玩家城池收益
	local.gainCityUser = function(uid,cityInfo) {
		//结算收益
		var grid = cityInfo.grid
		self.setObj(uid,main_name,"grid_"+grid,0)
		self.redisDao.db.zscore("cross:manorFall",cityInfo.defInfo.uid,function(err,data) {
			if(data && data == cityInfo.endTime){
				self.redisDao.db.zadd("cross:manorFall",0,cityInfo.defInfo.uid)
			}
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
		var atkTeam = []
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
				self.getTeamByType(uid,battle_cfg["manor_city"]["team"],function(flag,teams) {
					atkTeam = teams
					next()
				})
			},
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
				//获取敌方阵容
				if(!city_infos[land]["own"]){
					//机器人队伍
					defTeam = self.fightContorl.getNPCTeamByType("manor_player",manor_citys[city_infos[land].id]["npc_team"],self.getLordLv(uid))
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
					local.manorSrandmember(targetLv,6,function(flag,data) {
						console.log("manorSrandmember",data)
						if(flag){
							list = data
							next()
						}else{
							next("找不到可用的目标")
						}
					})
				})
			},
			function(next) {
				var newList = []
				for(var i = 0;i < list.length;i++){
					if(list[i] != uid){
						newList.push(list[i])
						break
					}
				}
				if(!newList.length){
					next("找不到可用的目标")
					return
				}
				list = newList
				console.log("newList",newList)
				next()
			},
			function(next) {
				self.getPlayerBaseByUids(list,function(data) {
					console.log("userInfos",data)
					info.userInfos = data
					cb(true,info)
				})
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
		var atkTeam = []
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
				self.getTeamByType(uid,battle_cfg["manor_player"]["team"],function(flag,teams) {
					atkTeam = teams
					next()
				})
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
				//获取敌方队伍
				if(target < 10000){
					//机器人队伍
					defTeam = self.fightContorl.getNPCTeamByType("manor_player",manor_main[buildLv]["robot"],self.getLordLv(uid))
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
					local.addRecord(winFlag,atkTeam,defTeam,atkInfo,defInfo,{seededNum : seededNum})
					awardList = self.addItemStr(uid,fightAward,1,"玩家城池")
					cb(true,{winFlag:winFlag,awardList:awardList,atkTeam:atkTeam,defTeam:defTeam,seededNum:seededNum,action:action})
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
				//记录战报
				local.addRecord(winFlag,atkTeam,defTeam,atkInfo,defInfo,{seededNum : seededNum})
				next()
			},
			function(next) {
				//数据处理
				var cityInfo = {
					"type" : "user", 											//特殊地点
					"defInfo" : defInfo,    									//玩家信息
					"occupyTime" : Date.now(),  								//占领时间
					"endTime" : endTime,      									//结束时间
					"outadd" : manor_main[targetBlv]["outadd"], 				//加成比例
					"grid" : grid, 												//地块
					"team" : defTeam 											//敌方阵容
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
					local.addRecord(winFlag,atkTeam,defTeam,atkInfo,defInfo,{seededNum : seededNum},true)
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
	local.addRecord = function(winFlag,atkTeam,defTeam,atkUser,defUser,fightInfo,revolt) {
		if(revolt){
			if(atkUser.uid > 10000){
				var info = {"type":"revolt_atk",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,time : Date.now()}
				self.redisDao.db.rpush("player:user:"+atkUser.uid+":manorRecord",JSON.stringify(info),function(err,num) {
					if(num > 5){
						self.redisDao.db.ltrim("player:user:"+atkUser.uid+":manorRecord",-5,-1)
					}
				})
			}
			if(defUser.uid > 10000){
				var info = {"type":"revolt_def",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,time : Date.now()}
				self.redisDao.db.rpush("player:user:"+defUser.uid+":manorRecord",JSON.stringify(info),function(err,num) {
					if(num > 5){
						self.redisDao.db.ltrim("player:user:"+defUser.uid+":manorRecord",-5,-1)
					}
				})
			}
		}else{
			if(atkUser.uid > 10000){
				var info = {"type":"atk",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,time : Date.now()}
				self.redisDao.db.rpush("player:user:"+atkUser.uid+":manorRecord",JSON.stringify(info),function(err,num) {
					if(num > 5){
						self.redisDao.db.ltrim("player:user:"+atkUser.uid+":manorRecord",-5,-1)
					}
				})
			}
			if(defUser.uid > 10000){
				var info = {"type":"def",atkTeam:atkTeam,defTeam:defTeam,winFlag : winFlag,atkUser : atkUser,defUser : defUser,fightInfo : fightInfo,time : Date.now()}
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