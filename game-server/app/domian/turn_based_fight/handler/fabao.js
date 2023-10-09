//法宝
const fightCfg = require("../fight/fightCfg.js")
const fabao_type = fightCfg.getCfg("fabao_type")
const fabao_qa = fightCfg.getCfg("fabao_qa")
const fabao_slot = fightCfg.getCfg("fabao_slot")
const fabao_lv = fightCfg.getCfg("fabao_lv")
const fabao_att = fightCfg.getCfg("fabao_att")
const fabao_spe = fightCfg.getCfg("fabao_spe")
var fabaoList = []
for(var i in fabao_type){
	if(!fabao_type[i].limit){
		fabao_type[i].type = i
		fabaoList.push(fabao_type[i])
	}
}
var speList1 = []
var speList2 = []
for(var i in fabao_spe){
	if(fabao_spe[i]["type"] == 1)
		speList1.push(i)
	else
		speList2.push(i)
}
const main_name = "fabao"
var model = function(fightContorl) {
	var local = {}
	//生成法宝
	this.makeFabao = function(qa,type) {
		var fInfo = {}
		var typeData = fabao_qa[type] || fabaoList[Math.floor(Math.random() * fabaoList.length)]
		fInfo.type = typeData.type
		fInfo.qa = qa || 1
		fInfo.lv = 1
		var qaData = fabao_qa[fInfo.qa]
		//属性
		for(var i = 1;i <= 4;i++)
			fInfo["M"+i] = Math.random() * (qaData.max_rate - qaData.min_rate) + qaData.min_rate
		//特效
		fInfo.spe = []
		var speCount = Math.floor(Math.random() * qaData.begin) + 1
		var highCount = 0
		for(var i = 0;i < speCount;i++)
			if(Math.random() < qaData.high)
				highCount++
		if(highCount)
			fInfo.spe = fightContorl.getRandomArray(speList2,highCount)
		fInfo.spe = fInfo.spe.concat(fightContorl.getRandomArray(speList1,speCount - highCount))
		return fInfo
	}
	//获取法宝属性
	this.getFabaoData = function(fstr) {
		var fInfo = JSON.parse(fstr)
		var info = {}
		info.type = Number(fInfo.type) || 1
		info.lv = fInfo.lv
		info.qa = fInfo.qa
		info.point = fabao_lv[fInfo.lv]["point"]
		var qaData = fabao_qa[fInfo.qa]
		info.mainAtt = {}
		info.mainAtt["atk"] = Math.floor(fInfo["M1"] * qaData["atk"])
		info.mainAtt["maxHP"] = Math.floor(fInfo["M2"] * qaData["maxHP"])
		info.mainAtt["phyDef"] = Math.floor(fInfo["M3"] * qaData["phyDef"])
		info.mainAtt["magDef"] = Math.floor(fInfo["M4"] * qaData["magDef"])
		info.mainRate = fabao_lv[fInfo.lv]["att"]
		info.extraLv = 0
		info.extraSkill = 0
		info.spe = fInfo.spe || []
		for(var i = 0;i < info.spe.length;i++){
			switch(info.spe[i]){
				case "fabao_7010":
					//强化  基础属性+8%
					for(var i in info.mainAtt)
						info.mainAtt[i] = Math.floor(info.mainAtt[i] * 1.08)
				break
				case "fabao_8010":
					//高级强化  基础属性+12%
					for(var i in info.mainAtt)
						info.mainAtt[i] = Math.floor(info.mainAtt[i] * 1.12)
				break
				case "fabao_7030":
					//启灵精通
					info.point += 3
				break
				case "fabao_8030":
					//高级启灵精通
					info.point += 6
				break
				case "fabao_7040":
					//蕴养提升 蕴养等级+2（不增加启灵点且不影响法宝技能）
					info.extraLv = 2
				case "fabao_7020":
					//成长  蕴养属性+4%
					info.mainRate += 0.04
				break
				case "fabao_7040":
					//高级蕴养提升 蕴养等级+3（不增加启灵点且不影响法宝技能）
					info.extraLv = 3
				case "fabao_7020":
					//高级成长  蕴养属性+6%
					info.mainRate += 0.06
				break
				case "fabao_8110":
					//高级技能精进 主技能等级+1
					info.extraSkill = 1
				break
			}
		}
		info.realAtt = {}
		for(var i in info.mainAtt)
			info.realAtt[i] = Math.floor(info.mainAtt[i] * (1+info.mainRate))
		var lowCount = 0
		var highCount = 0
		for(var i = 0;i < info.spe.length;i++){
			if(fabao_spe[info.spe[i]["type"]] == 1)
				lowCount++
			else
				highCount++
		}
		info.slotTalents = []
		if(fInfo.slots){
			for(var i in fInfo.slots){
				if(fInfo.slots[i]){
					var lv = fInfo.slots[i]
					if(i == 1 && info.extraSkill)
						lv += 1
					var attId = fabao_type[fInfo.type]["slot_"+i]
					if(attId && fabao_att[attId]["lv_"+lv])
						info.slotTalents.push(fabao_att[attId]["lv_"+lv])
				}
			}
		}
		//计算评分
		info.score = Math.floor(fInfo["M1"]+fInfo["M2"]+fInfo["M3"]+fInfo["M4"] * 60 + info.qa * 80 + lowCount * 40 + highCount * 80)
		return info
	}
	//获取法宝战力
	this.getFabaoCE = function(fstr) {
		if(!fstr)
			return 0
		var fInfo = JSON.parse(fstr)
		var info = {}
		info.lv = fInfo.lv
		info.qa = fInfo.qa
		var qaData = fabao_qa[fInfo.qa]
		info.mainAtt = {}
		info.mainAtt["atk"] = Math.floor(fInfo["M1"] * qaData["atk"])
		info.mainAtt["maxHP"] = Math.floor(fInfo["M2"] * qaData["maxHP"])
		info.mainAtt["phyDef"] = Math.floor(fInfo["M3"] * qaData["phyDef"])
		info.mainAtt["magDef"] = Math.floor(fInfo["M4"] * qaData["magDef"])
		info.mainRate = fabao_lv[fInfo.lv]["att"]
		info.spe = fInfo.spe || []
		for(var i = 0;i < info.spe.length;i++){
			switch(info.spe[i]){
				case "fabao_7010":
					//强化  基础属性+8%
					for(var i in info.mainAtt)
						info.mainAtt[i] = Math.floor(info.mainAtt[i] * 1.08)
				break
				case "fabao_8010":
					//高级强化  基础属性+12%
					for(var i in info.mainAtt)
						info.mainAtt[i] = Math.floor(info.mainAtt[i] * 1.12)
				break
				case "fabao_7040":
				case "fabao_7020":
					//成长  蕴养属性+4%
					info.mainRate += 0.04
				break
				case "fabao_7040":
				case "fabao_7020":
					//高级成长  蕴养属性+6%
					info.mainRate += 0.06
				break
			}
		}
		var lowCount = 0
		var highCount = 0
		for(var i = 0;i < info.spe.length;i++){
			if(fabao_spe[info.spe[i]["type"]] == 1)
				lowCount++
			else
				highCount++
		}
		info.realAtt = {}
		for(var i in info.mainAtt)
			info.realAtt[i] = Math.floor(info.mainAtt[i] * (1+info.mainRate))
		var ce = Math.floor(((info.realAtt["atk"] + info.realAtt["phyDef"] + info.realAtt["magDef"]) * 6 + info.realAtt["maxHP"]) + lowCount * 500 + highCount * 1000) 
		return ce
	}
	//法宝洗练 新天赋从两个法宝中继承  紫橙有概率提高品质，红品有概率技能+1  获得两个结果
	this.washFabao = function(fstr1,fstr2) {
		var fInfo = JSON.parse(fstr1)
		var fInfo2 = JSON.parse(fstr2)
		var qaData = fabao_qa[fInfo.qa]
		delete fInfo.lv
		var up_rand = Math.random()
		//主属性
		for(var i = 1;i <= 4;i++)
			fInfo["M"+i] = Math.random() * (qaData.max_rate - qaData.min_rate) + qaData.min_rate
		//特效
		var speLen1 = fInfo.spe.length
		var speLen2 = fInfo2.spe.length
		var speMap = {}
		var speList = []
		for(var i = 0;i < fInfo.spe.length;i++)
			speMap[fInfo.spe[i]] = 1
		for(var i = 0;i < fInfo2.spe.length;i++)
			speMap[fInfo2.spe[i]] = 1
		for(var i in speMap)
			speList.push(i)
		var min = Math.min(speLen1,speLen2)
		var max = Math.min(Math.max(speLen1,speLen2),speList.length)
		var newLen = Math.max(Math.round(Math.random() * (max - min + 1)) + min - 1,1)
		fInfo.spe = fightContorl.getRandomArray(speList,newLen)
		//概率提升品质
		if(fInfo.qa < 5 && up_rand < qaData["recast_up"])
			fInfo.qa++
		delete fInfo.wash1
		delete fInfo.wash2
		return fInfo
	}
	//法宝加点
	this.slotPointFabao = function(fStr,slots) {
		var fData = this.getFabaoData(fStr)
		var point = fData.point
		var need = 0
		for(var i in slots){
			if(!fabao_slot[i] || !Number.isInteger(slots[i]) || slots[i] < 1 || slots[i] > fabao_slot[i]["maxLv"])
				return false
			for(var j = 1;j <= slots[i];j++)
				need += fabao_slot[i]["p"+j]
		}
		if(need > point)
			return false
		return true
	}
	//获取法宝分解返还
	this.getFabaoRecycle = function(list) {
		var value = 0
		for(var i = 0;i < list.length;i++){
			value += fabao_lv[list[i]["lv"]]["pr"]
			value += fabao_qa[list[i]["qa"]]["pr"]
		}
		return "2000:"+value
	}
	//基准战力法宝
}
module.exports = model