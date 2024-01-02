//英雄系统
const async = require("async")
const uuid = require("uuid")
const summon_list = require("../../../../config/gameCfg/summon_list.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const heros = require("../../../../config/gameCfg/heros.json")
const hero_quality = require("../../../../config/gameCfg/hero_quality.json")
const species = require("../../../../config/gameCfg/species.json")
const evolves = require("../../../../config/gameCfg/evolves.json")
const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
const items = require("../../../../config/gameCfg/item.json")
const mythical = require("../../../../config/gameCfg/mythical.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const util = require("../../../../util/util.js")
const main_name = "summon"
for(var i in summon_list){
	summon_list[i]["heroMap"] = {}
	for(var j = 0;j < summon_list[i]["heros"].length;j++)
		summon_list[i]["heroMap"][summon_list[i]["heros"][j]] = 1
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
				var score = summon_list[sId]["score"] * count
				self.taskUpdate(uid,"buzhuo_score",score)
				self.updateSprintRank("buzhuo_rank",uid,score)
				self.taskUpdate(uid,"recruit",count)
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
			function(next) {
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
				var score = summon_list[sId]["score"]
				self.taskUpdate(uid,"buzhuo_score",score)
				self.updateSprintRank("buzhuo_rank",uid,score)
				self.taskUpdate(uid,"recruit",1)
				cb(true,list)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获得一个英雄
	this.gainOneHero = function(uid,id,qa,cb) {
        var heroInfo = self.fightContorl.makeHeroData(id,qa)
        return this.addPlayerHero(uid,heroInfo,cb)
	}
	this.addPlayerHero = function(uid,heroInfo,cb) {
		var hId = self.getLordLastid(uid)
		heroInfo.hId = hId
		self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
		self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo,function() {
			if(cb)
				cb(true,heroInfo)
		})
		self.taskUpdate(uid,"hero",1,heroInfo.qa)
		self.mysqlDao.addHeroLog({uid:uid,name:heros[heroInfo.id]["name"],id:hId,info:heroInfo,reason:"获得英雄"})
		return heroInfo
	}
	//根据携带等级获取英雄
	this.gainHeroByLv = function(uid,qa,cb) {
		var hId = self.getLordLastid(uid)
		var lv = self.getLordLv(uid)
		var heroInfo = self.fightContorl.makeHeroByLv(lv,qa)
		heroInfo.hId = hId
		self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
		self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo,function() {
			if(cb)
				cb(true,heroInfo)
		})
		self.taskUpdate(uid,"hero",1,qa)
		self.mysqlDao.addHeroLog({uid:uid,name:heros[heroInfo.id]["name"],id:hId,info:heroInfo,reason:"获得英雄"})
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
	//兑换神兽
	this.gainMythical = function(uid,id,cb) {
		if(!heros[id]){
			cb(false,"id error")
			return
		}
		var type = heros[id]["type"]
		if(type != 1 && type != 2){
			cb(false,"非神兽珍兽")
			return
		}
		var exaltId = heros[id]["exalt"]
		self.consumeItems(uid,mythical[type]["exalt_"+exaltId],1,"兑换神兽",function(flag,err) {
			if(!flag){
				cb(false,err)
				return
			}
			var hId = self.getLordLastid(uid)
			var heroInfo = self.fightContorl.makeFullHeroData(id)
			heroInfo.hId = hId
			self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
			self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo,function() {
				if(cb)
					cb(true,heroInfo)
			})
			self.mysqlDao.addHeroLog({uid:uid,name:heros[heroInfo.id]["name"],id:hId,info:heroInfo,reason:"获得英雄"})
			return heroInfo
		})
	}
	//神兽进化
	this.mythicalUPEvo = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			if(!evolve_lv[heroInfo.evo+1]){
				cb(false,"进化已满")
			  	return
			}
			var type = heros[heroInfo.id]["type"]
			if(type != 1 && type != 2){
				cb(false,"非神兽珍兽")
				return
			}
			var pc = evolve_lv[heroInfo.evo]["type_"+type]
			self.consumeItems(uid,pc,1,"神兽进化",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				heroInfo.evo++
				self.taskUpdate(uid,"pokemon_evolve",1)
				self.taskUpdate(uid,"pokemon_evolveLv",1,heroInfo.evo)
	            self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,"evo",1)
	            cb(true,{heroInfo:heroInfo})
			})
		})
	}
	//神兽晋升
	this.mythicalUPExalt = function(uid,hId,cb) {
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
			var type = heros[heroInfo.id]["type"]
			if(type != 1 && type != 2){
				cb(false,"非神兽珍兽")
				return
			}
			var lv = self.getLordLv(uid)
			if(lv < exalt_lv[heroInfo.exalt+1]["limit"]){
				cb(false,"等级不足")
				return
			}
			self.consumeItems(uid,exalt_lv[heroInfo.exalt]["type_"+type],1,"英雄晋升",function(flag,err) {
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
	//神兽内丹
	this.mythicalPS = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			if(evolve_lv[heroInfo.evo+1]){
				cb(false,"未满进化")
				return
			}
			var type = heros[heroInfo.id]["type"]
			if(type != 1 && type != 2){
				cb(false,"非神兽珍兽")
				return
			}
			if(heroInfo.m_ps){
				cb(false,"已获取内丹")
				return
			}
			if(heroInfo.exalt < mythical[type]["ps_exalt"]){
				cb(false,"晋升等级不满足")
				return
			}
			self.consumeItems(uid,mythical[type]["ps_pc"],1,"神兽内丹",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				heroInfo.m_ps = 1
	            self.heroDao.setHeroInfo(self.areaId,uid,hId,"m_ps",1,function(flag,data) {
	              cb(true,{heroInfo:heroInfo})
	            })
			})
		})
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
				self.taskUpdate(uid,"heroLv",1,aimLv)
				if(self.players[uid] && self.players[uid]["heroLv"] < aimLv)
					self.chageLordData(uid,"heroLv",aimLv)
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
					if(heros[heroInfo.id]["type"] != 0){
						cb(false,"神兽珍兽用专属接口")
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
				        var awards = self.fightContorl.getHeroPrlvadnad(herolist)
			        	var awardList = []
						for(var j = 0;j < awards.length;j++)
							awardList.push(self.addItemByType(uid,awards[i]))
			          	next(null,herolist,awardList)
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
		            self.taskUpdate(uid,"pokemon_evolve",1)
		            self.taskUpdate(uid,"pokemon_evolveLv",1,heroInfo.evo)
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
			if(heros[heroInfo.id]["type"] != 0){
				cb(false,"神兽珍兽用专属接口")
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
				var awardList = self.addItemStr(uid,lv_cfg[lv].pr,1,"英雄重置")
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
				if(heros[list[i].id]["type"] != 0){
					cb(false,"神兽珍兽不可分解")
					return
				}
			}
			for(var i = 0;i < list.length;i++)
				self.mysqlDao.addHeroLog({uid:uid,name:heros[list[i].id]["name"],id:list[i].hId,info:list[i],reason:"分解英雄"})
			var info = self.fightContorl.getHeroRecycle(list)
		    self.heroDao.removeHeroList(self.areaId,uid,hIds,function(flag,err) {
		    	if(!flag){
		    		cb(false,err)
		    		return
		    	}
				var awardList = self.addItemStr(uid,info.awardStr,1,"英雄分解")
				for(var j = 0;j < info.awards.length;j++)
					awardList.push(self.addItemByType(uid,info.awards[j]))
				cb(true,awardList)
		    })
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
			if(heroInfo.qa < 4){
				cb(false,"传说以上品质可洗练")
				return
			}
			if(heros[heroInfo.id]["type"] != 0){
				cb(false,"神兽珍兽不可洗练")
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
			if(heroInfo.qa != info.qa)
				self.taskUpdate(uid,"hero",1,info.qa)
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
			self.mysqlDao.addHeroLog({uid:uid,name:heros[heroInfo.id]["name"],id:hId,info:heroInfo,reason:"洗练英雄"})
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
			if(heroInfo.qa < 4){
				cb(false,"传说以上品质可打书")
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
	//首次获取英雄
	this.gainBeginHero = function(uid,cb) {
		self.incrbyObj(uid,main_name,"b_hero",1,function(data) {
			if(data > 1){
				cb(false,"已获取")
				return
			}
			var hId = self.getLordLastid(uid)
			var id = default_cfg["begin_hero"]["value"]
			var heroInfo = self.fightContorl.makeHeroData(id,3)
			heroInfo.hId = hId
			self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
			self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo,function() {
				if(cb)
					cb(true,heroInfo)
			})
			self.mysqlDao.addHeroLog({uid:uid,name:heros[heroInfo.id]["name"],id:hId,info:heroInfo,reason:"获得英雄"})
		})
	}
	//首次获取英雄
	this.gainFirstHero = function(uid,cb) {
		self.incrbyObj(uid,main_name,"f_hero",1,function(data) {
			if(data > 1){
				cb(false,"已获取")
				return
			}
			var hId = self.getLordLastid(uid)
			var id = default_cfg["first_hero"]["value"]
			var heroInfo = self.fightContorl.makeFullHeroData(id)
			heroInfo.hId = hId
			self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
			self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo,function() {
				if(cb)
					cb(true,heroInfo)
			})
			self.mysqlDao.addHeroLog({uid:uid,name:heros[heroInfo.id]["name"],id:hId,info:heroInfo,reason:"获得英雄"})
		})
	}
	//英雄洗练 洗练增加通灵值,通灵值满一百必出满技能,出满技能后通灵值重置
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