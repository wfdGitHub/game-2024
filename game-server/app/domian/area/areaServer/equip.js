//装备系统
const async = require("async")
const equip_lv = require("../../../../config/gameCfg/equip_lv.json")
const equip_qa = require("../../../../config/gameCfg/equip_qa.json")
const equip_slot = require("../../../../config/gameCfg/equip_slot.json")
const equip_suit = require("../../../../config/gameCfg/equip_suit.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const equip_spe = require("../../../../config/gameCfg/equip_spe.json")
const util = require("../../../../util/util.js")
const extra_list = ["M_HP","M_ATK","M_DEF","M_STK","M_SEF","M_SPE"]
for(var i in equip_qa){
	equip_qa[i].speWeights = [equip_qa[i]["spe_0"]]
	equip_qa[i].speWeights.push(equip_qa[i].speWeights[0] + equip_qa[i]["spe_1"])
	equip_qa[i].speWeights.push(equip_qa[i].speWeights[1] + equip_qa[i]["spe_2"])
}
for(var i in equip_slot)
	equip_slot[i]["spe_list"] = JSON.parse(equip_slot[i]["spe_list"])
for(var i in equip_lv){
	equip_lv[i]["qa_weights"] = [equip_lv[i]["weight_1"]]
	for(var j = 2;j <= 5;j++)
		equip_lv[i]["qa_weights"].push(equip_lv[i]["weight_"+j]+equip_lv[i]["qa_weights"][equip_lv[i]["qa_weights"].length-1])
	equip_lv[i]["high_weights"] = JSON.parse(JSON.stringify(equip_lv[i]["qa_weights"]))
	equip_lv[i]["high_weights"][3] += equip_lv[i]["weight_4"]
	equip_lv[i]["high_weights"][4] += equip_lv[i]["weight_5"] + equip_lv[i]["weight_4"]
	equip_lv[i]["suit_list"] = JSON.parse(equip_lv[i]["suit_list"])
}
const main_name = "equips"
var model = function() {
	var self = this
	var local = {}
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
				self.consumeItems(uid,,1,"装备打造",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				var id = self.getLordLastid(uid)
				var info = self.gainEquip(lv,slot,0,item)
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
				info.wash = self.gainEquip(lv,slot)
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
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
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
				info.washExtra = local.createAtt(info,info.att.extra.type)
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
						info.washSpe = info.spe
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
				info.washSuit = local.createSuit(info)
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
				info = JSON.stringify(info)
				self.setObj(uid,main_name,id,info)
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//分解装备
	this.recycle = function(uid,eIds,cb) {

	}
	//获得装备
	this.gainEquip = function(lv,slot,qa,item) {
		var info = {}
		info.lv = lv
		info.slot = slot
		if(qa)
			info.qa = qa
		else{
			if(item == 2003400){
				//强化打造
				info.qa = util.getWeightedRandomBySort(equip_lv[lv]["high_weights"]) + 1
			}else if(item == 2003500){
				//必定异化
				info.qa = 5
			}else{
				info.qa = util.getWeightedRandomBySort(equip_lv[lv]["qa_weights"]) + 1
			}
		}
		info.att = local.createAtt(info)
		var spe = local.createSpe(info)
		if(spe)
			info.spe = spe
		var suit = local.createSuit(info)
		if(suit)
			info.suit = suit
		return info
	}
	//装备随机生成属性
	local.createAtt = function(info) {
		var c_info = {}
		c_info.main_1 = equip_qa[info.qa]["mainRate"] * (Math.random() * 0.1 + 0.95)
		c_info.main_2 = equip_qa[info.qa]["mainRate"] * (Math.random() * 0.1 + 0.95)
		c_info.extra = local.createExtra(info,Math.floor(Math.random() * 3))
		return c_info
	}
	//装备随机生成额外属性
	local.createExtra = function(info,type) {
		var extra = {}
		extra.type = type
		switch(type){
			case 0:
				//单加属性
				var list = util.getRandomArray(extra_list,1)
				for(var i = 0;i < list.length;i++)
					extra[list[i]] = Math.ceil(equip_qa[info.qa]["extraRate"] * (Math.random() * 0.2 + 0.85) * equip_lv[info.lv]["extra"] * 0.75)
			break
			case 1:
				//双加属性
				var list = util.getRandomArray(extra_list,2)
				for(var i = 0;i < list.length;i++)
					extra[list[i]] = Math.ceil(equip_qa[info.qa]["extraRate"] * (Math.random() * 0.2 + 0.85) * equip_lv[info.lv]["extra"] * 0.5)
			break
			default:
				//加减属性
				var list = util.getRandomArray(extra_list,2)
				var rate = (Math.random() * 0.2 + 0.85)
				extra[list[0]] = Math.ceil(equip_qa[info.qa]["extraRate"] * rate * equip_lv[info.lv]["extra"] * 0.9)
				extra[list[1]] = Math.ceil(equip_qa[info.qa]["extraRate"] * rate * equip_lv[info.lv]["extra"] * -0.3)
		}
		return extra
	}
	//装备随机生成特效
	local.createSpe = function(info) {
		if(!equip_lv[info.lv]["spe"])
			return false
		var spe = []
		var count = util.getWeightedRandomBySort(equip_qa[info.qa].speWeights)
		if(count > 0)
			return util.getRandomArray(equip_slot[info.slot]["spe_list"],count)
		else
			return false
	}
	//装备随机生成套装
	local.createSuit = function(info) {
		return equip_lv[info.lv]["suit_list"][Math.floor(Math.random() * equip_lv[info.lv]["suit_list"].length)]
	}
}
module.exports = model


// var test = new model()
// console.log(test.gainEquip(6,1,5))