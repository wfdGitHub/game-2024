const bazaar_cfg = require("../../../../config/gameCfg/bazaar.json")
const item_cfg = require("../../../../config/gameCfg/item.json")
const heros = require("../../../../config/gameCfg/heros.json")
const async = require("async")
const main_name = "bazaar"
var bazaar_goods = {}
var allWeights = {}
for(let type in bazaar_cfg){
	allWeights[type] = 0
	bazaar_goods[type] = JSON.parse(bazaar_cfg[type]["goods"])
	for(let i = 0;i < bazaar_goods[type].length;i++){
		bazaar_goods[type][i].weight += allWeights[type]
		allWeights[type] = bazaar_goods[type][i].weight
	}
}
var star_4_heros = []
var star_5_heros = []
for(var heroId in heros){
	if(heros[heroId].min_star == 4){
		star_4_heros.push(heroId)
	}else if(heros[heroId].min_star == 5){
		star_5_heros.push(heroId)
	}
}
console.log("allWeights",allWeights)
//集市
var local = {}
local.getGoods = function(type) {
	let allWeight = allWeights[type]
	let rand = Math.random() * allWeight
	for(let i = 0;i < bazaar_goods[type].length;i++){
		if(rand < bazaar_goods[type][i].weight){
			let goods = {}
			switch(bazaar_goods[type][i]["type"]){
				case "item":
					goods.itemId = bazaar_goods[type][i]["itemId"]
				break
				case "heroChip":
					if(bazaar_goods[type][i]["quality"] == 4){
						goods.itemId = star_4_heros[Math.floor(Math.random() * star_4_heros.length)]
					}else if(bazaar_goods[type][i]["quality"] == 5){
						goods.itemId = star_5_heros[Math.floor(Math.random() * star_4_heros.length)]
					}
				break
				case "equip":
					return false
				break
				case "ace":
					return false
				break
				case "art":
					return false
				break
			}
			goods.value = bazaar_goods[type][i]["value"] * item_cfg[goods.itemId]["buyNum"]
			if(!goods.value){
				console.error("goods.itemId ",goods.itemId,bazaar_goods[type][i]["value"],item_cfg[goods.itemId]["buyNum"])
			}
			goods.discount = bazaar_goods[type][i]["discount"]
			switch(bazaar_goods[type][i].currency){
				case "coin":
					goods.price = "201:"+bazaar_goods[type][i]["value"]*item_cfg[goods.itemId]["coin"]
				break
				case "gold":
					goods.price = "202:"+bazaar_goods[type][i]["value"]*item_cfg[goods.itemId]["gold"]
				break
				case "other":
					goods.price = item_cfg[goods.itemId]["other_currency"]+":"+Math.round(bazaar_goods[type][i]["value"]*item_cfg[goods.itemId]["other_value"]*goods.discount)
				break
			}
			return goods
		}
	}
}
module.exports = function() {
	var self = this
	//每日刷新
	this.bazaarDayRefresh = function(uid) {
		let info = {}
		for(let type in bazaar_cfg){
			info.free_count = bazaar_cfg[type]["free_count"]
			info.time = 0
			info.cur_count = 0
			this.bazaarRefresh(uid,type)
		}
	}
	//集市刷新
	this.bazaarRefresh = function(uid,type) {
		if(!bazaar_goods[type]){
			return false
		}
		let info = {}
		for(let i = 1;i <= 6;i++){
			info[type+":"+i] = JSON.stringify(local.getGoods(type))
		}
		self.setHMObj(uid,main_name,info)
		return info
	}
	//获取集市数据
	this.getBazaarData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			cb(data)
		})
	}
	//购买物品


}


