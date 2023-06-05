//英雄培养
const async = require("async")
const hero_tr = require("../../../../config/gameCfg/hero_tr.json")
const train_arg = require("../../../../config/gameCfg/train_arg.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const util = require("../../../../util/util.js")
hero_tr[-1] = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
module.exports = function() {
	var self = this
	//英雄培养属性
	this.heroTrainAtt = function(uid,hId,value,cb) {
		var self = this
		var max_need = 0
		var tr_lv
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
						next(null,heroInfo)
					}else{
						next("hero not find "+heroInfo)
					}
				})
			},
			function(heroInfo,next) {
				//消耗培养丹
				tr_lv = heroInfo["tr_lv"] || 0
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
					var weights = util.randomFigure(train_arg["base"]["value"],4)
					for(var i = 0;i < weights.length;i++){
						weights[i] *= info.useValue
						//上下浮动
						var rand = Math.random()
						if(rand > 0.85){
							weights[i] += Math.sqrt(info.useValue) * 0.3 * train_arg["base"]["value"]
						}else if(rand < 0.15){
							weights[i] -= Math.sqrt(info.useValue) * 0.3 * train_arg["base"]["value"]
						}
					}
					if(tr_maxHP < hero_tr[tr_lv]["maxHP"])
						tr_maxHP = Math.min(Math.floor(tr_maxHP + weights[0] * train_arg["maxHP"]["value"]),hero_tr[tr_lv]["maxHP"])
					if(tr_atk < hero_tr[tr_lv]["atk"])
						tr_atk = Math.min(Math.floor(tr_atk + weights[1] * train_arg["atk"]["value"]),hero_tr[tr_lv]["atk"])
					if(tr_phyDef < hero_tr[tr_lv]["phyDef"])
						tr_phyDef = Math.min(Math.floor(tr_phyDef + weights[2] * train_arg["phyDef"]["value"]),hero_tr[tr_lv]["phyDef"])
					if(tr_magDef < hero_tr[tr_lv]["magDef"])
						tr_magDef = Math.min(Math.floor(tr_magDef + weights[3] * train_arg["magDef"]["value"]),hero_tr[tr_lv]["magDef"])
					if(tr_maxHP < hero_tr[tr_lv - 1]["maxHP"])
						tr_maxHP = hero_tr[tr_lv - 1]["maxHP"]
					if(tr_atk < hero_tr[tr_lv - 1]["atk"])
						tr_atk = hero_tr[tr_lv - 1]["atk"]
					if(tr_phyDef < hero_tr[tr_lv - 1]["phyDef"])
						tr_phyDef = hero_tr[tr_lv - 1]["phyDef"]
					if(tr_magDef < hero_tr[tr_lv - 1]["magDef"])
						tr_magDef = hero_tr[tr_lv - 1]["magDef"]
					info.tr_maxHP = tr_maxHP
					info.tr_atk = tr_atk
					info.tr_phyDef = tr_phyDef
					info.tr_magDef = tr_magDef
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
			var slv = Number(heroInfo[key]) || 0
			if(!equip_st[slv+1]){
				cb(false,"强化等级已满"+slv)
				return
			}
			var lv = self.getLordLv(uid)
			if(slv >= lv){
				cb(false,"强化不能超过主角等级 "+slv+"/"+lv)
				return
			}
			self.consumeItems(uid,equip_st[slv]["pc"],1,"英雄培养",function(flag,err) {
				if(flag){
					self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,key,1)
					cb(true,slv+1)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//满星吞噬
	this.heroUPDevour = function(uid,hId,targetId,cb) {
		var hIds = [hId,targetId]
		self.heroDao.getHeroList(uid,hIds,function(flag,heroList){
			var heroInfo = heroList[0]
			var targetInfo = heroList[1]
			if(self.heroDao.heroLockCheck(targetInfo)){
				cb(false,"英雄锁定中 "+targetId)
				return
			}
			if(!heroInfo || heroInfo.star < 30 || targetInfo.star < 30){
				cb(false,"英雄未满星"+hId+" "+targetId)
				return
			}
			heroInfo.dev = Number(heroInfo.dev) || 0
			targetInfo.dev = Number(targetInfo.dev) || 0
			if(heroInfo.dev + targetInfo.dev + 1 > 5){
				cb(false,"吞噬不能超过5层")
				return
			}
			if(heroInfo.id != targetInfo.id){
				cb(false,"必须为同名卡")
				return
			}
      self.heroDao.removeHeroList(uid,[targetId],function(flag,err) {
          if(err)
            console.error(err)
					self.heroDao.heroPrlvadnad(self.areaId,uid,[targetInfo],[targetId],function(flag,awardList) {
						for(var i = 0;i <  targetInfo.dev + 1;i++){
							heroInfo.dev++
							var HufuId = self.gainRandHufuId(Math.random() < 0.5 ? 1 : 2)
							heroInfo["fs"+heroInfo.dev] = HufuId
							self.heroDao.setHeroInfo(self.areaId,uid,hId,"fs"+heroInfo.dev,HufuId)
						}
						self.heroDao.incrbyHeroInfo(self.areaId,uid,hId,"dev",targetInfo.dev+1)
						cb(true,{heroInfo:heroInfo,awardList:awardList})
					})
      })
		})
	}
	//符石洗练
	this.washFushi = function(uid,hId,slot,cb) {
		if(!Number.isInteger(slot) || slot < 1 || slot > 5){
			cb(false,"槽位错误"+slot)
			return
		}
		var key = "fstmp"+slot
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo){
			if(!flag || !heroInfo.id){
				cb(false,"英雄不存在"+hId)
				return
			}
			if(!heroInfo.dev || heroInfo.dev < slot){
				cb(false,"槽位未开放"+heroInfo.dev)
				return
			}
			self.consumeItems(uid,"1000240:100",1,"符石洗练",function(flag,err) {
				if(flag){
					var rand = Math.random()
					var lv = 1
					if(rand < 0.75)
						lv = 2
					if(rand < 0.45)
						lv = 3
					if(rand < 0.15)
						lv = 4
					if(rand < 0.03)
						lv = 5
					var HufuId = self.gainRandHufuId(lv)
					self.heroDao.setHeroInfo(self.areaId,uid,hId,key,HufuId)
					heroInfo[key] = HufuId
					cb(true,heroInfo)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//符石洗练保存
	this.saveFushi = function(uid,hId,slot,cb) {
		if(!Number.isInteger(slot) || slot < 1 || slot > 5){
			cb(false,"槽位错误"+slot)
			return
		}
		var key = "fstmp"+slot
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo){
			if(!flag || !heroInfo.id){
				cb(false,"英雄不存在"+hId)
				return
			}
			if(heroInfo.dev < slot){
				cb(false,"槽位未开放"+heroInfo.dev)
				return
			}
			if(!heroInfo["fstmp"+slot]){
				cb(false,"未洗练"+slot)
				return
			}
			self.heroDao.setHeroInfo(self.areaId,uid,hId,"fs"+slot,heroInfo["fstmp"+slot])
			self.heroDao.delHeroInfo(self.areaId,uid,hId,"fstmp"+slot)
			heroInfo["fs"+slot] = heroInfo["fstmp"+slot]
			delete heroInfo["fstmp"+slot]
			cb(true,heroInfo)
		})
	}
}