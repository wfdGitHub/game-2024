//英雄培养
const async = require("async")
const hero_tr = require("../../../../config/gameCfg/hero_tr.json")
const train_arg = require("../../../../config/gameCfg/train_arg.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const lord_lv = require("../../../../config/gameCfg/lord_lv.json")
const summon_list = require("../../../../config/gameCfg/summon_list.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const heros = require("../../../../config/gameCfg/heros.json")
const hero_quality = require("../../../../config/gameCfg/hero_quality.json")
const species = require("../../../../config/gameCfg/species.json")
const evolves = require("../../../../config/gameCfg/evolves.json")
const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
const lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
const items = require("../../../../config/gameCfg/item.json")
const util = require("../../../../util/util.js")
var lv4Map = []
for(var i in hufu_skill)
	lv4Map.push(hufu_skill[i]["lv4"])
for(var i in summon_list){
	summon_list[i]["heros"] = JSON.parse(summon_list[i]["heros"])
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
const main_name = "summon"
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
				cb(true,list)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//获得一个英雄
	this.gainOneHero = function(uid,id,qa) {
		var hId = self.getLordLastid(uid)
		var heroInfo = local.gainHero(id,qa)
		heroInfo.hId = hId
		self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
		self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo)
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
		console.log("heroUPLv",uid,hId,aimLv)
	  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
	    if(!flag){
	    	cb(false,"英雄不存在")
	      	return
	    }
	    var lv = self.getLordLv(uid)
	    var evoLv = evolve_lv[heroInfo.evo].lv || 1
	    if(aimLv <= heroInfo.lv || aimLv > evoLv || aimLv > lv * 2){
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
				console.log("rate",rate)
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
	//英雄重置
	
	//英雄分解

	//英雄洗练 
	this.heroWash = function(uid,hId,cb) {
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
			self.consumeItems(uid,exalt_lv[exalt]["wash_pc"],1,"英雄洗练",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				heroInfo = local.washHero(heroInfo)
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
	//获得英雄
	local.gainHero = function(id,qa) {
		if(!heros[id])
			return {}
		var heroInfo = {}
		heroInfo.id = id
		heroInfo.evo = 1
		heroInfo.exalt = heros[id]["exalt"]
		heroInfo.qa = qa
		heroInfo.wash = 0
		heroInfo.lv = 1
		var c_info = local.createHero(heroInfo.id,heroInfo.qa,heroInfo.wash)
		Object.assign(heroInfo,c_info)
		return heroInfo
	}
	//英雄洗练 洗练增加通灵者，通灵者满一百必出满技能，出满技能后通灵者重置
	local.washHero = function(heroInfo) {
		heroInfo.wash += exalt_lv[heros[heroInfo.id]["exalt"]]["wash_value"]
		var c_info = local.createHero(heroInfo.id,heroInfo.qa,heroInfo.wash)
		heroInfo.wash = c_info.wash
		delete c_info.wash
		heroInfo.save = JSON.stringify(c_info)
		return heroInfo
	}
	//英雄创建资质技能
	local.createHero = function(id,qa,wash) {
		var c_info = {}
		var extra = 0
		var skillNum = 0
		c_info.wash = wash
		//宠物异化
		if(qa == 4 && Math.random() < wash/300)
			qa = 5
		c_info.qa = qa
		//触发资质加成
		if(Math.random() < wash/200)
			extra = 0.05
		//触发技能保底
		if(c_info.wash >= 100)
			skillNum = heros[id]["passive_num"]
		else
			skillNum = Math.floor(hero_quality[qa]["skillRate"] * (Math.random() * 0.5 + 0.6) * heros[id]["passive_num"])
		for(var i = 1;i <= 6;i++)
			c_info["MR"+i] = hero_quality[qa]["mainRate"] * (Math.random() * (0.4 + extra) + 0.7)
		if(skillNum == heros[id]["passive_num"])
			c_info.wash = 0
		var skillList = []
		for(var i = 1; i <= skillNum;i++)
			skillList.push(heros[id]["passive"+i])
		skillList.sort(function(){return Math.random() > 0.5 ? 1 : -1})
		for(var i = 0;i < skillList.length;i++)
			c_info["PS"+i] = skillList[i]
		//异化多一个超级技能
		if(c_info.qa == 5)
			c_info["PS"+skillNum] = lv4Map[Math.floor(lv4Map.length * Math.random())]
		return c_info
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
	//装备强化
	this.heroEquipStrengthen = function(uid,hId,slot,cb) {
		if(!Number.isInteger(slot) || slot < 1 || slot > 4){
			cb(false,"槽位错误"+slot)
			return
		}
		var key = "et"+slot
		//todo 判定英雄是否存在
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo){
			if(!flag || !heroInfo.id){
				cb(false,"英雄不存在"+hId)
				return
			}
			var slv = Number(heroInfo[key]) || 0
			if(!equip_st[slv+1]){
				cb(false,"强化等级已满"+slv)
				return
			}
			var lv = self.getLordLv(uid)
			if(slv >= lord_lv[lv]["st"]){
				cb(false,"等级上限"+slv+"/"+lord_lv[lv]["st"])
				return
			}
			self.consumeItems(uid,equip_st[slv]["pc"],1,"英雄培养",function(flag,err) {
				if(flag){
					self.taskUpdate(uid,"equip_st",1,slv+1)
					self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,key,1)
					cb(true,slv+1)
				}else{
					cb(false,err)
				}
			})
		})
	}
}
module.exports = model