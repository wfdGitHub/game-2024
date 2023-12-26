//装备系统
const async = require("async")
const equip_lv = require("../../../../config/gameCfg/equip_lv.json")
const equip_slot = require("../../../../config/gameCfg/equip_slot.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const util = require("../../../../util/util.js")
const extra_list = ["M_HP","M_ATK","M_DEF","M_STK","M_SEF","M_SPE"]
const main_name = "equips"
var model = function() {
	var self = this
	var local = {}
	//获取数据
	this.getEquipData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			cb(true,data)
		})
	}
	//装备穿戴
	this.wearEquip = function(uid,hId,eId,cb) {
		var heroInfo,eStr,eInfo,oldEquip
		async.waterfall([
			function(next) {
				//检查英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					next()
				})
			},
			function(next) {
				//检查装备
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
					}else{
						eStr = data
						eInfo = JSON.parse(eStr)
						next()
					}
				})
			},
			function(next) {
				//卸下原装备
				if(heroInfo["e"+eInfo.slot]){
					oldEquip = JSON.parse(heroInfo["e"+eInfo.slot])
					self.setObj(uid,main_name,oldEquip.id,heroInfo["e"+eInfo.slot])
					delete heroInfo["e"+eInfo.slot]
				}
				next()
			},
			function(next) {
				//穿戴装备
				self.delObj(uid,main_name,eId,function() {
					heroInfo["e"+eInfo.slot] = eStr
					self.heroDao.setHeroInfo(self.areaId,uid,hId,"e"+eInfo.slot,heroInfo["e"+eInfo.slot],function(flag,data) {
						cb(true,{heroInfo:heroInfo,oldEquip:oldEquip})
					})
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//装备卸下
	this.unWearEquip = function(uid,hId,slot,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,data) {
			if(!data){
				cb(false,"英雄不存在")
				return
			}
			var heroInfo = data
			if(heroInfo["e"+slot]){
				var estr = heroInfo["e"+slot]
				var eInfo = JSON.parse(estr)
				delete heroInfo["e"+slot]
				self.heroDao.delHeroInfo(self.areaId,uid,hId,"e"+eInfo.slot,function(flag,data) {
					var award = self.gainEquipNotLog(uid,estr)
					cb(true,{heroInfo:heroInfo,award:award})
				})
			}
		})
	}
	//获得装备 有日志 str
	this.gainEquip = function(uid,estr){
		var eInfo = JSON.parse(estr)
		self.setObj(uid,main_name,eInfo.id,estr)
		self.mysqlDao.addEquipLog({uid:uid,name:equip_lv[eInfo.lv]["name_"+eInfo.slot],id:eInfo.id,info:eInfo,reason:"获得装备"})
		return eInfo
	}
	//获得装备 有日志 info
	this.gainEquipByInfo = function(uid,eInfo){
		var estr = JSON.stringify(eInfo)
		self.setObj(uid,main_name,eInfo.id,estr)
		self.mysqlDao.addEquipLog({uid:uid,name:equip_lv[eInfo.lv]["name_"+eInfo.slot],id:eInfo.id,info:eInfo,reason:"获得装备"})
		return estr
	}
	//添加装备 无日志
	this.gainEquipNotLog = function(uid,estr){
		var eInfo = JSON.parse(estr)
		self.setObj(uid,main_name,eInfo.id,estr)
		return eInfo
	}
	//装备分解
	this.recycleEquip = function(uid,eIds,cb) {
		if(!eIds || !Array.isArray(eIds) || !eIds.length){
			cb(false,"eIds error "+eIds)
			return
		}
		var hIdmap = {}
		for(var i = 0;i < eIds.length;i++){
			if(hIdmap[eIds[i]]){
			  	cb(false,"eId不能重复")
			  	return
			}
			hIdmap[eIds[i]] = true
		}
		self.getHMObj(uid,main_name,eIds,function(list) {
			for(var i = 0;i < list.length;i++){
			 	if(!list[i]){
			 		cb(false,"eId error "+eIds[i])
			 		return
			 	}
			 	list[i] = JSON.parse(list[i])
			 	self.mysqlDao.addEquipLog({uid:uid,name:equip_lv[list[i].lv]["name_"+list[i].slot],id:list[i].id,info:list[i],reason:"分解装备"})
			}
			var str = self.fightContorl.getEquipRecycle(list)
			for(var i = 0;i < list.length;i++)
				self.delObj(uid,main_name,list[i]["id"])
			var awardList = self.addItemStr(uid,str,1,"装备分解")
			cb(true,awardList)
		})
	}
	//获得指定品质装备
	this.makeEquipByQa = function(uid,lv,slot,qa) {
		var id = self.getLordLastid(uid)
		var info = self.fightContorl.makeEquip(lv,slot,qa)
		info.id = id
		info = JSON.stringify(info)
		self.setObj(uid,main_name,id,info)
		self.taskUpdate(uid,"equip",1,qa)
		return info
	}
	//装备打造
	this.makeEquip = function(uid,lv,slot,item,cb) {
		async.waterfall([
			function(next) {
				//参数判断
				if(!equip_lv[lv] || !equip_slot[slot]){
					next("参数错误")
					return
				}
				if(item && item != 2003400 && item != 2003500){
					next("item error "+item)
					return
				}
				next()
			},
			function(next) {
				//消耗判断
				var pc = equip_lv[lv]["pc"]
				if(item)
					pc += "&"+item+":"+1
				self.consumeItems(uid,pc,1,"装备打造",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				var id = self.getLordLastid(uid)
				var info = self.fightContorl.makeEquip(lv,slot,0,item)
				self.taskUpdate(uid,"equip",1,info.qa)
				info.id = id
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//装备洗练
	this.washEquip = function(uid,eId,item,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				if(item && item != 2003400 && item != 2003500){
					next("item error "+item)
					return
				}
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
					}else{
						info = JSON.parse(data)
						next()
					}
				})
			},
			function(next) {
				//消耗判断
				var pc = equip_lv[info.lv]["wash_pc"]
				if(item)
					pc += "&"+item+":"+1
				self.consumeItems(uid,pc,1,"装备洗练",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				var id = info.id
				info.wash = self.fightContorl.makeEquip(info.lv,info.slot,0,item)
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//洗练保存
	this.saveEquip = function(uid,eId,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
						return
					}
					info = JSON.parse(data)
					if(!info.wash){
						next("没有可保存的属性")
						return	
					}
					next()
				})
			},
			function(next) {
				//操作
				var id = info.id
				var st = info.st
				info = info.wash
				info.id = id
				info.st = st
				var estr = self.gainEquipByInfo(uid,info)
				cb(true,estr)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//属性转化
	this.washEquipExtra = function(uid,eId,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
					}else{
						info = JSON.parse(data)
						next()
					}
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_lv[info.lv]["extra_pc"],1,"属性转化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				info.washExtra = self.fightContorl.createEquipExtra(info,info.att.extra.type)
				var id = info.id
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//属性保存
	this.saveEquipExtra = function(uid,eId,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
						return
					}
					info = JSON.parse(data)
					if(!info.washExtra){
						next("没有可保存的洗练属性")
						return	
					}
					next()
				})
			},
			function(next) {
				//操作
				info.att.extra = info.washExtra
				delete info.washExtra
				var id = info.id
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//特效转化
	this.washEquipSpe = function(uid,eId,index,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
						return
					}
					info = JSON.parse(data)
					if(!info.spe || !info.spe[index]){
						next("不存在该特效")
						return
					}
					next()
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_lv[info.lv]["spe_pc"],1,"特效转化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				var map = {}
				for(var i = 0;i < info.spe.length;i++)
					map[info.spe[i]] = 1
				var speList = util.getRandomArray(equip_slot[info.slot]["spe_list"],3)
				for(var i = 0;i < speList.length;i++){
					if(!map[speList[i]]){
						info.washSpe = JSON.parse(JSON.stringify(info.spe))
						info.washSpe[index] = speList[i]
						break
					}
				}
				var id = info.id
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//特效保存
	this.saveEquipSpe = function(uid,eId,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
						return
					}
					info = JSON.parse(data)
					if(!info.washSpe){
						next("没有可保存的洗练特效")
						return	
					}
					next()
				})
			},
			function(next) {
				//操作
				info.spe = info.washSpe
				delete info.washSpe
				var id = info.id
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//套装转化
	this.washEquipSuit = function(uid,eId,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
						return
					}
					info = JSON.parse(data)
					if(!info.suit){
						next("不存在套装效果")
						return
					}
					next()
					
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_lv[info.lv]["suit_pc"],1,"套装转化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				info.washSuit = self.fightContorl.createEquipSuit(info)
				var id = info.id
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//套装保存
	this.saveEquipSuit = function(uid,eId,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
						return
					}
					info = JSON.parse(data)
					if(!info.washSuit){
						next("没有可保存的套装效果")
						return	
					}
					next()
				})
			},
			function(next) {
				//操作
				info.suit = info.washSuit
				delete info.washSuit
				var id = info.id
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//装备强化
	this.intensifyEquip = function(uid,eId,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.getObj(uid,main_name,eId,function(data) {
					if(!data){
						next("装备不存在")
						return
					}
					info = JSON.parse(data)
					info.st = info.st || 0
					if(info.st >= equip_lv[info.lv]["st_max"]){
						next("强化等级已满")
						return
					}
					next()
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_st[info.st]["pc"],1,"装备强化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				var id = info.id
				info.st++
				self.taskUpdate(uid,"equip_st",1,info.st)
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//装备洗练
	this.washEquipByHero = function(uid,hId,slot,item,cb) {
		var heroInfo = {}
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				if(item && item != 2003400 && item != 2003500){
					next("item error "+item)
					return
				}
				//检查英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					next()
				})
			},
			function(next) {
				//消耗判断
				var pc = equip_lv[info.lv]["wash_pc"]
				if(item)
					pc += "&"+item+":"+1
				self.consumeItems(uid,pc,1,"装备洗练",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				info.wash = self.fightContorl.makeEquip(info.lv,slot,0,item)
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.onlySetHeroInfo(uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//洗练保存
	this.saveEquipByHero = function(uid,hId,slot,cb) {
		var heroInfo = {}
		var info = {}
		async.waterfall([
			function(next) {
				//检查英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					if(!info.wash){
						next("没有可保存的属性")
						return	
					}
					next()
				})
			},
			function(next) {
				//操作
				var id = info.id
				var st = info.st
				info = info.wash
				info.id = id
				info.st = st
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"e"+slot,heroInfo["e"+slot])
				self.mysqlDao.addEquipLog({uid:uid,name:equip_lv[info.lv]["name_"+info.slot],id:info.id,info:info,reason:"获得装备"})
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//属性转化
	this.washEquipExtraByHero = function(uid,hId,slot,cb) {
		var heroInfo = {}
		var info = {}
		async.waterfall([
			function(next) {
				//检查英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					next()
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_lv[info.lv]["extra_pc"],1,"属性转化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				info.washExtra = self.fightContorl.createEquipExtra(info,info.att.extra.type)
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.onlySetHeroInfo(uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//属性保存
	this.saveEquipExtraByHero = function(uid,hId,slot,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//检查英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					if(!info.washExtra){
						next("没有可保存的洗练属性")
						return	
					}
					next()
				})
			},
			function(next) {
				//操作
				info.att.extra = info.washExtra
				delete info.washExtra
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//特效转化
	this.washEquipSpeByHero = function(uid,hId,slot,index,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					if(!info.spe || !info.spe[index]){
						next("不存在该特效")
						return
					}
					next()
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_lv[info.lv]["spe_pc"],1,"特效转化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				var map = {}
				for(var i = 0;i < info.spe.length;i++)
					map[info.spe[i]] = 1
				var speList = util.getRandomArray(equip_slot[info.slot]["spe_list"],3)
				for(var i = 0;i < speList.length;i++){
					if(!map[speList[i]]){
						info.washSpe = JSON.parse(JSON.stringify(info.spe))
						info.washSpe[index] = speList[i]
						break
					}
				}
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.onlySetHeroInfo(uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//特效保存
	this.saveEquipSpeByHero = function(uid,hId,slot,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//检查英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					if(!info.washSpe){
						next("没有可保存的洗练属性")
						return	
					}
					next()
				})
			},
			function(next) {
				//操作
				info.spe = info.washSpe
				delete info.washSpe
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//套装转化
	this.washEquipSuitByHero = function(uid,hId,slot,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					if(!info.suit){
						next("不存在套装效果")
						return
					}
					next()
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_lv[info.lv]["suit_pc"],1,"套装转化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				info.washSuit = self.fightContorl.createEquipSuit(info)
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.onlySetHeroInfo(uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//套装保存
	this.saveEquipSuitByHero = function(uid,hId,slot,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					if(!info.washSuit){
						next("不存在套装效果")
						return
					}
					next()
				})
			},
			function(next) {
				//操作
				info.suit = info.washSuit
				delete info.washSuit
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//装备强化
	this.intensifyEquipByHero = function(uid,hId,slot,cb) {
		var info = {}
		async.waterfall([
			function(next) {
				//参数判断
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					info = JSON.parse(heroInfo["e"+slot])
					info.st = info.st || 0
					if(info.st >= equip_lv[info.lv]["st_max"]){
						next("强化等级已满")
						return
					}
					next()
				})
			},
			function(next) {
				//消耗判断
				self.consumeItems(uid,equip_st[info.st]["pc"],1,"装备强化",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				//操作
				var id = info.id
				info.st++
				heroInfo["e"+slot] = JSON.stringify(info)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"e"+slot,heroInfo["e"+slot])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
}
module.exports = model