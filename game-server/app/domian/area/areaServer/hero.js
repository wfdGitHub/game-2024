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
const util = require("../../../../util/util.js")
var lv4Map = []
for(var i in hufu_skill)
	lv4Map.push(hufu_skill[i]["lv4"])
for(var i in summon_list){
	summon_list[i]["heros"] = JSON.parse(summon_list[i]["heros"])
	summon_list[i]["items"] = JSON.parse(summon_list[i]["items"])
	summon_list[i]["all_w"] = summon_list[i]["item_w"]
	summon_list[i]["w0"] = summon_list[i]["item_w"]
	for(var j = 1;j <= 5;j++){
		summon_list[i]["w"+j] = summon_list[i]["all_w"] + summon_list[i]["hero_w"+j]
		summon_list[i]["all_w"] = summon_list[i]["w"+j]
	}
}
var model = function() {
	var self = this
	var local = {}
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
				//消耗资源
				next()
			},
			function(next) {
				//抽奖
				var list = []
				for(var i = 0;i < count;i++){
					var rand = Math.random() * summon_list[sId]["all_w"]
					var index = 0
					for(var j = 0;j <= 5;j++){
						if(rand < summon_list[sId]["w"+j]){
							index = j
							break
						}
					}
					console.log("index",index)
					if(index == 0){
						//道具
						list = list.concat(self.addItemStr(uid,summon_list[sId]["items"][Math.floor(summon_list[sId]["items"].length * Math.random())],1,"英雄召唤-"+sId))
					}else{
						//英雄
						var id = summon_list[sId]["heros"][Math.floor(summon_list[sId]["heros"].length * Math.random())]
						list.push({type:"hero",heroInfo:self.gainOneHero(uid,id,index)})
						console.log(list)
					}
				}
				cb(true,list)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//英雄召唤-手动
	this.summonHeroHand = function(uid,sId,cb) {

	}
	this.gainOneHero = function(uid,id,qa) {
		console.log("gainOneHero",uid,id,qa)
		var hId = self.getLordLastid(uid)
		var heroInfo = local.gainHero(id,qa)
		heroInfo.hId = hId
		self.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
		self.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo)
		self.cacheDao.saveCache({messagetype:"itemChange",areaId:self.areaId,uid:uid,itemId:777000000+id,value:1,curValue:qa,reason:"获得英雄-"+hId})
		return heroInfo
	}
	//设置心愿

	//英雄升级

	//英雄进化

	//英雄晋升

	//英雄重置

	//英雄分解

	//英雄洗髓

	//英雄打书

	//使用资质丹
	
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
		heroInfo.save = c_info
		return heroInfo
	}
	//洗练保存
	local.saveHero = function(heroInfo) {
		if(heroInfo.save){
			for(var i = 0;i < 10;i++)
				delete heroInfo["PS"+i]
			Object.assign(heroInfo,heroInfo.save)
			delete heroInfo.save
		}
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
		var list = []
		for(var i = 0;i < 10;i++){
			if(heroInfo["PS"+i])
				list.push(i)
		}
		var index = list[Math.floor(list.length*Math.random())]
		heroInfo["PS"+index] = sId
		return heroInfo
	}
	//英雄培养属性
	this.heroTrainAtt = function(uid,hId,value,cb) {
		var self = this
		var max_need = 0
		var tr_lv
		var min_lv
		var tr_maxHP
		var tr_atk
		var tr_phyDef
		var tr_magDef
		var info = {}
		async.waterfall([
			function(next) {
				//获取英雄数据
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(flag && heroInfo){
					    if(heroInfo.coexist){
					      next("该英雄共鸣中")
					      return
					    }
						next(null,heroInfo)
					}else{
						next("hero not find "+heroInfo)
					}
				})
			},
			function(heroInfo,next) {
				//消耗培养丹
				tr_lv = heroInfo["tr_lv"] || 0
				min_lv = tr_lv - 1
				tr_maxHP = heroInfo["tr_maxHP"]  || 0
				tr_atk = heroInfo["tr_atk"]  || 0
				tr_phyDef = heroInfo["tr_phyDef"]  || 0
				tr_magDef = heroInfo["tr_magDef"]  || 0
				max_need += (hero_tr[tr_lv]["maxHP"] - tr_maxHP) / train_arg["base"]["value"] / train_arg["maxHP"]["value"]
				max_need += (hero_tr[tr_lv]["atk"] - tr_atk) / train_arg["base"]["value"] / train_arg["atk"]["value"]
				max_need += (hero_tr[tr_lv]["phyDef"] - tr_phyDef) / train_arg["base"]["value"] / train_arg["phyDef"]["value"]
				max_need += (hero_tr[tr_lv]["magDef"] - tr_magDef) / train_arg["base"]["value"] / train_arg["magDef"]["value"]
				max_need = Math.ceil(max_need)
				//若最大所需培养丹大于当前使用培养丹  则只使用最大所需
				if(value > max_need)
					value = max_need
				if(max_need <= 0){
					next("当前培养已满")
					return
				}
				info.useValue = value
				self.consumeItems(uid,"1000020:"+value,1,"英雄培养",function(flag,err) {
					if(flag){
						next()
					}else{
						cb(false,err)
					}
				})
			},
			function(next) {
				//增加属性
				if(value >= max_need){
					//加满属性
					info.tr_maxHP = hero_tr[tr_lv]["maxHP"]
					info.tr_atk = hero_tr[tr_lv]["atk"]
					info.tr_phyDef = hero_tr[tr_lv]["phyDef"]
					info.tr_magDef = hero_tr[tr_lv]["magDef"]
				}else{
					var weights = util.randomFigure(train_arg["base"]["value"]*100,4)
					for(var i = 0;i < weights.length;i++){
						weights[i] = weights[i] * info.useValue / 100
						//上下浮动
						var rand = Math.random()
						if(rand > 0.8){
							weights[i] += Math.sqrt(info.useValue) * 0.8 * train_arg["base"]["value"]
						}else if(rand < 0.1){
							weights[i] -= Math.sqrt(info.useValue) * 0.8 * train_arg["base"]["value"]
						}
					}
					tr_maxHP = Math.floor(tr_maxHP + weights[0] * train_arg["maxHP"]["value"])
					tr_atk =  Math.floor(tr_atk + weights[1] * train_arg["atk"]["value"])
					tr_phyDef =  Math.floor(tr_phyDef + weights[2] * train_arg["phyDef"]["value"])
					tr_magDef =  Math.floor(tr_magDef + weights[3] * train_arg["magDef"]["value"])
					info.tr_maxHP = Math.max(Math.min(tr_maxHP,hero_tr[tr_lv]["maxHP"]),hero_tr[min_lv]["maxHP"])
					info.tr_atk = Math.max(Math.min(tr_atk,hero_tr[tr_lv]["atk"]),hero_tr[min_lv]["atk"])
					info.tr_phyDef = Math.max(Math.min(tr_phyDef,hero_tr[tr_lv]["phyDef"]),hero_tr[min_lv]["phyDef"])
					info.tr_magDef = Math.max(Math.min(tr_magDef,hero_tr[tr_lv]["magDef"]),hero_tr[min_lv]["magDef"])
				}
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"tr_maxHP",info.tr_maxHP)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"tr_atk",info.tr_atk)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"tr_phyDef",info.tr_phyDef)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"tr_magDef",info.tr_magDef)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//英雄培养突破
	this.heroTrainLv = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(flag && heroInfo){
			    if(heroInfo.coexist){
			      next("该英雄共鸣中")
			      return
			    }
				var tr_lv = heroInfo["tr_lv"] || 0
				var tr_maxHP = heroInfo["tr_maxHP"]  || 0
				var tr_atk = heroInfo["tr_atk"]  || 0
				var tr_phyDef = heroInfo["tr_phyDef"]  || 0
				var tr_magDef = heroInfo["tr_magDef"]  || 0
				if(heroInfo["star"] < hero_tr[tr_lv]["star"]){
					cb(false,"英雄星级不足"+heroInfo["star"]+"/"+hero_tr[tr_lv]["star"])
					return
				}
				if(!hero_tr[tr_lv+1]){
					cb(false,"已满级")
					return
				}
				if(tr_maxHP >= hero_tr[tr_lv]["maxHP"] && tr_atk >= hero_tr[tr_lv]["atk"] && tr_phyDef >= hero_tr[tr_lv]["phyDef"] && tr_magDef >= hero_tr[tr_lv]["magDef"]){
					self.consumeItems(uid,hero_tr[tr_lv]["pc"],1,"英雄培养",function(flag,err) {
						if(flag){
							self.taskUpdate(uid,"hero_tr",1,tr_lv+1)
							self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,"tr_lv",1)
							cb(true,tr_lv+1)
						}else{
							cb(false,err)
						}
					})
				}else{
					cb(false,"当前属性未培养满")
				}
			}else{
				cb(false,"英雄不存在"+hId)
			}
		})
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
		    if(heroInfo.coexist){
		    	cb(false,"该英雄共鸣中"+hId)
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