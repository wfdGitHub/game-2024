const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const hero_quality = require("../../../../config/gameCfg/hero_quality.json")
const equip_slot = require("../../../../config/gameCfg/equip_slot.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const equip_lv = require("../../../../config/gameCfg/equip_lv.json")
const heros = require("../../../../config/gameCfg/heros.json")
const lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
const artifact_level = require("../../../../config/gameCfg/artifact_level.json")
const stone_base = require("../../../../config/gameCfg/stone_base.json")
const summon_list = require("../../../../config/gameCfg/summon_list.json")
const hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
const evolves = require("../../../../config/gameCfg/evolves.json")
const hufu_lv = require("../../../../config/gameCfg/hufu_lv.json")
const aptitudeCfg = require("../../../../config/gameCfg/aptitude.json")
const baseStone = {"1" : 4110,"2" : 4210,"3" : 4310,"4" : 4410}
const extra_list = ["M_HP","M_ATK","M_DEF","M_STK","M_SEF","M_SPE"]
var lv4Map = []
for(var i in hufu_skill)
	lv4Map.push(hufu_skill[i]["lv4"])
for(var i in summon_list){
	summon_list[i]["heros"] = JSON.parse(summon_list[i]["heros"])
	summon_list[i]["heroMap"] = {}
	for(var j = 0;j < summon_list[i]["heros"].length;j++)
		summon_list[i]["heroMap"][summon_list[i]["heros"][j]] = 1
	summon_list[i]["items"] = JSON.parse(summon_list[i]["items"])
	summon_list[i]["summonWeighs"] = [summon_list[i]["item_w"]]
	summon_list[i]["summonHandWeighs"] = [summon_list[i]["item_w"]*0.5]
	for(var j = 1;j <= 5;j++){
		summon_list[i]["summonWeighs"].push(summon_list[i]["summonWeighs"][j-1] + summon_list[i]["hero_w"+j])
		summon_list[i]["summonHandWeighs"].push(summon_list[i]["summonHandWeighs"][j-1] + summon_list[i]["hero_w"+j])
	}
}
var hufu_map = {}
for(var i in hufu_skill){
	for(var j = 1;j<= 5;j++){
		hufu_map[hufu_skill[i]["lv"+j]] = {"id":i,"lv":j}
	}
}
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
	//生成一个英雄
	this.makeHeroData = function(id,qa) {
		if(!heros[id])
			return {}
		var heroInfo = {}
		heroInfo.id = id
		heroInfo.evo = 1
		heroInfo.exalt = heros[id]["exalt"]
		heroInfo.qa = qa
		heroInfo.wash = 0
		heroInfo.lv = 1
		var c_info = this.createHero(heroInfo.id,heroInfo.qa,heroInfo.wash)
		Object.assign(heroInfo,c_info)
		return heroInfo
	}
	//生成英雄资质
	this.createHero = function(id,qa,wash,item) {
		var c_info = {}
		var extra = 0
		var skillNum = 0
		c_info.wash = wash
		//宠物异化
		var needRate = wash/300
		if(needRate)
			needRate += 0.2
		if(qa == 4 && Math.random() < needRate)
			qa = 5
		c_info.qa = qa
		//触发资质加成
		if(item || Math.random() < wash/200)
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
	//获取英雄战力
	this.getHeroCE = function(info) {
		if(!info)
			return 0
		var allCE = 0
		var evoId = evolve_lv[info.evo]["evoId"]
		var aptitude = exalt_lv[info.exalt]["aptitude"] || 1
		//主属性战力
		info["M_HP"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_HP"] * (info["MR1"] || 1))
		info["M_ATK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_ATK"] * (info["MR2"] || 1))
		info["M_DEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_DEF"] * (info["MR3"] || 1))
		info["M_STK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_STK"] * (info["MR4"] || 1))
		info["M_SEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SEF"] * (info["MR5"] || 1))
		info["M_SPE"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SPE"] * (info["MR6"] || 1))
		allCE += Math.floor((info["M_HP"]+info["M_ATK"]+info["M_DEF"]+info["M_STK"]+info["M_SEF"]+info["M_SPE"]) * 120 + aptitude * 1000)
		//技能战力
		for(var i = 0;i <= 10;i++)
			if(info["PS"+i])
				allCE += hufu_lv[hufu_map[info["PS"+i]].lv]["ce"]
		//等级战力
		if(info["lv"])
			allCE += lv_cfg[info["lv"]]["ce"]
		//专属战力
		if(info["artifact"] !== undefined)
			allCE += artifact_level[info["artifact"]]["ce"]
		//宝物战力
		for(var j = 1;j <= 10;j++)
			if(info["a"+j])
				allCE += ace_pack[info["a"+j]]["ce"]
		//装备战力
		for(var j = 1;j <= 4;j++){
			if(info["e"+j])
    			allCE += this.getEquipCE(info["e"+j])
		}
		//宝石战力
		for(var j = 1;j <= 4;j++){
			if(info["s"+j] && stone_base[info["s"+j]])
    			allCE += stone_base[info["s"+j]]["ce"]
		}
		//技能宝石
		for(var j = 5;j <= 8;j++){
			if(info["s"+j] && stone_skill[info["s"+j]])
    			allCE += stone_skill[info["s"+j]]["ce"]
		}
		//护符战力
		if(info["hfLv"] && hufu_quality[info["hfLv"]]){
			allCE += hufu_quality[info["hfLv"]]["ce"]
			if(info["hfs1"] && hufu_map[info["hfs1"]])
				allCE += hufu_lv[hufu_map[info["hfs1"]].lv]["ce"]
			if(info["hfs2"] && hufu_map[info["hfs2"]])
				allCE += hufu_lv[hufu_map[info["hfs2"]].lv]["ce"]
		}
		//战法战力
		for(var j = 1;j <= 3;j++){
			if(info["zf_"+j] && zhanfa[info["zf_"+j]])
    			allCE += zhanfa[info["zf_"+j]]["ce"]
		}
		return Math.ceil(allCE)
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
}
module.exports = model