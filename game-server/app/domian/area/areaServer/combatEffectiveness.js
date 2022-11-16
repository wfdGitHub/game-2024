//战力
const async = require("async")
const book_list = require("../../../../config/gameCfg/book_list.json")
const book_lv = require("../../../../config/gameCfg/book_lv.json")
const book_star = require("../../../../config/gameCfg/book_star.json")
const book_slot = require("../../../../config/gameCfg/book_slot.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const power_base = require("../../../../config/gameCfg/power_base.json")
const power_lv = require("../../../../config/gameCfg/power_lv.json")
const power_ad = require("../../../../config/gameCfg/power_ad.json")
const power_star = require("../../../../config/gameCfg/power_star.json")
const power_aptitude = require("../../../../config/gameCfg/power_aptitude.json")
const power_slot = require("../../../../config/gameCfg/power_slot.json")
const beauty_base = require("../../../../config/gameCfg/beauty_base.json")
const beauty_ad = require("../../../../config/gameCfg/beauty_ad.json")
const beauty_star = require("../../../../config/gameCfg/beauty_star.json")
const lord_lv = require("../../../../config/gameCfg/lord_lv.json")
const main_name = "CE"
const oneDayTime = 86400000
var bookMap = {}
for(var i in book_list){
	book_list[i].id = i
	bookMap[book_list[i]["type"]] = book_list[i]
}
//消耗倍率
var powerRates = {}
for(var i in power_base)
	powerRates[i] = power_aptitude[power_base[i]["aptitude"]]["upRate"]
for(var i in beauty_base)
	powerRates[i] = power_aptitude[beauty_base[i]["aptitude"]]["upRate"]
module.exports = function() {
	var self = this
	var local = {}
	var userTeams = {}            //玩家阵容
	var usersCes = {} 			  //玩家战力
	var userTeamMaps = {}  		  //玩家上阵英雄
	var userCoexistMaps = {}      //玩家共鸣英雄
	var userCoexistLength = {}    //玩家共鸣英雄长度
	//加载角色阵容数据
	this.CELoad = function(uid,cb) {
		async.waterfall([
			function(next) {
				//共鸣英雄列表
				self.getObjAll(uid,"coexistMap",function(data) {
					userCoexistMaps[uid] = data || {}
					userCoexistLength[uid] = Object.keys(userCoexistMaps[uid]).length
					next()
				})
			},
			function(next) {
				//玩家阵容
				self.heroDao.getFightTeam(uid,function(flag,data) {
					if(flag && data){
						userTeams[uid] = data
						userTeamMaps[uid] = {}
						for(var i = 0;i < data.length;i++){
							if(data[i])
								userTeamMaps[uid][data[i].hId] = i
						}
						self.updateCE(uid)
					}
					if(cb)
						cb(flag)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//移除角色阵容数据
	this.CEUnload = function(uid) {
		delete userTeams[uid]
		delete usersCes[uid]
		delete userTeamMaps[uid]
		delete userCoexistMaps[uid]
		delete userCoexistLength[uid]
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
	//判断共鸣属性
	this.checkCoexistMap = function(uid,hId,lv) {
		if(userCoexistMaps[uid] && userTeams[uid]){
			// console.log("userCoexistMaps",userCoexistMaps[uid],lv,userTeams[uid][6]["coexist"])
			if(userCoexistMaps[uid][hId]){
				//共鸣英雄
				// console.log("1111111")
				userCoexistMaps[uid][hId] = lv
				self.setObj(uid,"coexistMap",hId,lv)
				local.calCoexistLv(uid)
			}else if(userCoexistLength[uid] < 6){
				// console.log("22222222")
				local.addCoexistHero(uid,hId,lv)
				local.calCoexistLv(uid)
			}else if(userTeams[uid] && lv > userTeams[uid][6]["coexist"]){
				// console.log("3333333333")
				//非共鸣英雄等级足够
				var min = -1
				var minId = ""
				for(var i in userCoexistMaps[uid]){
					if(min == -1 || userCoexistMaps[uid][i] < min){
						min = userCoexistMaps[uid][i]
						minId = i
					}
				}
				if(minId && userCoexistMaps[uid][minId] < lv){
					local.delCoexistHero(uid,minId)
					local.addCoexistHero(uid,hId,lv)
					local.calCoexistLv(uid)
				}
			}
		}
	}
	//移除英雄判断重构
	this.removeCheckCoexist = function(uid,hIds) {
		if(userCoexistMaps[uid]){
			for(var i = 0;i < hIds.length;i++){
				if(userCoexistMaps[uid][hIds[i]]){
					local.resetCoexistHero(uid)
					return
				}
			}
		}
	}
	//重构共鸣英雄
	local.resetCoexistHero = function(uid) {
		// console.log("重构共鸣英雄",uid)
		var minLv = 0
		var list = []
		self.heroDao.getHeros(uid,function(flag,data) {
			if(flag){
				for(var i in data){
					if(!data[i]["coexist"] && (list.length < 6 || data[i]["lv"] > minLv)){
						data[i]["hId"] = i
						list.push(data[i])
						list.sort(function(a,b) {
							return a.lv > b.lv ? -1 : 1
						})
						list = list.slice(0,6)
						minLv = list[list.length - 1]["lv"]
					}
				}
				userTeams[uid][6]["coexist"] = minLv
				self.setObj(uid,"playerInfo","coexist",minLv)
				// console.log("重构共鸣英雄",list)
				var maps = {}
				for(var i = 0;i < list.length;i++)
					maps[list[i]["hId"]] = list[i]["lv"]
				// console.log("maps",maps)
				userCoexistMaps[uid] = maps
				userCoexistLength[uid] = Object.keys(userCoexistMaps[uid]).length
				// console.log("最终数据",userCoexistMaps[uid],userCoexistLength[uid],userTeams[uid][6]["coexist"])
				self.delObjAll(uid,"coexistMap")
				self.setHMObj(uid,"coexistMap",maps)
				local.updateCoexistNotify(uid)
			}
		})
		// console.log("userCoexistMaps",userCoexistMaps[uid])
	}
	//添加共鸣英雄
	local.addCoexistHero = function(uid,hId,lv) {
		// console.log("添加共鸣英雄")
		self.setObj(uid,"coexistMap",hId,lv)
		if(userCoexistMaps[uid]){
			userCoexistMaps[uid][hId] = lv
			userCoexistLength[uid] = Object.keys(userCoexistMaps[uid]).length
		}
		// console.log("userCoexistMaps",userCoexistMaps[uid])
	}
	//移除共鸣英雄
	local.delCoexistHero = function(uid,hId) {
		// console.log("移除共鸣英雄")
		self.delObj(uid,"coexistMap",hId)
		if(userCoexistMaps[uid]){
			delete userCoexistMaps[uid][hId]
			userCoexistLength[uid] = Object.keys(userCoexistMaps[uid]).length
		}
		// console.log("userCoexistMaps",userCoexistMaps[uid])
	}
	//计算共鸣属性
	local.calCoexistLv = function(uid) {
		// console.log("计算共鸣属性")
		if(userCoexistMaps[uid] && userTeams[uid]){
			var min = 9999
			for(var i in userCoexistMaps[uid]){
				if(userCoexistMaps[uid][i] < min){
					min = userCoexistMaps[uid][i]
				}
			}
			if(min != userTeams[uid][6]["coexist"]){
				userTeams[uid][6]["coexist"] = min
				self.setObj(uid,"playerInfo","coexist",min)
			}
			local.updateCoexistNotify(uid)
		}
		// console.log("userCoexistMaps",userCoexistMaps[uid])
	}
	//通知共鸣数据更新
	local.updateCoexistNotify = function(uid) {
		if(userCoexistMaps[uid] && userTeams[uid]){
			var notify = {
				type : "coexist",
				coexistMaps : userCoexistMaps[uid],
				coexist : userTeams[uid][6]["coexist"]
			}
			self.sendToUser(uid,notify)
		}
	}
	//获取共鸣英雄数据
	this.getCoexistData = function(uid,cb) {
		self.getObjAll(uid,"coexistList",function(coexistList) {
			var info = {}
			info.coexistList = coexistList || {}
			info.coexistMaps = userCoexistMaps[uid]
			cb(true,info)
		})
	}
	//放置共鸣英雄
	this.setCoexistHero = function(uid,hId,index,cb) {
		async.waterfall([
			function(next) {
				if(userCoexistMaps[uid] && userCoexistMaps[uid][hId])
					next("不能为供奉英雄")
				else
					next()
			},
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
				    if(!flag){
				      	next("英雄不存在")
				    }else{
				    	if(heroInfo["coexist"]){
				    		next("该英雄已共鸣")
				    		return
				    	}
				    	next()
				    }
				})
			},
			function(next) {
				//index判断
				if(!Number.isInteger(index) || index < 1){
					next("index error "+index)
					return
				}
				var lv = self.getLordLv(uid)
				if(lv < lord_lv[lv]["coexistSlot"]){
					next("主公等级限制 "+lv+"/"+lord_lv[lv]["coexistSlot"])
					return
				}
				self.getHMObj(uid,"coexistList",["slot_"+index,"time_"+index],function(list) {
					if(list[0]){
						next("该槽位已有英雄")
						return
					}
					if(list[1] && Date.now() < Number(list[1])){
						next("槽位冷却中")
						return
					}
					next()
				})
			},
			function(next) {
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"coexist",1)
				self.setObj(uid,"coexistList","slot_"+index,hId)
				cb(true)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//取出共鸣英雄
	this.cleanCoexistHero = function(uid,hId,index,cb) {
		var heroInfo = {}
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
				    if(!flag){
				      	next("英雄不存在")
				    }else{
				    	heroInfo = data
				    	if(!heroInfo["coexist"]){
				    		next("该英雄未共鸣")
				    		return
				    	}
				    	next()
				    }
				})
			},
			function(next) {
				//index判断
				if(!Number.isInteger(index) || index < 1){
					next("index error "+index)
					return
				}
				self.getObj(uid,"coexistList","slot_"+index,function(data) {
					if(!data){
						next("该槽位没有英雄")
						return
					}
					if(data != hId){
						next("hId error "+data)
						return
					}
					next()
				})
			},
			function(next) {
				var time = Date.now()+oneDayTime
				self.heroDao.delHeroInfo(self.areaId,uid,hId,"coexist")
				self.delObj(uid,"coexistList","slot_"+index)
				self.setObj(uid,"coexistList","time_"+index,time)
				self.checkCoexistMap(uid,hId,heroInfo.lv)
				cb(true,time)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//改变战力
	this.incrbyCE = function(uid,name,oldValue,newValue) {
		var ce = self.fightContorl.calcCEDiff(name,oldValue,newValue)
		if(usersCes[uid] && ce){
			var oldCE = usersCes[uid]
			usersCes[uid] += ce
			let notify = {
				type : "updateCE",
				oldCE : oldCE,
				newCE : usersCes[uid]
			}
			self.sendToUser(uid,notify)
			self.taskUpdate(uid,"totalCe",usersCes[uid])
			self.addZset("ce_rank",uid,usersCes[uid])
			self.playerDao.setPlayerInfo({uid:uid,key:"CE",value:usersCes[uid]})
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
	//获取阵容
	this.getUserTeam = function(uid) {
		return JSON.parse(JSON.stringify(userTeams[uid]))
	}
	//获取上阵英雄数量
	this.getTeamNum = function(uid) {
		var count = 0
		if(userTeamMaps[uid])
			for(var i in userTeamMaps[uid])
				count++
		return count
	}
	//获取天书数据
	this.getBookData = function(uid,cb) {
		this.getObjAll(uid,"book",function(data) {
			if(!data)
				data = {}
			for(var i in data){
				data[i] = Number(data[i])
			}
			cb(true,data)
		})
	}
	//获取上阵天书
	this.getFightBook = function(uid,cb) {
		self.getObjAll(uid,"book_fight",function(data) {
			cb(true,data)
		})
	}
	//升级技能属性
	this.incrbyGuildCareerSkill = function(uid,career) {
		self.incrbyObj(uid,"guild","skill_"+career,1)
		if(userTeams[uid] && userTeams[uid][6] && userTeams[uid][6]["g"+career] !== undefined){
			userTeams[uid][6]["g"+career] ++
			this.updateCE(uid)
		}
	}
	//设置天书属性
	this.setBookInfo = function(uid,bookType,name,value) {
		self.setObj(uid,"book",bookType+"_"+name,value)
		if(userTeams[uid] && userTeams[uid][6] && userTeams[uid][6][bookType]){
			userTeams[uid][6][bookType][name] = value
			this.updateCE(uid)
		}
	}
	//更改称号
	this.setTitle = function(uid,title) {
		if(userTeams[uid] && userTeams[uid][6]){
			userTeams[uid][6]["title"] = title
			this.updateCE(uid)
		}
	}
	//更改官职
	this.setOfficer = function(uid,officer) {
		if(userTeams[uid] && userTeams[uid][6]){
			userTeams[uid][6]["officer"] = officer
			this.updateCE(uid)
		}
	}
	//更新图鉴值
	this.setGather = function(uid,gather) {
		if(userTeams[uid] && userTeams[uid][6]){
			userTeams[uid][6]["gather"] = gather
			this.updateCE(uid)
		}
	}
	//更新建筑等级
	this.setBuildLv = function(uid,bId,lv) {
		if(userTeams[uid] && userTeams[uid][6]){
			userTeams[uid][6][bId] = lv
			this.updateCE(uid)
		}
	}
	//更新阵营加成
	this.setCampAtt = function(uid,camp,value) {
		if(userTeams[uid] && userTeams[uid][6]){
			userTeams[uid][6]["camp_"+camp] = value
			this.updateCE(uid)
		}
	}
	//激活天书
	this.activateBook = function(uid,bookType,cb) {
		if(!bookMap[bookType]){
			cb(false,"天书不存在")
			return
		}
		self.getObj(uid,"book",bookType+"_lv",function(data) {
			if(data){
				cb(false,"已激活")
			}else{
				self.consumeItems(uid,bookMap[bookType].id+":"+10,1,"激活天书"+bookType,function(flag,err) {
					if(!flag){
						cb(false,err)
					}else{
						self.setBookInfo(uid,bookType,"lv",1)
						self.setBookInfo(uid,bookType,"star",0)
						cb(true)
					}
				})
			}
		})
	}
	//升级天书
	this.upgradeBookLv = function(uid,bookType,cb) {
		self.getHMObj(uid,"book",[bookType+"_lv",bookType+"_star"],function(list) {
			var lv = list[0]
			var star = list[1]
			if(!lv){
				cb(false,"未激活")
				return
			}
			lv = Number(lv)
			if(!book_lv[lv] || !book_lv[lv]["pc"]){
				cb(false,"不可升级")
				return
			}
			if(lv >= book_star[star]["maxLv"]){
				cb(false,"等级上限")
				return
			}
			self.consumeItems(uid,book_lv[lv]["pc"],1,"升级天书"+bookType,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					lv += 1
					self.setBookInfo(uid,bookType,"lv",lv)
					cb(true,lv)
				}
			})
		})
	}
	//升星天书
	this.upgradeBookStar = function(uid,bookType,cb) {
		self.getObj(uid,"book",bookType+"_star",function(star) {
			if(star == undefined){
				cb(false,"未激活")
				return
			}
			star = Number(star)
			if(!book_star[star] || !book_star[star]["item"]){
				cb(false,"不可升星")
				return
			}
			var str = bookMap[bookType]["id"]+":"+book_star[star]["bookChip"]+"&"+"1000400:"+book_star[star]["item"]
			self.consumeItems(uid,str,1,"升星天书"+bookType,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					star += 1
					self.setBookInfo(uid,bookType,"star",star)
					cb(true,star)
				}
			})
		})
	}
	//重生天书
	this.resetBook = function(uid,bookType,cb) {
		self.getObj(uid,"book",bookType+"_lv",function(lv) {
			if(!lv){
				cb(false,"未激活")
				return
			}
			lv = Number(lv)
			if(lv == 1){
				cb(false,"1级天书不可重生")
				return
			}
			self.consumeItems(uid,default_cfg["default_pc_2"]["value"],1,"重生天书"+bookType,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					var awardList = self.addItemStr(uid,book_lv[lv]["pr"],1,"重生天书"+bookType)
					self.setBookInfo(uid,bookType,"lv",1)
					cb(true,awardList)
				}
			})
		})
	}
	//设置上阵天书
	this.setBookFight = function(uid,list,cb) {
		if(!Array.isArray(list)){
			cb(false,"参数错误")
			return
		}
		var length = list.length
		if(length == 0){
			self.delObjAll(uid,"book_fight",function() {
				self.CELoad(uid)
			})
			cb(true)
		}else{
			var map = {}
			for(var i = 0;i < list.length;i++){
				if(list[i]){
					if(map[list[i]]){
						cb(false,"天书重复")
						return
					}
					map[list[i]] = true
				}
			}
			if(!book_slot[length] || self.getLordLv(uid) < book_slot[length]["lv"]){
				cb(false,"开启等级不足")
				return
			}
			self.getObjAll(uid,"book",function(data) {
				var obj = {}
				for(var i = 0;i < list.length;i++){
					if(list[i] && !data[list[i]+"_lv"]){
						cb(false,list[i]+"未激活")
						return
					}
					obj[i] = list[i]
				}
				self.setHMObj(uid,"book_fight",obj,function() {
					self.CELoad(uid)
				})
				cb(true)
			})
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
		if(userTeams[uid] && userTeams[uid][6]){
			for(var i = 0;i <= 4;i++){
				if(userTeams[uid][6]["power"+i] && userTeams[uid][6]["power"+i]["id"] == powerId){
					userTeams[uid][6]["power"+i][name] = value
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
		userTeams[uid][6]["manualModel"] = type
		self.setObj(uid,"power","manualModel",type,function(){})
		cb(true)
	}
	//获取红颜技能数据
	this.getBeautyData = function(uid,cb) {
		this.getObjAll(uid,"beaut",function(data) {
			cb(true,data)
		})
	}
	//获取红颜属性
	this.getBeautyInfo = function(uid,beautId) {
		if(userTeams[uid] && userTeams[uid][6] && userTeams[uid][6]["beaut_"+beautId])
			return userTeams[uid][6]["beaut_"+beautId]
		else
			return false
	}
	//增加红颜属性
	this.incrbyBeautInfo = function(uid,beautId,name,value) {
		if(name && value){
			self.incrbyObj(uid,"beaut",beautId+"_"+name,value)
			if(userTeams[uid] && userTeams[uid][6]){
				if(!userTeams[uid][6]["beaut_"+beautId])
					userTeams[uid][6]["beaut_"+beautId] = {}
				if(!userTeams[uid][6]["beaut_"+beautId][name])
					userTeams[uid][6]["beaut_"+beautId][name] = 0
				userTeams[uid][6]["beaut_"+beautId][name] += value
			}
		}
	}
	//设置红颜属性
	this.setBeautInfo = function(uid,beautId,name,value) {
		self.setObj(uid,"beaut",beautId+"_"+name,value)
		if(userTeams[uid] && userTeams[uid][6]){
			if(!userTeams[uid][6]["beaut_"+beautId])
				userTeams[uid][6]["beaut_"+beautId] = {}
			userTeams[uid][6]["beaut_"+beautId][name] = value
		}
	}
	//红颜技能升星
	this.upBeautStar = function(uid,beautId,cb) {
		if(!beauty_base[beautId]){
			cb(false,"beautId not find "+beautId)
			return
		}
		var rate = powerRates[beautId]
		var item = beauty_base[beautId]["item"]
		self.getHMObj(uid,"beaut",[beautId+"_star",beautId+"_opinion"],function(list) {
			var star = Number(list[0]) || 0
			var opinion = Number(list[1]) || 0
			star++
			if(!beauty_star[star]){
				cb(false,"不可升星")
				return
			}
			if(star > 1 && opinion < beauty_ad[beauty_star[star]["opinion"]]["opinion_value"]){
				cb(false,"好感度不足")
				return
			}
			var str = item+":"+beauty_star[star]["itemValue"]
			self.consumeItems(uid,str,rate,"红颜技能升星"+beautId,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					self.setBeautInfo(uid,beautId,"star",star)
					if(star == 1){
						self.setBeautInfo(uid,beautId,"ad",1)
						self.setBeautInfo(uid,beautId,"att1",0)
						self.setBeautInfo(uid,beautId,"att2",0)
						self.setBeautInfo(uid,beautId,"att3",0)
						self.setBeautInfo(uid,beautId,"att4",0)
						self.setBeautInfo(uid,beautId,"opinion",0)
						self.taskUpdate(uid,"beauty_num",1)
					}
					self.updateCE(uid)
					var beautInfo = self.getBeautyInfo(uid,beautId)
					cb(true,beautInfo)
				}
			})
		})
	}
	//红颜技能升阶
	this.upBeautAd = function(uid,beautId,cb) {
		if(!beauty_base[beautId]){
			cb(false,"beautId not find "+beautId)
			return
		}
		var rate = powerRates[beautId]
		self.getHMObj(uid,"beaut",[beautId+"_ad",beautId+"_att1",beautId+"_att2",beautId+"_att3",beautId+"_att4",beautId+"_opinion"],function(list) {
			var ad = Number(list[0]) || 1
			var att1 = Number(list[1]) || 0
			var att2 = Number(list[2]) || 0
			var att3 = Number(list[3]) || 0
			var att4 = Number(list[4]) || 0
			var opinion = Number(list[5]) || 0
			if(att1 < beauty_ad[ad]["att"] || att2 < beauty_ad[ad]["att"] || att3 < beauty_ad[ad]["att"] || att4 < beauty_ad[ad]["att"]){
				cb(false,"属性未满")
				return
			}
			if(opinion < beauty_ad[ad]["opinion_value"]){
				cb(false,"好感度不足")
				return
			}
			ad++
			self.setBeautInfo(uid,beautId,"ad",ad)
			self.updateCE(uid)
			var beautInfo = self.getBeautyInfo(uid,beautId)
			cb(true,beautInfo)
		})
	}
	//设置红颜技能
	this.setBeautFight = function(uid,beautId,cb) {
		if(!beauty_base[beautId]){
			cb(false,"技能不存在"+beautId)
			return
		}
		self.getObj(uid,"beaut",beautId+"_star",function(data) {
			if(!data){
				cb(false,"未激活")
				return
			}
			self.setObj(uid,"beaut","bcombat",beautId)
			cb(true)
		})
	}
}