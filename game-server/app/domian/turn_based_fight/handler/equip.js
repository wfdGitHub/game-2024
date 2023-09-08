//装备
const equip_lv = require("../../../../config/gameCfg/equip_lv.json")
const equip_qa = require("../../../../config/gameCfg/equip_qa.json")
const equip_slot = require("../../../../config/gameCfg/equip_slot.json")
const equip_suit = require("../../../../config/gameCfg/equip_suit.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const equip_spe = require("../../../../config/gameCfg/equip_spe.json")
var model = function() {}
//装备随机生成属性
model.createAtt = function(info) {
	var c_info = {}
	c_info.main_1 = equip_qa[info.qa]["mainRate"] * (Math.random() * 0.1 + 0.95)
	c_info.main_2 = equip_qa[info.qa]["mainRate"] * (Math.random() * 0.1 + 0.95)
	c_info.extra = model.createExtra(info,Math.floor(Math.random() * 3))
	return c_info
}
//装备随机生成额外属性
model.createExtra = function(info,type) {
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
model.createSpe = function(info) {
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
model.createSuit = function(info) {
	var index = Math.floor(Math.random() * equip_lv[info.lv]["suit_list"].length)
	if(equip_lv[info.lv]["suit_list"][index] == info.suit)
		index = (index+1)%equip_lv[info.lv]["suit_list"].length
	return equip_lv[info.lv]["suit_list"][index]
}

module.exports = model