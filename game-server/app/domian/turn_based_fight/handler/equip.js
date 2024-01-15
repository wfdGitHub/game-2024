//装备系统
const fightCfg = require("../fight/fightCfg.js")
const equip_lv = fightCfg.getCfg("equip_lv")
const equip_qa = fightCfg.getCfg("equip_qa")
const equip_slot = fightCfg.getCfg("equip_slot")
const equip_suit = fightCfg.getCfg("equip_suit")
const equip_st = fightCfg.getCfg("equip_st")
const equip_spe = fightCfg.getCfg("equip_spe")
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
	equip_lv[i]["high_weights"] = [0,0,5000,9400,10000]
	equip_lv[i]["suit_list"] = JSON.parse(equip_lv[i]["suit_list"])
}
var model = function(fightContorl) {
	//生成装备
	this.makeEquip = function(lv,slot,qa,item) {
		var info = {}
		info.lv = lv
		info.slot = slot
		if(qa)
			info.qa = qa
		else{
			if(item == 2003400){
				//强化打造
				info.qa = fightContorl.getWeightedRandomBySort(equip_lv[lv]["high_weights"]) + 1
			}else if(item == 2003500){
				//必定异化
				info.qa = 5
			}else{
				info.qa = fightContorl.getWeightedRandomBySort(equip_lv[lv]["qa_weights"]) + 1
			}
		}
		info.att = this.createEquipAtt(info)
		var spe = this.createeEquipSpe(info)
		if(spe)
			info.spe = spe
		if(info.qa >= 5)
			info.suit = this.createEquipSuit(info)
		return info
	}
	//生成基准战力装备
	this.makeStandardEquip = function(lv,slot,qa) {
		if(!equip_lv[lv])
			return ""
		var info = {}
		info.lv = lv
		info.slot = slot
		info.qa = qa
		info.att = {}
		info.att.main_1 = equip_qa[info.qa]["mainRate"]
		info.att.main_2 = equip_qa[info.qa]["mainRate"]
		info.att.extra = {}
		for(var i = 0;i < extra_list.length;i++)
			info.att.extra[extra_list[i]] = Math.ceil(equip_qa[info.qa]["extraRate"] * equip_lv[info.lv]["extra"] * 0.2)
		return JSON.stringify(info)
	}
	//获取装备属性
	this.getEquipData = function(eInfo) {
		eInfo = JSON.parse(eInfo)
		var info = {}
		info.id = Number(eInfo.id) || 1
		info.lv = eInfo.lv
		info.qa = eInfo.qa
		info.slot = eInfo.slot
		info.st = eInfo.st || 0
		info.carryLv = equip_lv[info.lv]["lv"]
		info.mainAtt = {}
		info.mainAtt[equip_slot[info.slot]["main_1"]] = equip_lv[info.lv]["mainRate"] * equip_slot[info.slot]["value_1"] * eInfo.att.main_1
		info.mainAtt[equip_slot[info.slot]["main_2"]] = equip_lv[info.lv]["mainRate"] * equip_slot[info.slot]["value_2"] * eInfo.att.main_2
		var extraNum = 0
		info.extraAtt = {}
		for(var i in eInfo.att.extra){
			if(i != "type"){
				info.extraAtt[i] = eInfo.att.extra[i]
				extraNum += eInfo.att.extra[i]
			}
		}
		info.spe = eInfo.spe || []
		var stRate = 1
		for(var i = 0;i < info.spe.length;i++){
			switch(info.spe[i]){
				case 9010:
					//强化装备基础属性增加6%
					for(var i in info.mainAtt)
						info.mainAtt[i] = info.mainAtt[i] * 1.06
				break
				case 9020:
					//祝福额外属性
					var extraType = extra_list[info.id%extra_list.length]
					var extraValue = Math.ceil(extraNum * 0.3)
					info.zfAtt = {}
					info.zfAtt[extraType] = extraValue
				break
				case 9030:
					//易成长 该部位的强化属性效果增加20%
					stRate = 1.2
				break
				case 9040:
					//简易  佩戴装备的等级要求-6
					info.carryLv -= 6
				break
			}
		}
		info.suit = Number(eInfo.suit) || false
		//装备属性增益
		for(var i in info.mainAtt){
			if(info.mainAtt[i] > 2)
				info.mainAtt[i] = Math.ceil(info.mainAtt[i])
			else
				info.mainAtt[i] = Number(info.mainAtt[i].toFixed(2))
		}
		info.stAtt = {}
		for(var i in info.mainAtt){
			info.stAtt[i] = info.mainAtt[i] * equip_st[info.st]["att"] * stRate
			if(info.stAtt[i] > 2)
				info.stAtt[i] = Math.ceil(info.stAtt[i])
			else
				info.stAtt[i] = Number(info.stAtt[i].toFixed(2))
		}
		//计算评分  (特效*100*装备等级 套装*100*装备等级   主属性倍率*属性倍率*100   附加属性和*100)
		info.score = Math.ceil(((info.spe.length + (info.suit ? 1.5 : 0)) * 200 * Math.sqrt(info.lv)) + (eInfo.att.main_1 + eInfo.att.main_2)*equip_lv[info.lv]["mainRate"]*80 + extraNum*40)
		return info
	}
	//获取装备战力
	this.getEquipCE = function(eInfo) {
		if(!eInfo)
			return 0
		//计算评分  (特效*100*装备等级 套装*100*装备等级   主属性倍率*属性倍率*100   附加属性和*100)
		var allCE = 0
		eInfo = JSON.parse(eInfo)
		//主属性战力
		allCE += (eInfo.att.main_1 + eInfo.att.main_2) * equip_lv[eInfo.lv]["mainRate"] * 360
		if(eInfo.st)
			allCE += Math.ceil(allCE * equip_st[eInfo.st]["att"])
		//附加属性战力
		var extraNum = 0
		for(var i in eInfo.att.extra)
			if(i != "type")
				extraNum += eInfo.att.extra[i]
		allCE += extraNum * 120
		//特效战力
		if(eInfo.spe)
			allCE += eInfo.spe.length * 400
		if(eInfo.suit)
			allCE += 600
		return Math.ceil(allCE)
	}
	//获取装备分解返还
	this.getEquipRecycle = function(list) {
		var map = {"201":0,"2003400":0,"2003000":0}
		for(var i = 0;i < list.length;i++){
			map["201"] += equip_lv[list[i]["lv"]]["pr"]
			if(list[i]["qa"] >= 5){
				if(equip_lv[list[i]["lv"]]["spe"])
					map["2003400"] += 1
			}
			if(list[i]["st"] && equip_st[list[i]["st"]]["pr"])
				map["2003000"] += equip_st[list[i]["st"]]["pr"]
		}
		var str = ""
		for(var i in map)
			if(map[i])
				str += i+":"+map[i]+"&"
		str = str.substr(0,str.length-1)
		return str
	}
	//装备随机生成属性
	this.createEquipAtt = function(info) {
		var c_info = {}
		c_info.main_1 = Number((equip_qa[info.qa]["mainRate"] * (Math.random() * 0.1 + 0.95)).toFixed(2))
		c_info.main_2 = Number((equip_qa[info.qa]["mainRate"] * (Math.random() * 0.1 + 0.95)).toFixed(2))
		c_info.extra = this.createEquipExtra(info,Math.floor(Math.random() * 3))
		return c_info
	}
	//装备随机生成额外属性
	this.createEquipExtra = function(info,type) {
		var extra = {}
		extra.type = type
		switch(type){
			case 0:
				//单加属性
				var list = fightContorl.getRandomArray(extra_list,1)
				for(var i = 0;i < list.length;i++)
					extra[list[i]] = Math.ceil(equip_qa[info.qa]["extraRate"] * (Math.random() * 0.2 + 0.85) * equip_lv[info.lv]["extra"] * 0.75)
			break
			case 1:
				//双加属性
				var list = fightContorl.getRandomArray(extra_list,2)
				for(var i = 0;i < list.length;i++)
					extra[list[i]] = Math.ceil(equip_qa[info.qa]["extraRate"] * (Math.random() * 0.2 + 0.85) * equip_lv[info.lv]["extra"] * 0.5)
			break
			default:
				//加减属性
				var list = fightContorl.getRandomArray(extra_list,2)
				var rate = (Math.random() * 0.2 + 0.85)
				extra[list[0]] = Math.ceil(equip_qa[info.qa]["extraRate"] * rate * equip_lv[info.lv]["extra"] * 0.9)
				extra[list[1]] = Math.ceil(equip_qa[info.qa]["extraRate"] * rate * equip_lv[info.lv]["extra"] * -0.3)
		}
		return extra
	}
	//装备随机生成特效
	this.createeEquipSpe = function(info) {
		if(!equip_lv[info.lv]["spe"])
			return false
		var spe = []
		var count = fightContorl.getWeightedRandomBySort(equip_qa[info.qa].speWeights)
		if(count > 0)
			return fightContorl.getRandomArray(equip_slot[info.slot]["spe_list"],count)
		else
			return false
	}
	//装备随机生成套装
	this.createEquipSuit = function(info) {
		var index = Math.floor(Math.random() * equip_lv[info.lv]["suit_list"].length)
		if(equip_lv[info.lv]["suit_list"][index] == info.suit)
			index = (index+1)%equip_lv[info.lv]["suit_list"].length
		return equip_lv[info.lv]["suit_list"][index]
	}
}
module.exports = model