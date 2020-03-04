const bazaar_cfg = require("../../../../config/gameCfg/bazaar.json")
const item_cfg = require("../../../../config/gameCfg/item.json")
const heros = require("../../../../config/gameCfg/heros.json")
const checkpoints = require("../../../../config/gameCfg/checkpoints.json")
const equip_level = require("../../../../config/gameCfg/equip_level.json")
const ace_pack = require("../../../../config/gameCfg/ace_pack.json")
const async = require("async")
const main_name = "bazaar"
var bazaar_goods = {}
var allWeights = {}
var equipForCheck= {}
var ace_qualitys = {}
var art_list = []
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
for(let heroId in heros){
	if(heros[heroId].min_star == 4){
		star_4_heros.push(heroId)
	}else if(heros[heroId].min_star == 5){
		star_5_heros.push(heroId)
	}
}
for(let i in ace_pack){
	if(!ace_qualitys[ace_pack[i].quality])
		ace_qualitys[ace_pack[i].quality] = []
	ace_qualitys[ace_pack[i].quality].push(i)
}
for(let i in item_cfg){
	if(item_cfg[i].type == "art")
		art_list.push(i)
}
console.log("allWeights",allWeights)
//集市
var local = {}

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
			info[type+":"+i] = JSON.stringify(self.getBazaarGoods(uid,type))
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

	//获得商品
	this.getBazaarGoods = function(uid,type) {
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
						let lv = self.getCheckpointsInfo(uid) || 1
						let equipLv = checkpoints[lv]["equip"]
						let part = Math.floor(Math.random() * 4) + 1
						goods.itemId = equip_level[equipLv]["part_"+part]
					break
					case "ace":
						let quality = bazaar_goods[type][i]["quality"]
						goods.itemId = ace_qualitys[quality][Math.floor(Math.random() * ace_qualitys[quality].length)]
						break
					break
					case "art":
						goods.itemId = art_list[Math.floor(Math.random() * art_list.length)]
					break
				}
				goods.value = bazaar_goods[type][i]["value"] * item_cfg[goods.itemId]["buyNum"]
				if(!goods.value){
					console.error("goods.itemId ",goods.itemId,bazaar_goods[type][i]["value"],item_cfg[goods.itemId]["buyNum"])
				}
				goods.discount = bazaar_goods[type][i]["discount"]
				switch(bazaar_goods[type][i].currency){
					case "coin":
						goods.price = "201:"+Math.round(bazaar_goods[type][i]["value"]*item_cfg[goods.itemId]["coin"] * goods.discount)
					break
					case "gold":
						goods.price = "202:"+Math.round(bazaar_goods[type][i]["value"]*item_cfg[goods.itemId]["gold"] * goods.discount)
					break
					case "other":
						goods.price = item_cfg[goods.itemId]["other_currency"]+":"+Math.round(bazaar_goods[type][i]["value"]*item_cfg[goods.itemId]["other_value"]*goods.discount)
					break
				}
				return goods
			}
		}
	}
}


