//宝石系统
const async = require("async")
const equip_lv = require("../../../../config/gameCfg/equip_lv.json")
const gem_lv = require("../../../../config/gameCfg/gem_lv.json")
const items = require("../../../../config/gameCfg/item.json")
const util = require("../../../../util/util.js")
const main_name = "gem"
var gemMap = {}
for(var i in gem_lv){
	i = Number(i)
	for(var j = 1; j <= 7;j++){
		gemMap[gem_lv[i]["type_"+j]] = Object.assign({type : j},gem_lv[i])
		if(gem_lv[i+1])
			gemMap[gem_lv[i]["type_"+j]].next = gem_lv[i+1]["type_"+j]
	}
}
var model = function() {
	var self = this
	//装备宝石
	this.gemWear = function(uid,hId,slot,g_slot,itemId,cb) {
		var heroInfo,eInfo
		if(!gemMap[itemId]){
			cb(false,"itemId error "+itemId)
			return
		}
		if(!g_slot || !Number.isInteger(g_slot) || g_slot < 1){
			cb(false,"g_slot error "+g_slot)
			return
		}
		var key = "e"+slot+"g"+g_slot
		async.waterfall([
			function(next) {
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
					eInfo = JSON.parse(heroInfo["e"+slot])
					if(heroInfo[key]){
						next("该位置已装备宝石")
						return
					}
					if(eInfo.lv < gemMap[itemId]["equip"]){
						next("装备等级不足")
						return
					}
					if(equip_lv[eInfo.lv]["gem_slot"] < g_slot){
						next("宝石槽位未解锁 "+g_slot)
						return
					}
					if(equip_lv[eInfo.lv]["gem_type_1"] != gemMap[itemId]["type"] && equip_lv[eInfo.lv]["gem_type_2"] != gemMap[itemId]["type"]){
						next("宝石类型错误 "+gemMap[itemId]["type"])
						return
					}
					next()
				})
			},
			function(next) {
				self.consumeItems(uid,itemId+":1",1,"穿戴宝石",function(flag,err) {
					if(!flag){
						cb(false,err)
						return
					}
					heroInfo[key] = itemId
					self.heroDao.setHeroInfo(self.areaId,uid,hId,key,heroInfo[key])
					cb(true,heroInfo)
				})
			},
		],function(err) {
			cb(false,err)
		})
	}
	//升级宝石
	this.gemUpByHero = function(uid,hId,slot,g_slot,gems,cb) {
		var heroInfo,info,itemId,nextId
		var key = "e"+slot+"g"+g_slot
		if(!g_slot || !Number.isInteger(g_slot) || g_slot < 1){
			cb(false,"g_slot error "+g_slot)
			return
		}
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo[key]){
						next("未装备宝石")
						return
					}
					eInfo = JSON.parse(heroInfo["e"+slot])
					if(!heroInfo["e"+slot]){
						next("装备不存在")
						return
					}
					itemId = heroInfo[key]
					nextId = gemMap[itemId]["next"]
					if(!nextId || eInfo.lv < gemMap[nextId]["equip"]){
						next("装备等级不足")
						return
					}
					var value = 0
					for(var i in gems){
						if(!gemMap[i] || gemMap[i]["type"] != gemMap[itemId]["type"]){
							next("gems error "+i)
							return
						}
						value += gemMap[i]["value"] * gems[i]
					}
					//判断宝石值
					var need = gemMap[nextId]["value"]
					if(value != need){
						next("宝石值错误 "+value+"/"+need)
						return
					}
					next()
				})
			},
			function(next) {
				var pc = ""
				for(var i in gems){
					pc += i+":"+gems[i]+"&"
				}
				pc = pc.slice(0,pc.length-1);
				self.consumeItems(uid,pc,1,"升级宝石",function(flag,err) {
					if(!flag){
						cb(false,err)
						return
					}
					heroInfo[key] = nextId
					self.heroDao.setHeroInfo(self.areaId,uid,hId,key,heroInfo[key])
					cb(true,heroInfo)
				})
			},
		],function(err) {
			cb(false,err)
		})
	}
	//拆卸宝石
	this.gemUnWear = function(uid,hId,slot,g_slot,cb) {
		var heroInfo,info
		var key = "e"+slot+"g"+g_slot
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo[key]){
						next("未装备宝石")
						return
					}
					next()
				})
			},
			function(next) {
				var itemId = heroInfo[key]
				delete heroInfo[key]
				self.heroDao.delHeroInfo(self.areaId,uid,hId,key,function() {
					self.addItemStr(uid,itemId+":1",1,"卸下宝石",function(flag,err) {
						cb(true,heroInfo)
					})
				})
			},
		],function(err) {
			cb(false,err)
		})
	}
}
module.exports = model