//英雄系统
const async = require("async")
const summon_list = require("../../../../config/gameCfg/summon_list.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const heros = require("../../../../config/gameCfg/heros.json")
const hero_quality = require("../../../../config/gameCfg/hero_quality.json")
const species = require("../../../../config/gameCfg/species.json")
const evolves = require("../../../../config/gameCfg/evolves.json")
const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
const items = require("../../../../config/gameCfg/item.json")
const util = require("../../../../util/util.js")
const main_name = "summon"
for(var i in summon_list){
	summon_list[i]["heroMap"] = {}
	for(var j = 0;j < summon_list[i]["heros"].length;j++)
		summon_list[i]["heroMap"][summon_list[i]["heros"][j]] = 1
	summon_list[i]["items"] = JSON.parse(summon_list[i]["items"])
	summon_list[i]["summonWeighs"] = [summon_list[i]["item_w"]]
	summon_list[i]["summonHandWeighs"] = [summon_list[i]["item_w"]*0.5]
	for(var j = 1;j <= 5;j++){
		summon_list[i]["summonWeighs"].push(summon_list[i]["summonWeighs"][j-1] + summon_list[i]["hero_w"+j])
		summon_list[i]["summonHandWeighs"].push(summon_list[i]["summonHandWeighs"][j-1] + summon_list[i]["hero_w"+j])
	}
}
var model = function() {
	var self = this
	var local = {}
	//获取召唤数据
	this.getSummonData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(list) {
			cb(true,list || {})
		})
	}
	//英雄召唤-自动
	this.summonHeroNormal = function(uid,sId,count,cb) {
		async.waterfall([
			function(next) {
				//参数检测
				if(!summon_list[sId] || !Number.isInteger(count) || count < 1)
					next("参数错误")
				else
					next()
			},
			function(next) {
			  //判断背包上限
			  self.heroDao.getHeroAmount(uid,function(flag,info) {
			      if(info.cur + count > info.max){
			        next("英雄背包已满")
			      }else{
			        next()
			      }
			  })
			},
			function(next) {
				//消耗资源
				self.consumeItems(uid,summon_list[sId]["pc"],count,"英雄召唤",function(flag,err) {
					if(flag){
						next()
					}else{
						cb(false,err)
					}
				})
			},
			function(next) {
				//获取心愿英雄
				self.getObj(uid,main_name,"wish_"+sId,function(wishHeros) {
					if(wishHeros)
						wishHeros = JSON.parse(wishHeros)
					else
						wishHeros = []
					next(null,wishHeros)
				})
			},
			function(wishHeros,next) {
				//抽奖
				var list = []
				for(var i = 0;i < count;i++){
					var index = util.getWeightedRandomBySort(summon_list[sId]["summonWeighs"])
					if(index == 0){
						//道具
						list = list.concat(self.addItemStr(uid,summon_list[sId]["items"][Math.floor(summon_list[sId]["items"].length * Math.random())],1,"英雄召唤-"+sId))
					}else{
						//英雄  心愿判断
						if(wishHeros.length && Math.random() < 0.2){
							var id =wishHeros[Math.floor(Math.random() * wishHeros.length)]
							list.push({type:"hero",heroInfo:self.gainOneHero(uid,id,index)})
						}else{
							var id = summon_list[sId]["heros"][Math.floor(summon_list[sId]["heros"].length * Math.random())]
							list.push({type:"hero",heroInfo:self.gainOneHero(uid,id,index)})
						}
					}
				}
				cb(true,list)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//英雄召唤-手动
	this.summonHeroHand = function(uid,sId,heroId,cb) {
		async.waterfall([
			function(next) {
				//参数检测
				if(!summon_list[sId] || !summon_list[sId]["heroMap"][heroId])
					next("参数错误")
				else
					next()
			},
			function(next) {
			  //判断背包上限
			  self.heroDao.getHeroAmount(uid,function(flag,info) {
			      if(info.cur >= info.max){
			        next("英雄背包已满")
			      }else{
			        next()
			      }
			  })
			},
			function(next) {
				//消耗资源
				self.consumeItems(uid,summon_list[sId]["pc"],1,"英雄召唤",function(flag,err) {
					if(flag){
						next()
					}else{
						cb(false,err)
					}
				})
			},
			function(next) {1
				//抽奖
				var list = []
				var index = util.getWeightedRandomBySort(summon_list[sId]["summonHandWeighs"])
				if(index == 0){
					//道具
					list = list.concat(self.addItemStr(uid,summon_list[sId]["items"][Math.floor(summon_list[sId]["items"].length * Math.random())],1,"英雄召唤-"+sId))
				}else{
					//英雄
					list.push({type:"hero",heroInfo:self.gainOneHero(uid,heroId,index)})
				}
				cb(true,list)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获得一个英雄
	this.gainOneHero = function(uid,id,qa,cb) {
		var hId = self.getLordLastid(uid)
		var heroInfo = self.fightContorl.makeHeroData(id,qa)
		heroInfo.hId = hId
		self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
		self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo,function() {
			if(cb)
				cb(true,heroInfo)
		})
		self.cacheDao.saveCache({messagetype:"itemChange",areaId:self.areaId,uid:uid,itemId:777000000+id,value:1,curValue:qa,reason:"获得英雄-"+hId})
		return heroInfo
	}
	//设置心愿英雄
	this.setWishHero = function(uid,sId,wishHeros,cb) {
		//参数检测
		if(!Array.isArray(wishHeros) || wishHeros.length > 3){
			cb(false,"wishHeros error")
			return
		}
		for(var i = 0;i < wishHeros.length;i++){
			if(!summon_list[sId]["heroMap"][wishHeros[i]]){
				cb(false,"id error "+wishHeros[i])
				return
			}
		}
		self.setObj(uid,main_name,"wish_"+sId,JSON.stringify(wishHeros))
		cb(true)
	}
	//英雄升级
	this.heroUPLv = function(uid,hId,aimLv,cb) {
	  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
	    if(!flag){
	    	cb(false,"英雄不存在")
	      	return
	    }
	    var lv = self.getLordLv(uid)
	    var evoLv = evolve_lv[heroInfo.evo].lv || 1
	    if(aimLv <= heroInfo.lv || aimLv > evoLv || aimLv > lv + 10){
	    	cb(false,"等级限制")
	      	return
	    }
	    var strList = []
	    for(var i = heroInfo.lv;i < aimLv;i++)
	      	strList.push(lv_cfg[i].pc)
	    var pcStr = self.mergepcstr(strList)
	    self.consumeItems(uid,pcStr,1,"英雄升级",function(flag,err) {
	      	if(!flag){
		      	cb(false,err)
		        return
	      	}
	      	self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,"lv",aimLv - heroInfo.lv,function(flag,data) {
	        	cb(true,data)
	      	})
	    })
	  })
	}
	//英雄进化 已进化不能当材料
	this.heroUPEvo = function(uid,hId,hIds,cb) {
		var heroInfo
		async.waterfall([
			function(next) {
				//材料参数检测
				if(!Array.isArray(hIds)){
					next("hIds error "+hIds)
					return
				}
				hIds.push(hId)
				var hIdmap = {}
				for(var i in hIds){
					if(hIdmap[hIds[i]]){
					  	next("hId不能重复"+hIds[i])
					  	return
					}
					hIdmap[hIds[i]] = true
				}
				next()
			},
			function(next) {
				//英雄列表检测
				self.heroDao.getHeroList(uid,hIds,function(flag,herolist) {
					heroInfo = herolist.pop()
					hIds.pop()
					if(!heroInfo){
					  	next("heroInfo error "+heroInfo)
					  	return
					}
					if(!evolve_lv[heroInfo.evo+1]){
						next("进化已满")
					  	return
					}
					if(heroInfo.qa < 4){
						cb(false,"品质4以上可进化")
						return
					}
					for(var i in herolist){
					  	if(self.heroDao.heroLockCheck(herolist[i]) != false){
					  		next(self.heroDao.heroLockCheck(herolist[i]))
					    	return
					  	}
					  	if(herolist[i].evo != 1){
					  		next("英雄已进化"+herolist[i].evo)
					  		return
					  	}
					  	if(herolist[i].qa < evolve_lv[heroInfo.evo]["min_qa"]){
					  		next("材料品质不足"+herolist[i].qa)
					  		return
					  	}
					}
				    self.heroDao.removeHeroList(self.areaId,uid,hIds,function(flag,err) {
				      if(flag){
				        self.heroDao.heroPrlvadnad(self.areaId,uid,herolist,hIds,function(flag,awardList) {
				          next(null,herolist,awardList)
				        },"英雄进化")
				      }else{
				        next("error "+err)
				      }
				    })
				})
			},
			function(herolist,awardList,next) {
				var rate = self.fightContorl.getHeroEvoRate(heroInfo,herolist)
				if(Math.random() < rate){
					heroInfo.evo++
					heroInfo.evoRate = 0
					self.heroDao.onlySetHeroInfo(uid,hId,"evoRate",0)
		            self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,"evo",1)
		            cb(true,{heroInfo:heroInfo,awardList:awardList})
				}else{
					heroInfo.evoRate = Number((rate*0.1).toFixed(2)) || 0
		            self.heroDao.onlySetHeroInfo(uid,hId,"evoRate",heroInfo.evoRate)
		            cb(true,{heroInfo:heroInfo,awardList:awardList})
				}
			}
		],function(err) {
			cb(false,err)
		})
	}
	//英雄晋升 受主角等级限制
	this.heroUPExalt = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			if(evolve_lv[heroInfo.evo+1]){
				cb(false,"未满进化")
				return
			}
			if(!exalt_lv[heroInfo.exalt+1]){
				cb(false,"晋升已满")
				return
			}
			var lv = self.getLordLv(uid)
			if(lv < exalt_lv[heroInfo.exalt+1]["limit"]){
				cb(false,"等级不足")
				return
			}
			self.consumeItems(uid,exalt_lv[heroInfo.exalt]["pc"],1,"英雄晋升",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				heroInfo.exalt++
	            self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,"exalt",1,function(flag,data) {
	              cb(true,{heroInfo:heroInfo})
	            })
			})
		})
	}
	//英雄重置 仅返还等级经验
	this.heroReset = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			var lv = heroInfo.lv
			if(lv <= 1 || !lv_cfg[lv].pr){
				cb(false,"未升级")
				return
			}
			self.heroDao.setHeroInfo(self.areaId,uid,hId,"lv",1,function(flag) {
				var awardList = self.addItemStr(uid,ilv_cfg[lv].pr,1,"英雄重置")
				cb(true,awardList)
			})
		})
	}
	//英雄分解
	this.heroRecycle = function(uid,hIds,cb) {
		if(!hIds || !Array.isArray(hIds) || !hIds.length){
			cb(false,"hIds error "+hIds)
			return
		}
		var hIdmap = {}
		for(var i = 0;i < hIds.length;i++){
			if(hIdmap[hIds[i]]){
			  	cb(false,"hId不能重复")
			  	return
			}
			hIdmap[hIds[i]] = true
		}
		self.heroDao.getHeroList(uid,hIds,function(flag,list) {
			for(var i = 0;i < list.length;i++){
			 	if(self.heroDao.heroLockCheck(list[i])){
			 		cb(false,"hIds error "+hIds[i])
			 		return
			 	}
			 	var info = self.fightContorl.getHeroRecycle(list)
			    self.heroDao.removeHeroList(self.areaId,uid,hIds,function(flag,err) {
			    	if(!flag){
			    		cb(false,err)
			    		return
			    	}
					var awardList = self.addItemStr(uid,info.awardStr,1,"英雄分解")
					for(var j = 0;j < info.awards.length;j++)
						awardList.push(self.addItemByType(uid,info.awards[i]))
					cb(true,awardList)
			    })
			}
		})
	}
	//英雄洗练 
	this.heroWash = function(uid,hId,item,cb) {
		if(item && item != 2000050){
			cb(false,"item error "+item)
			return
		}
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo){
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			if(evolve_lv[heroInfo.evo]["evolveLv"] >= 3){
				cb(false,"进化为觉醒体后方可洗练")
				return
			}
			var exalt = heros[heroInfo.id]["exalt"]
			var rate = 1
			if(heroInfo.qa >= 5)
				rate = 2
			var pc = "2000030:"+(exalt_lv[exalt]["wash_pc"]*rate)
			if(item)
				pc += "&2000050:1"
			self.consumeItems(uid,pc,1,"英雄洗练",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				heroInfo = local.washHero(heroInfo,item)
	            self.heroDao.onlySetHeroInfo(uid,hId,"wash",heroInfo.wash)
				self.heroDao.onlySetHeroInfo(uid,hId,"save",heroInfo.save)
	            cb(true,{heroInfo:heroInfo})
			})
		})
	}
	//洗练保存
	this.heroWashSave = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo){
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			if(!heroInfo.save){
				cb(false,"没有可保存的洗练")
				return
			}
			var info = JSON.parse(heroInfo.save)
			for(var i = 0;i < 10;i++){
				delete heroInfo["PS"+i]
				self.heroDao.onlyDelHeroInfo(uid,hId,"PS"+i)
			}
			for(var i in info){
				heroInfo[i] = info[i]
				self.heroDao.onlySetHeroInfo(uid,hId,i,heroInfo[i])
			}
			delete heroInfo.save
			self.heroDao.delHeroInfo(self.areaId,uid,hId,"save")
			cb(true,heroInfo)
		})
	}
	//英雄打书
	this.heroPS = function(uid,hId,itemId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo){
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			if(evolve_lv[heroInfo.evo]["evolveLv"] >= 4){
				cb(false,"进化为完全体后方可打书")
				return
			}
			if(!items[itemId] || items[itemId]["useType"] != "pcskill"){
				cb(false,"道具类型错误")
				return
			}
			self.consumeItems(uid,itemId+":1",1,"英雄打书",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				var index = local.getPSIndex(heroInfo)
				heroInfo["PS"+index] = items[itemId]["arg"]
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"PS"+index,heroInfo["PS"+index])
				cb(true,{heroInfo:heroInfo,index:index})
			})
		})
	}
	//英雄洗练 洗练增加通灵值，通灵值满一百必出满技能，出满技能后通灵值重置
	local.washHero = function(heroInfo,item) {
		heroInfo.wash += exalt_lv[heros[heroInfo.id]["exalt"]]["wash_value"]
		var c_info = self.fightContorl.createHero(heroInfo.id,heroInfo.qa,heroInfo.wash,item)
		heroInfo.wash = c_info.wash
		delete c_info.wash
		heroInfo.save = JSON.stringify(c_info)
		return heroInfo
	}
	//英雄打书
	local.makeHeroPS = function(heroInfo,sId) {
		var index = local.getPSIndex(heroInfo)
		heroInfo["PS"+index] = sId
		return heroInfo
	}
	//获取打书位置
	local.getPSIndex = function(heroInfo) {
		var list = []
		for(var i = 0;i < 10;i++){
			if(heroInfo["PS"+i])
				list.push(i)
		}
		var index = list[Math.floor(list.length*Math.random())]
		return index
	}
}
module.exports = model