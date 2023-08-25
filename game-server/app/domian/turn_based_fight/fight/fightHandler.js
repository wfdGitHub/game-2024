const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const hero_quality = require("../../../../config/gameCfg/hero_quality.json")
const equip_slot = require("../../../../config/gameCfg/equip_slot.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const equip_lv = require("../../../../config/gameCfg/equip_lv.json")
const lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
const artifact_level = require("../../../../config/gameCfg/artifact_level.json")
const stone_base = require("../../../../config/gameCfg/stone_base.json")
const extra_list = ["M_HP","M_ATK","M_DEF","M_STK","M_SEF","M_SPE"]
const baseStone = {"1" : 4110,"2" : 4210,"3" : 4310,"4" : 4410}
var model = function() {
	//获取进化概率
	this.getHeroEvoRate = function(heroInfo,herolist) {
		var need = evolve_lv[heroInfo["evo"]]["need"] * exalt_lv[heroInfo["exalt"]]["rate"]
		var cur = 0
		for(var i in herolist){
			var qaRate = 1
			if(heroInfo.id == herolist[i].id)
				qaRate *= 1.5
			qaRate *= hero_quality[herolist[i].qa]["rete"]
			cur += exalt_lv[herolist[i]["exalt"]]["basic"] * qaRate
		}
		var rate = cur/need
		if(heroInfo.evoRate)
			rate += Number(heroInfo.evoRate) || 0
		return Math.min(Number(rate.toFixed(2)),1)
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
		info.ce = Math.ceil(info.score * 6 * (1+equip_st[info.st]["att"]))
		return info
	}
	//获取英雄分解返还
	this.getHeroRecycle = function(list) {
		var strList = []
		var hufuList = []
		var map = {"2000030":0,"2000050":0}
		for(var i = 0;i < list.length;i++){
			var id = list[i].id
			var lv = list[i].lv
			map["2000030"] += Math.round(evolve_lv[list[i]["evo"]]["pr"] * exalt_lv[list[i]["lv"]]["prRate"])
			if(list[i]["qa"] >= 5)
				map["2000050"] += 1
			//等级返还
			if(lv_cfg[lv] && lv_cfg[lv].pr)
				strList.push(lv_cfg[lv].pr)
			//宝物返还
			for(var j = 0;j <= 10;j++){
				if(list[i]["a"+j])
					strList.push(list[i]["a"+j]+":1")
			}
			var artifact = list[i].artifact
			//专属返还
			if(artifact !== undefined && artifact_level[artifact])
				strList.push(artifact_level[artifact]["pr"])
			//宝石返还
			for(var j = 1;j <= 8;j++){
				var key = "s"+j
				if(list[i][key]){
					//拆卸宝石
					strList.push(list[i][key]+":1")
					if(list[i][key+"v"] && stone_base[list[i][key]]){
						var num = Math.floor(list[i][key+"v"] / stone_base[baseStone[j]]["value"])
						strList.push(baseStone[j]+":"+num)
					}
				}
			}
			//护符返还
			if(list[i]["hfLv"]){
				var hufuInfo = {lv:list[i]["hfLv"]}
				if(list[i]["hfs1"])
					hufuInfo.s1 = list[i]["hfs1"]
				if(list[i]["hfs2"])
					hufuInfo.s2 = list[i]["hfs2"]
				hufuList.push(hufuInfo)
			}
		}
		var str = ""
		for(var i in map)
			if(map[i])
				str += i+":"+map[i]+"&"
		for(var i in strList)
			str += strList[i]+"&"
		str = str.substr(0,str.length-1)
		return {awardStr : str,hufuList:hufuList}
	}
	//获取装备分解返还
	this.getEquipRecycle = function(list) {
		var map = {"201":0,"2003400":0}
		for(var i = 0;i < list.length;i++){
			map["201"] += equip_lv[list[i]["lv"]]["pr"]
			if(list[i]["qa"] >= 5){
				if(equip_lv[list[i]["lv"]]["spe"])
					map["2003400"] += 1
			}
		}
		var str = ""
		for(var i in map)
			if(map[i])
				str += i+":"+map[i]+"&"
		str = str.substr(0,str.length-1)
		return str
	}
}
module.exports = model