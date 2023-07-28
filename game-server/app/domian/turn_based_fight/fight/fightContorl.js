const standard_ce_cfg = require("../../../../config/gameCfg/standard_ce.json")
const standard_dl = require("../../../../config/gameCfg/standard_dl.json")
const stone_lv = require("../../../../config/gameCfg/stone_lv.json")
const skillsCfg = require("../../../../config/gameCfg/skills.json")
const herosCfg = require("../../../../config/gameCfg/heros.json")
const lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
const star_base = require("../../../../config/gameCfg/star_base.json")
const hero_ad = require("../../../../config/gameCfg/hero_ad.json")
const hero_tr = require("../../../../config/gameCfg/hero_tr.json")
const advanced_talent = require("../../../../config/gameCfg/advanced_talent.json")
const talent_list = require("../../../../config/gameCfg/talent_list.json")
const equip_base = require("../../../../config/gameCfg/equip_base.json")
const equip_level = require("../../../../config/gameCfg/equip_level.json")
const equip_st = require("../../../../config/gameCfg/equip_st.json")
const ace_pack = require("../../../../config/gameCfg/ace_pack.json")
const artifact_level = require("../../../../config/gameCfg/artifact_level.json")
const artifact_talent = require("../../../../config/gameCfg/artifact_talent.json")
const stone_base = require("../../../../config/gameCfg/stone_base.json")
const stone_skill = require("../../../../config/gameCfg/stone_skill.json")
const book_list = require("../../../../config/gameCfg/book_list.json")
const book_lv = require("../../../../config/gameCfg/book_lv.json")
const book_star = require("../../../../config/gameCfg/book_star.json")
const guild_cfg = require("../../../../config/gameCfg/guild_cfg.json")
const guild_skill = require("../../../../config/gameCfg/guild_skill.json")
const hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
const hufu_quality = require("../../../../config/gameCfg/hufu_quality.json")
const hufu_lv = require("../../../../config/gameCfg/hufu_lv.json")
const heroSpine = require("../../../../config/gameCfg/heroSpine.json")
const skin_list = require("../../../../config/gameCfg/skin_list.json")
const title_list = require("../../../../config/gameCfg/title_list.json")
const zhanfa = require("../../../../config/gameCfg/zhanfa.json")
const officer = require("../../../../config/gameCfg/officer.json")
const camp_att = require("../../../../config/gameCfg/camp_att.json")
const war_horse = require("../../../../config/gameCfg/war_horse.json")
const war_drum = require("../../../../config/gameCfg/war_drum.json")
const war_banner = require("../../../../config/gameCfg/war_banner.json")
const manor_gjy = require("../../../../config/gameCfg/manor_gjy.json")
const manor_dby = require("../../../../config/gameCfg/manor_dby.json")
const manor_qby = require("../../../../config/gameCfg/manor_qby.json")
const aptitudeCfg = require("../../../../config/gameCfg/aptitude.json")
const evolutionCfg = require("../../../../config/gameCfg/evolution.json")
const beauty_base = require("../../../../config/gameCfg/beauty_base.json")
var fightingFun = require("./fighting.js")
var fightRecord = require("./fightRecord.js")
var character = require("../entity/character.js")
var masterEntity = require("../entity/master.js")
var bingfuEntity = require("../entity/bingfuEntity.js")
var powerEntity = require("../entity/powerEntity.js")
var bookIds = ["singleAtk","backDamage","frontDamage","banishBook","angerAddBook","angerLessBook","reductionBuff","seckill","singleHeal"]
var bookList = {}
var bookMap = {}
var gSkillAtts = {}
var hufuSkillCes = {}
var fightVerifyInfo = {}
for(var i = 0;i < bookIds.length;i++){
	bookList[bookIds[i]] = require("../books/"+bookIds[i]+".js")
}
for(var i in book_list){
	bookMap[book_list[i]["type"]] = []
	for(var j = 0;j < 6;j++){
		bookMap[book_list[i]["type"]][j] = JSON.parse(book_list[i]["otps_"+j])
	}
}
for(var i = 1;i <= 4;i++){
	gSkillAtts[i] = JSON.parse(guild_cfg["career_"+i]["value"])
}
var hufu_map = {}
for(var i in hufu_skill){
	for(var j = 1;j<= 5;j++){
		hufu_map[hufu_skill[i]["lv"+j]] = {"id":i,"lv":j}
		hufuSkillCes[hufu_skill[i]["lv"+j]] = 50000 * j
	}
}
var standard_ce = {}
var standard_team_ce = {}
var trMap = [0,"maxHP","atk","phyDef","magDef"]
for(var i in standard_ce_cfg){
	standard_ce[i] = {
		"lv" : standard_ce_cfg[i]["lv"],
		"ad" : standard_ce_cfg[i]["ad"],
		"star" : standard_ce_cfg[i]["star"],
		"artifact" : standard_ce_cfg[i]["artifact"],
		"tr_lv" : standard_ce_cfg[i]["tr"],
		"evo" : standard_ce_cfg[i]["evo"],
		"crit" : standard_ce_cfg[i]["crit"],
		"critDef" : standard_ce_cfg[i]["critDef"],
		"slay" : standard_ce_cfg[i]["slay"],
		"slayDef" : standard_ce_cfg[i]["slayDef"],
		"hitRate" : standard_ce_cfg[i]["hitRate"],
		"dodgeRate" : standard_ce_cfg[i]["dodgeRate"]
	}
	standard_team_ce[i] = {}
	for(var j = 1;j <= 4;j++){
		standard_ce[i]["e"+j] = standard_ce_cfg[i]["equip"]
		if(stone_lv[standard_ce_cfg[i]["stone_lv"]])
		standard_ce[i]["s"+j] = stone_lv[standard_ce_cfg[i]["stone_lv"]]["s"+j]
		standard_ce[i]["et"+j] = standard_ce_cfg[i]["st"]
		standard_team_ce[i]["g"+j] = standard_ce_cfg[i]["guild"]
		if(standard_ce[i]["tr_lv"])
			standard_ce[i]["tr_"+trMap[j]] = hero_tr[standard_ce[i]["tr_lv"]][trMap[j]]
	}
	standard_team_ce[i]["officer"] = standard_ce_cfg[i]["officer"]
}
const coexisATT = ["lv","ad","artifact","tr_lv","tr_maxHP","tr_atk","tr_phyDef","tr_magDef","et1","et2","et3","et4"]
var coexistLvMap = []
for(var i in standard_ce){
	for(var j = coexistLvMap.length;j <= standard_ce[i]["lv"];j++){
		coexistLvMap[j] = Object.assign({},standard_ce[i],{"lv":j})
	}
}
//战斗控制器
var model = function() {
	this.fighting = false
	this.overInfo = {}
}
model.bingfuEntity = bingfuEntity
model.powerEntity = powerEntity
// //自定义战斗配置// model.libertyFight = function(atkTeam,defTeam,otps) {
// 	var fighting = new fightingFun(atkTeam,defTeam,otps)
// 	fighting.nextRound()
// 	return fightRecord.getList()
// }
model.loadFight = function(atkTeam,defTeam,otps) {
	if(!otps.seededNum)
		otps.seededNum = Date.now()
	fightVerifyInfo.atkTeam = JSON.parse(JSON.stringify(atkTeam))
	fightVerifyInfo.defTeam = JSON.parse(JSON.stringify(defTeam))
	if(fightVerifyInfo.atkTeam[0])
		delete fightVerifyInfo.atkTeam[0]["manualModel"]
	if(fightVerifyInfo.defTeam[0])
		delete fightVerifyInfo.defTeam[0]["manualModel"]
	fightVerifyInfo.otps = {}
	fightVerifyInfo.otps.seededNum = otps.seededNum
    var atkInfo = this.getTeamData(atkTeam,"atk")
    var defInfo = this.getTeamData(defTeam,"def")
    var myotps = Object.assign({},otps)
    myotps.atkTeamAdds = atkInfo.teamAdds
    myotps.defTeamAdds = defInfo.teamAdds
	this.fighting = new fightingFun(atkInfo,defInfo,myotps)
	return this.fighting
}
//自动战斗
model.beginFight = function(atkTeam,defTeam,otps) {
	otps.manual = false
	var fighting = model.loadFight(atkTeam,defTeam,otps)
	fighting.fightBegin()
	return fightRecord.isWin()
}
//录像战斗
model.videoFight = function(atkTeam,defTeam,otps) {
	otps.video = true
	return model.beginFight(atkTeam,defTeam,otps)
}
//获取校验数据
model.getVerifyInfo = function() {
	if(this.fighting && fightVerifyInfo){
		fightVerifyInfo.otps.masterSkills = this.fighting.masterSkills
		for(var i = 0;i < 6;i++){
			if(fightVerifyInfo.atkTeam[i]){
				delete fightVerifyInfo.atkTeam[i]["combat"]
				delete fightVerifyInfo.atkTeam[i]["hId"]
			}
			if(fightVerifyInfo.defTeam[i]){
				delete fightVerifyInfo.defTeam[i]["combat"]
				delete fightVerifyInfo.defTeam[i]["hId"]
			}
		}
	}
	return JSON.stringify(fightVerifyInfo)
}
//手动战斗
model.manualFight = function(atkTeam,defTeam,otps) {
	otps.manual = true
	var fighting = model.loadFight(atkTeam,defTeam,otps)
	fighting.fightBegin()
	return fighting
}
//战斗校验
model.fightVerifyCheck = function() {
	var list1 = fightRecord.getList()
	var overInfo1 = list1[list1.length-1]
	fightVerifyInfo.otps.video = true
	fightVerifyInfo.otps.masterSkills = overInfo1.masterSkills
	var fighting = this.beginFight(fightVerifyInfo.atkTeam,fightVerifyInfo.defTeam,fightVerifyInfo.otps)
	var list2 = fightRecord.getList()
	var overInfo2 = list2[list2.length-1]
	var d1 = JSON.stringify(list1)
	var d2 = JSON.stringify(list2)
	if(d1 != d2){
		console.log("战斗校验错误",d1.length,d2.length)
		console.log(d1)
		console.log(d2)
		for(var i = 0;i < list1.length;i++){
			var l1 = JSON.stringify(list1[i])
			var l2 = JSON.stringify(list2[i])
			if(l1 != l2){
				console.log("错误发生在第"+i+"项")
				console.log(l1)
				console.log(l2)
				var str = ""
				for(var j = 0;j < l1.length;j++){
					if(l1[j] != l2[j]){
						console.log("详细信息:第"+j+"行",str)
						return
					}else{
						str += l1[j]
					}
				}
				break
			}
		}
	}else{
		console.log("战斗校验成功")
	}
}
model.getOverInfo = function() {
	var overInfo = fightRecord.list[fightRecord.list.length-1]
	if(overInfo && overInfo["type"] == "fightOver")
		return fightRecord.list[fightRecord.list.length-1]
	else
		return {"err":"not find overInfo"}
}
//获取种族加成类型
model.getRaceType = function(team) {
	var raceList = {"1" : 0,"2" : 0, "3" : 0, "4" : 0,"5" : 0}
	var type = 0
	for(var i = 0;i < team.length;i++){
		if(team[i]){
			raceList[team[i].realm]++
		}
	}
	if(raceList[4] >= 6 || raceList[5] >= 6){
		type = 7
	}else if(raceList[1] >= 6 || raceList[2] >= 6 || raceList[3] >= 6){
		type = 3
	}else if(raceList[1] >= 1 && raceList[2] >= 1 && raceList[3] >= 1 && raceList[4] >= 1 && raceList[5] >= 1){
		type = 8
	}else if(raceList[1] == 2 && raceList[2] == 2 && raceList[3] == 2){
		type = 4
	}else if(raceList[4] >= 4 || raceList[5] >= 4){
		type = 6
	}else if(raceList[1] >= 4 || raceList[2] >= 4 || raceList[3] >= 4){
		type = 2
	}else if(raceList[4] >= 2 || raceList[5] >= 2){
		type = 5
	}else if(raceList[1] >= 2 || raceList[2] >= 2 || raceList[3] >= 2){
		type = 1
	}
	return type
}
//种族加成
model.raceAdd = function(raceType) {
	switch(raceType){
		case 1:
		return {"atk" : 0.05,"maxHP" : 0.07}
		case 2:
		return {"atk" : 0.08,"maxHP" : 0.12}
		case 3:
		return {"atk" : 0.16,"maxHP" : 0.22}
		case 4:
		return {"atk" : 0.14,"maxHP" : 0.18}
		case 5:
		return {"atk" : 0.07,"maxHP" : 0.1}
		case 6:
		return {"atk" : 0.12,"maxHP" : 0.16}
		case 7:
		return {"atk" : 0.2,"maxHP" : 0.3}
		case 8:
		return {"atk" : 0.15,"maxHP" : 0.2}
		default:
		return {}
	}
}
model.getFightRecord = function() {
	return fightRecord.getList()
}
model.getFightStageRecord = function() {
	return fightRecord.getStageList()
}
//获取角色数据
model.getCharacterInfo = function(info,heroAtts,teamCfg) {
	if(!info || !herosCfg[info.id]){
		return false
	}
	info = Object.assign({},info)
	info.heroAtts = heroAtts
	let id = info.id
	var aptitude = herosCfg[id].aptitude
	if(info.aptitude)
		aptitude += Number(info.aptitude) || 0
	model.mergeData(info,herosCfg[id])
	//被动技能
	if(herosCfg[info.id]["talent1"])
		model.mergeTalent(info,herosCfg[info.id]["talent1"])
	if(herosCfg[info.id]["talent2"])
		model.mergeTalent(info,herosCfg[info.id]["talent2"])
	if(herosCfg[info.id]["talent3"])
		model.mergeTalent(info,herosCfg[info.id]["talent3"])
	//初始属性
	var lvInfo = {
	    "maxHP":aptitudeCfg[aptitude].maxHP,
	    "atk": aptitudeCfg[aptitude].atk,
	    "phyDef": aptitudeCfg[aptitude].phyDef,
	    "magDef": aptitudeCfg[aptitude].magDef
	}
	//进化计算
	if(info.evo){
		if(evolutionCfg[info.evo]){
			lvInfo.maxHP += evolutionCfg[info.evo].maxHP || 0
			lvInfo.atk += evolutionCfg[info.evo].atk || 0
			lvInfo.phyDef += evolutionCfg[info.evo].phyDef || 0
			lvInfo.magDef += evolutionCfg[info.evo].magDef || 0
			aptitude += evolutionCfg[info.evo].aptitude || 0
		}
	}
	//等级计算
	if(info.lv && lv_cfg[info.lv]){
		var growth = aptitudeCfg[aptitude].growth
		if(aptitudeCfg[herosCfg[id].aptitude] && aptitudeCfg[herosCfg[id].aptitude]["extra"])
			growth += aptitudeCfg[herosCfg[id].aptitude]["extra"]
		lvInfo.maxHP += Math.floor(lv_cfg[info.lv].maxHP * growth)
		lvInfo.atk += Math.floor(lv_cfg[info.lv].atk * growth)
		lvInfo.phyDef += Math.floor(lv_cfg[info.lv].phyDef * growth)
		lvInfo.magDef += Math.floor(lv_cfg[info.lv].magDef * growth)
		lvInfo.speed += lv_cfg[info.lv].speed
	}
	model.mergeData(info,lvInfo)
	//装备计算
	let equip_suit = {}
	for(let part = 1;part <= 4;part++){
		let elv = info["e"+part]
		if(elv && equip_level[elv]){
			if(!equip_suit[elv])
				equip_suit[elv] = 0
			equip_suit[elv]++
			let oldeId = equip_level[elv]["part_"+part]
			let strs = equip_base[oldeId]["pa"].split("&")
			let equipInfo = {}
			strs.forEach(function(m_str) {
				let m_list = m_str.split(":")
				equipInfo[m_list[0]] = Number(m_list[1])
			})
			model.mergeData(info,equipInfo)
		}
	}
	//套装加成
	for(let elv in equip_suit){
		for(let suitlv = 2;suitlv <= equip_suit[elv];suitlv++){
			if(equip_level[elv]["suit_"+suitlv]){
				let m_list = equip_level[elv]["suit_"+suitlv].split(":") 
				let suitInfo = {}
				suitInfo[m_list[0]] = Number(m_list[1])
				model.mergeData(info,suitInfo)
			}
			if(equip_level[elv]["suit_"+suitlv+"_talent"]){
				model.mergeTalent(info,equip_level[elv]["suit_"+suitlv+"_talent"])
			}
		}
	}
	//装备强化
	var minETLv = 0
	for(var part = 1;part <= 4;part++){
		var etlv = info["et"+part] || 0
		if(!minETLv || etlv < minETLv)
			minETLv = etlv
		if(etlv && equip_st[etlv]){
			var m_list = equip_st[etlv]["slot_"+part].split(":")
			var etInfo = {}
			etInfo[m_list[0]] = Number(m_list[1])
			model.mergeData(info,etInfo)
		}
	}
	if(minETLv && equip_st[minETLv]["att"])
		model.mergeData(info,{"self_atk_add" : equip_st[minETLv]["att"],"self_maxHP_add" : equip_st[minETLv]["att"]})
	//升星计算
	if(info.star){
		if(advanced_talent[info.id]){
			let starInfo = {}
			for(let i = 1;i <= info.star && i <= 15;i++){
				let talentId = advanced_talent[info.id]["talent_"+i]
				if(talentId)
					model.mergeTalent(starInfo,talentId)
			}
			// console.log("starInfo",starInfo)
			model.mergeData(info,starInfo)
		}
		if(star_base[info.star] && star_base[info.star]["att"]){
			let strs = star_base[info.star]["att"].split("&")
			let starInfo = {}
			strs.forEach(function(m_str) {
				let m_list = m_str.split(":")
				starInfo[m_list[0]] = Number(m_list[1])
			})
			model.mergeData(info,starInfo)
		}
		if(info.star >= 20 && info["fs5"] == 1)
			model.mergeTalent(info,advanced_talent[info.id]["talent_20"])
	}
	//进阶计算
	if(info.ad){
		if(hero_ad[info.ad] && hero_ad[info.ad]["att"]){
			let strs = hero_ad[info.ad]["att"].split("&")
			let advancedInfo = {}
			strs.forEach(function(m_str) {
				let m_list = m_str.split(":")
				advancedInfo[m_list[0]] = Number(m_list[1])
			})
			model.mergeData(info,advancedInfo)
		}
	}
	//锦囊计算
	for(let i = 1;i <= 10;i++){
		if(info["a"+i]){
			let talentId = ace_pack[info["a"+i]]["pa"]
			model.mergeTalent(info,talentId)
		}
	}
	//培养计算
	var trInfo = {
	    "maxHP": info["tr_maxHP"] || 0,
	    "atk": info["tr_atk"] || 0,
	    "phyDef": info["tr_phyDef"] || 0,
	    "magDef": info["tr_magDef"] || 0
	}
	if(info["tr_lv"]){
		trInfo["amplify"] = hero_tr[info["tr_lv"]]["att"]
		trInfo["reduction"] = hero_tr[info["tr_lv"]]["att"]
	}
	model.mergeData(info,trInfo)
	//神器计算
	if(info["artifact"] !== undefined){
		let artifact = info["artifact"]
		let lvInfo = {
		    "maxHP": artifact_level[artifact].maxHP,
		    "atk": artifact_level[artifact].atk,
		    "phyDef": artifact_level[artifact].phyDef,
		    "magDef": artifact_level[artifact].magDef,
		    "speed" : artifact_level[artifact].speed
		}
		model.mergeData(info,lvInfo)
		for(let i = 0;i <= artifact;i++){
			if(artifact_level[i].talent){
				let talentId = artifact_level[i].talent
				model.mergeTalent(info,talentId)
			}
		}
		if(artifact >= 25){
			if(artifact_talent[info.id]){
				let talentId = artifact_talent[info.id].talent
				model.mergeTalent(info,talentId)
			}
		}
	}
	//属性宝石计算
	var stonebaseInfo = {}
	for(var i = 1;i <= 4;i++){
		if(info["s"+i] && stone_base[info["s"+i]]){
			stonebaseInfo[stone_base[info["s"+i]]["key"]] = stone_base[info["s"+i]]["arg"]
		}
	}
	model.mergeData(info,stonebaseInfo)
	//技能宝石计算
	var stoneskillInfo = {}
	for(var i = 5;i <= 8;i++){
		if(info["s"+i] && stone_skill[info["s"+i]]){
			stoneskillInfo[stone_skill[info["s"+i]]["key"]] = stone_skill[info["s"+i]]["arg"]
		}
	}
	model.mergeData(info,stoneskillInfo)
	//公会技能计算
	if(teamCfg && teamCfg["g"+info.career] && gSkillAtts[info.career]){
		var glv = teamCfg["g"+info.career]
		var gInfo = {}
		for(var i = 0;i < gSkillAtts[info.career].length;i++){
			gInfo[gSkillAtts[info.career][i]] = guild_skill[glv]["pos_"+i]
		}
		model.mergeData(info,gInfo)
	}
	var hufu_talents = {}
	//护符计算
	if(info.hfLv){
		if(hufu_quality[info.hfLv])
			model.mergeData(info,{"self_atk_add" : hufu_quality[info.hfLv]["atk"],"self_maxHP_add" : hufu_quality[info.hfLv]["hp"]})
		if(info.hfs1){
			if(hufu_map[info.hfs1]){
				if(!hufu_talents[hufu_map[info.hfs1].id] || hufu_map[info.hfs1].lv > hufu_talents[hufu_map[info.hfs1].id])
					hufu_talents[hufu_map[info.hfs1].id] = hufu_map[info.hfs1].lv
			}
		}
		if(info.hfs2){
			if(hufu_map[info.hfs2]){
				if(!hufu_talents[hufu_map[info.hfs2].id] || hufu_map[info.hfs2].lv > hufu_talents[hufu_map[info.hfs2].id])
					hufu_talents[hufu_map[info.hfs2].id] = hufu_map[info.hfs2].lv
			}
		}
	}
	//符文石计算
	for(var i = 1;i <= 4;i++){
		if(info["fs"+i]){
			if(hufu_map[info["fs"+i]]){
				if(!hufu_talents[hufu_map[info["fs"+i]].id] || hufu_map[info["fs"+i]].lv > hufu_talents[hufu_map[info["fs"+i]].id])
					hufu_talents[hufu_map[info["fs"+i]].id] = hufu_map[info["fs"+i]].lv
			}
		}
	}
	for(var i in hufu_talents)
		model.mergeTalent(info,hufu_skill[i]["lv"+hufu_talents[i]])
	//战马属性
	if(info.horse){
		var horseInfo = JSON.parse(info.horse)
		model.mergeData(info,{"speed":horseInfo.val})
		if(horseInfo.s1)
			model.mergeTalent(info,horseInfo.s1)
	}
	//战鼓属性
	if(info.drum){
		var drumInfo = JSON.parse(info.drum)
		var tmpInfo = {}
		tmpInfo[war_drum[drumInfo.id]["key"]] = drumInfo.val
		model.mergeData(info,tmpInfo)
	}
	//军旗属性
	if(info.banner){
		var bannerInfo = JSON.parse(info.banner)
		var tmpInfo = {}
		tmpInfo[war_banner[bannerInfo.id]["key"]] = bannerInfo.val
		model.mergeData(info,tmpInfo)
	}
	//建筑属性
	if(teamCfg && teamCfg["gjy"])
		model.mergeData(info,{"self_atk_add":manor_gjy[teamCfg["gjy"]]["add"]})
	if(teamCfg && teamCfg["dby"])
		model.mergeData(info,{"self_maxHP_add":manor_dby[teamCfg["dby"]]["add"]})
	if(teamCfg && teamCfg["qby"])
		model.mergeData(info,{"speed":manor_qby[teamCfg["qby"]]["add"]})
	//称号属性
	if(teamCfg && teamCfg["title"] && title_list[teamCfg["title"]] && title_list[teamCfg["title"]]["talent"])
		model.mergeTalent(info,title_list[teamCfg["title"]]["talent"])
	//官职计算
	if(teamCfg && teamCfg["officer"] && officer[teamCfg["officer"]]){
		var officerInfo = {
		    "maxHP": officer[teamCfg["officer"]].maxHP,
		    "atk": officer[teamCfg["officer"]].atk,
		    "phyDef": officer[teamCfg["officer"]].phyDef,
		    "magDef": officer[teamCfg["officer"]].magDef
		}
		model.mergeData(info,officerInfo)
	}
	if(teamCfg && teamCfg["gather"]){
		var gatherInfo = {
		    "maxHP": teamCfg["gather"] * 10,
		    "atk": teamCfg["gather"] * 2
		}
		model.mergeData(info,gatherInfo)
	}
	if(teamCfg && teamCfg["camp_"+info.realm]){
		var strs = camp_att[teamCfg["camp_"+info.realm]]["att"].split("&")
		var campInfo = {}
		strs.forEach(function(m_str) {
			var m_list = m_str.split(":")
			campInfo[m_list[0]] = Number(m_list[1])
		})
		model.mergeData(info,campInfo)
	}
	//皮肤计算
	if(info.skin){
		if(heroSpine[info.skin] && heroSpine[info.skin]["talent"])
			model.mergeTalent(info,heroSpine[info.skin]["talent"])
	}
	//战法技能
	if(info.zf_1 && zhanfa[info.zf_1] && zhanfa[info.zf_1]["talent"])
		model.mergeTalent(info,zhanfa[info.zf_1]["talent"])
	if(info.zf_2 && zhanfa[info.zf_2] && zhanfa[info.zf_2]["talent"])
		model.mergeTalent(info,zhanfa[info.zf_2]["talent"])
	if(info.zf_3 && zhanfa[info.zf_3] && zhanfa[info.zf_3]["talent"])
		model.mergeTalent(info,zhanfa[info.zf_3]["talent"])


	//技能设置
	if(info.normal_change)
		info.defaultSkill = info.normal_change
	if(info.skill_change)
		info.angerSkill = info.skill_change
	if(info.defaultSkill){
		if(!skillsCfg[info.defaultSkill]){
			console.error("技能不存在",info.id,info.defaultSkill)
			info.defaultSkill = false
		}else{
			info.defaultSkill = Object.assign({skillId : info.defaultSkill},skillsCfg[info.defaultSkill])
		}
	}
	if(info.angerSkill){
		if(!skillsCfg[info.angerSkill]){
			console.error("技能不存在",info.id,info.angerSkill)
			info.angerSkill = false
		}else{
			info.angerSkill = Object.assign({skillId : info.angerSkill},skillsCfg[info.angerSkill])
		}
	}
	return new character(info)
}
//获取天书数据
model.getBookInfo = function(bookId,info){
	if(!info || !bookList[bookId] || !bookMap[bookId] || !book_lv[info.lv] || !book_star[info.star]){
		return false
	}
	info = Object.assign({},info,bookMap[bookId][info.star])
	var add = book_star[info.star]["add"]
	info.maxHP = Math.floor(book_lv[info.lv]["maxHP"] * add)
	info.atk = Math.floor(book_lv[info.lv]["atk"] * add)
	info.phyDef = Math.floor(book_lv[info.lv]["phyDef"] * add)
	info.magDef = Math.floor(book_lv[info.lv]["magDef"] * add)
	return new bookList[bookId](info)
}
//获取主动技能数据
model.getPowerInfo = function(powerInfo){
	return this.powerEntity.getPowerInfo(powerInfo)
}
//获取红颜技能数据
model.getBeautyInfo = function(beautyInfo){
	return this.powerEntity.getBeautyInfo(beautyInfo)
}
//获取团队数据
model.getTeamData = function(team,belong) {
	var team = JSON.parse(JSON.stringify(team))
	var teamCfg = team.shift() || {}
    var books = {}
    var masterAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var bookAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var powerAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var beautyAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var heroAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var gSkill = {}
	//主角
	var master = new masterEntity({belong:belong,manualModel:teamCfg["manualModel"]})
	//天书属性
	for(var bookId in teamCfg){
		if(bookList[bookId] && bookMap[bookId]){
			books[bookId] = this.getBookInfo(bookId,teamCfg[bookId])
			books[bookId].belong = belong
			bookAtts["maxHP"] = Math.floor(books[bookId].attInfo.maxHP)
			bookAtts["atk"] = Math.floor(books[bookId].attInfo.atk)
			bookAtts["phyDef"] = Math.floor(books[bookId].attInfo.phyDef)
			bookAtts["magDef"] = Math.floor(books[bookId].attInfo.magDef)
			for(var att in bookAtts)
				bookAtts[att] += powerAtts[att]
		}
	}
	//主动技能属性
	for(var i = 1;i <= 4;i++){
		if(teamCfg["power"+i]){
			var powerInfo = teamCfg["power"+i]
			powerAtts = this.powerEntity.getPowerInfo(powerInfo)
			for(var att in masterAtts)
				masterAtts[att] += powerAtts[att]
			teamCfg["power"+i]["basic"] = powerAtts["basic"]
		}
	}
	//红颜属性
	for(var i in beauty_base){
		if(teamCfg["beaut_"+i]){
			var beautyInfo = teamCfg["beaut_"+i]
			beautyAtts = this.powerEntity.getBeautyInfo(beautyInfo)
			for(var att in masterAtts)
				masterAtts[att] += beautyAtts[att]
			teamCfg["beaut_"+i]["basic"] = beautyAtts["basic"]
		}
	}
	//兵符属性
	this.calBingfu(master,team,teamCfg["bingfu"])
	//主公属性加成
	for(var i in masterAtts)
		heroAtts[i] = Math.floor(masterAtts[i] / 20)

	//英雄属性
	var characters = []
	var coexistInfo = false
	if(teamCfg["coexist"])
		coexistInfo = this.getCoexistInfo(teamCfg["coexist"])
	for(var i = 0;i < team.length;i++){
		if(team[i] && team[i]["coexist"] && coexistInfo){
			for(var j in coexisATT){
				if(!team[i][coexisATT[j]] || team[i][coexisATT[j]] < coexistInfo[coexisATT[j]])
					team[i][coexisATT[j]] = coexistInfo[coexisATT[j]]
			}
		}
		characters[i] = this.getCharacterInfo(team[i],heroAtts,teamCfg)
	}
	for(var i in books)
		books[i].master = master
    var teamAdds = this.raceAdd(this.getRaceType(characters))
    if(teamCfg){
		for(var i = 1;i <= 4;i++)
			if(teamCfg["power"+i])
				master.addPower(teamCfg["power"+i])
		if(teamCfg["bcombat"] && teamCfg["beaut_"+teamCfg["bcombat"]])
			master.addBeautyPower(teamCfg["beaut_"+teamCfg["bcombat"]])
		if(teamCfg.team_atk_add){
			if(!teamAdds["atk"])
				teamAdds["atk"] = 0
			teamAdds["atk"] += teamCfg.team_atk_add
		}
		if(teamCfg.team_maxHP_add){
			if(!teamAdds["maxHP"])
				teamAdds["maxHP"] = 0
			teamAdds["maxHP"] += teamCfg.team_maxHP_add
		}
    }
	return {master:master,team:characters,books:books,teamAdds:teamAdds,masterAtts:masterAtts,bookAtts:bookAtts,powerAtts:powerAtts,beautyAtts:beautyAtts,heroAtts:heroAtts}
}
//获取团队显示数据
model.getTeamShowData = function(team) {
	var atkTeam = team.concat([])
	var atkInfo = this.getTeamData(atkTeam,"atk")
	var defInfo = this.getTeamData([],"def")
	var bookAtts = atkInfo.bookAtts
	var defTeam = []
	var fighting = new fightingFun(atkInfo,defInfo,{atkTeamAdds:atkInfo.teamAdds})
	return {atkTeam : fighting.atkTeam,bookAtts : bookAtts,masterAtts : atkInfo.masterAtts}
}
//计算兵符属性
model.calBingfu = function(master,team,bfStr) {
	if(bfStr){
		var bfAtt = this.bingfuEntity.callBingfuData(bfStr)
		var bfAttMap = {}
		for(var talentId in bfAtt)
			this.mergeTalent(bfAttMap,talentId,bfAtt[talentId])
		//主公属性
		var attList = ["lord_power","ws_power","beauty_power"]
		for(var i = 0;i < attList.length;i++){
			if(bfAttMap[attList[i]]){
				master[attList[i]] += bfAttMap[attList[i]]
				delete bfAttMap[attList[i]]
			}
		}
		//英雄加成
		for(var i = 0;i < team.length;i++){
			if(team[i]){
				this.mergeData(team[i],bfAttMap)
			}
		}
	}
}
//计算差值
model.calcCEDiff = function(name,oldValue,newValue) {
	var oldCE = 0
	var newCE = 0
	switch(name){
		case "e1":
		case "e2":
		case "e3":
		case "e4":  
			if(oldValue)
				oldCE = equip_base[equip_level[oldValue]["part_1"]]["ce"] || 0
			if(newValue)
				newCE = equip_base[equip_level[newValue]["part_1"]]["ce"] || 0
		break
		case "lv":
			oldCE = lv_cfg[oldValue || 1]["ce"] || 0
			newCE = lv_cfg[newValue || 1]["ce"] || 0
		break
		case "ad":
			oldCE = hero_ad[oldValue || 0]["ce"] || 0
			newCE = hero_ad[newValue || 0]["ce"] || 0
		break
		case "star":
			oldCE = star_base[oldValue || 1]["ce"] || 0
			newCE = star_base[newValue || 1]["ce"] || 0
		break
		case "artifact":
			if(Number.isFinite(oldValue))
				oldCE = artifact_level[oldValue]["ce"] || 0
			if(Number.isFinite(newValue))
				newCE = artifact_level[newValue]["ce"] || 0
		break
		case "a1":
		case "a2":
		case "a3":
		case "a4":
		case "a5":
		case "a6":
		case "a7":
		case "a8":
		case "a9":
		case "a10":
			if(oldValue)
				oldCE = ace_pack[oldValue]["ce"] || 0
			if(newValue)
				newCE = ace_pack[newValue]["ce"] || 0
		break
		case "s1":
		case "s2":
		case "s3":
		case "s4":
			if(oldValue)
				oldCE = stone_base[oldValue]["ce"] || 0
			if(newValue)
				newCE = stone_base[newValue]["ce"] || 0
		break
		case "s5":
		case "s6":
		case "s7":
		case "s8":
			if(oldValue)
				oldCE = stone_skill[oldValue]["ce"] || 0
			if(newValue)
				newCE = stone_skill[newValue]["ce"] || 0
		break
		case "hfLv":
			if(oldValue)
				oldCE = hufu_quality[oldValue]["ce"] || 0
			if(newValue)
				newCE = hufu_quality[newValue]["ce"] || 0
		break 
		case "horse":
			if(oldValue){
				oldValue = JSON.parse(oldValue)
				oldCE = war_horse[oldValue.id]["ce"]
			}
			if(newValue){
				newValue = JSON.parse(newValue)
				newCE = war_horse[newValue.id]["ce"]
			}
		break
		case "drum":
			if(oldValue){
				oldValue = JSON.parse(oldValue)
				oldCE = war_drum[oldValue.id]["ce"]
			}
			if(newValue){
				newValue = JSON.parse(newValue)
				newCE = war_drum[newValue.id]["ce"]
			}
		break
		case "banner":
			if(oldValue){
				oldValue = JSON.parse(oldValue)
				oldCE = war_banner[oldValue.id]["ce"]
			}
			if(newValue){
				newValue = JSON.parse(newValue)
				newCE = war_banner[newValue.id]["ce"]
			}
		break
		case "zf_1":
		case "zf_2":
		case "zf_3":
			if(oldValue && zhanfa[oldValue])
				oldCE = zhanfa[oldValue]["ce"] || 0
			if(newValue && zhanfa[newValue])
				newCE = zhanfa[newValue]["ce"] || 0
		break
		case "tr_lv":
			if(oldValue && hero_tr[oldValue])
				oldCE = hero_tr[oldValue]["ce"] || 0
			if(newValue && hero_tr[newValue])
				newCE = hero_tr[newValue]["ce"] || 0
		break
		case "tr_maxHP":
			oldCE = oldValue || 0
			newCE = newValue || 0
		break
		case "tr_atk":
			oldCE = (oldValue || 0) * 6
			newCE = (newValue || 0) * 6
		break
		case "tr_phyDef":
		case "tr_magDef":
			oldCE = (oldValue || 0) * 3
			newCE = (newValue || 0) * 3
		break
		case "evo":
			if(oldValue && evolutionCfg[oldValue])
				oldCE = evolutionCfg[oldValue]["ce"]
			if(newValue && evolutionCfg[newValue])
				newCE = evolutionCfg[newValue]["ce"]
		break
		case "fs1":
		case "fs2":
		case "fs3":
		case "fs4":
			if(oldValue && hufu_map[oldValue])
				oldCE = hufu_lv[hufu_map[oldValue].lv]["ce"]
			if(newValue && hufu_map[newValue])
				newCE = hufu_lv[hufu_map[newValue].lv]["ce"]
		break
		case "fs5":
			if(oldValue)
				oldCE = 500000
			if(newValue)
				newCE = 500000
		break
		case "et1":
		case "et2":
		case "et3":
		case "et4":
			if(oldValue && equip_st[oldValue])
				oldCE = equip_st[oldValue]["ce"] || 0
			if(newValue && equip_st[newValue])
				newCE = equip_st[newValue]["ce"] || 0
		break
	}
	return newCE - oldCE
}
//获取团队战力
model.getTeamCE = function(team) {
	var allCE = 0
	var careers = {"1":0,"2":0,"3":0,"4":0}
	var teamCfg = team.shift() || {}
	for(var i = 0;i < team.length;i++){
		if(team[i]){
			//等级计算
			if(team[i]["lv"]){
				var growth = aptitudeCfg[herosCfg[team[i]["id"]]["aptitude"]]["ce"]
				allCE += Math.floor(lv_cfg[team[i]["lv"]]["ce"] * growth)
			}
			allCE += hero_ad[team[i]["ad"] || 0]["ce"]
			allCE += star_base[team[i]["star"] || 1]["ce"]
			if(team[i]["artifact"] !== undefined)
				allCE += artifact_level[team[i]["artifact"]]["ce"]
			for(var j = 1;j <= 10;j++){
				if(team[i]["a"+j]){
					allCE += ace_pack[team[i]["a"+j]]["ce"]
				}
			}
			for(var j = 1;j <= 4;j++){
				if(team[i]["e"+j])
        			allCE += equip_base[equip_level[team[i]["e"+j]]["part_"+j]]["ce"]
				if(team[i]["et"+j] && equip_st[team[i]["et"+j]])
        			allCE += equip_st[team[i]["et"+j]]["ce"]
			}
			for(var j = 1;j <= 4;j++){
				if(team[i]["s"+j] && stone_base[team[i]["s"+j]])
        			allCE += stone_base[team[i]["s"+j]]["ce"]
			}
			for(var j = 5;j <= 8;j++){
				if(team[i]["s"+j] && stone_skill[team[i]["s"+j]])
        			allCE += stone_skill[team[i]["s"+j]]["ce"]
			}
			if(herosCfg[team[i]["id"]] && careers[herosCfg[team[i]["id"]]["career"]] != undefined)
				careers[herosCfg[team[i]["id"]]["career"]]++
			if(team[i]["hfLv"] && hufu_quality[team[i]["hfLv"]]){
				allCE += hufu_quality[team[i]["hfLv"]]["ce"]
				if(team[i]["hfs1"] && hufuSkillCes[team[i]["hfs1"]])
					allCE += hufuSkillCes[team[i]["hfs1"]]
				if(team[i]["hfs2"] && hufuSkillCes[team[i]["hfs2"]])
					allCE += hufuSkillCes[team[i]["hfs2"]]
			}
			if(team[i]["horse"]){
				var horseInfo = JSON.parse(team[i]["horse"])
				allCE += war_horse[horseInfo.id]["ce"]
			}
			if(team[i]["drum"]){
				var drumInfo = JSON.parse(team[i]["drum"])
				allCE += war_drum[drumInfo.id]["ce"]
			}
			if(team[i]["banner"]){
				var bannerInfo = JSON.parse(team[i]["banner"])
				allCE += war_banner[bannerInfo.id]["ce"]
			}
			for(var j = 1;j <= 3;j++){
				if(team[i]["zf_"+j] && zhanfa[team[i]["zf_"+j]])
        			allCE += zhanfa[team[i]["zf_"+j]]["ce"]
			}
			if(team[i]["evo"])
				allCE += evolutionCfg[team[i]["evo"]]["ce"]
			//符文石计算
			for(var j = 1;j <= 4;j++){
				if(team[i]["fs"+j]){
					if(hufu_map[team[i]["fs"+j]]){
						if(hufu_lv[hufu_map[team[i]["fs"+j]].lv])
							allCE += hufu_lv[hufu_map[team[i]["fs"+j]].lv]["ce"]
					}
				}
			}
			//天赋计算
			if(team[i]["fs5"])
				allCE += 500000
			if(team[i]["tr_lv"] && hero_tr[team[i]["tr_lv"]])
				allCE += hero_tr[team[i]["tr_lv"]]["ce"] || 0
			if(team[i]["tr_maxHP"])
				allCE += team[i]["tr_maxHP"]
			if(team[i]["tr_atk"])
				allCE += team[i]["tr_atk"] * 6
			if(team[i]["tr_phyDef"])
				allCE += team[i]["tr_phyDef"] * 3
			if(team[i]["tr_magDef"])
				allCE += team[i]["tr_magDef"] * 3
		}
	}
	if(teamCfg){
		for(var i in teamCfg){
			if(bookMap[i]){
				allCE += book_lv[teamCfg[i]["lv"]]["ce"]
				allCE += book_star[teamCfg[i]["star"]]["ce"]
			}
		}
		for(var i = 1;i <= 4;i++){
			if(teamCfg["g"+i] && guild_skill[teamCfg["g"+i]]){
				allCE += Math.ceil(guild_skill[teamCfg["g"+i]]["ce"] * careers[i])
			}
		}
		if(teamCfg["title"] && title_list[teamCfg["title"]] && title_list[teamCfg["title"]]["ce"])
			allCE += title_list[teamCfg["title"]]["ce"]
		if(teamCfg["officer"] && officer[teamCfg["officer"]] && officer[teamCfg["officer"]]["ce"])
			allCE += officer[teamCfg["officer"]]["ce"]
		if(teamCfg["gather"])
			allCE += 1000 * teamCfg["gather"]
		for(var i = 1;i <= 5;i++){
			if(teamCfg["camp_"+i]){
				allCE += 2000 * teamCfg["camp_"+i]
			}
		}
		if(teamCfg["gjy"])
			allCE += 80000 * teamCfg["gjy"]
		if(teamCfg["dby"])
			allCE += 80000 * teamCfg["dby"]
		if(teamCfg["qby"])
			allCE += 80000 * teamCfg["qby"]
		//主动技能
		for(var i = 1;i <= 4;i++)
			if(teamCfg["power"+i])
				allCE += this.powerEntity.getPowerCE(teamCfg["power"+i])
		//红颜技能
		for(var i in beauty_base)
			if(teamCfg["beaut_"+i])
				allCE += this.powerEntity.getBeautyCE(teamCfg["beaut_"+i])
		//兵符
		if(teamCfg["bingfu"])
			allCE += this.bingfuEntity.getBfDataCE(teamCfg["bingfu"])
	}
	return allCE
}
//新增天赋
model.mergeTalent = function(info,talentId,value) {
	if(talent_list[talentId]){
		let tmpTalent = {}
		for(var i = 1;i <= 2;i++){
			if(talent_list[talentId]["key"+i]){
				tmpTalent[talent_list[talentId]["key"+i]] = talent_list[talentId]["value"+i]
				if(tmpTalent[talent_list[talentId]["key"+i]] == "dynamic")
					tmpTalent[talent_list[talentId]["key"+i]] = value || 0
			}
		}
		model.mergeData(info,tmpTalent)
	}else{
		console.error("talentId error",talentId)
	}
}
//数据合并
model.mergeData = function(info1,info2) {
	for(var i in info2){
		if(info2[i]){
			if(info1[i] && Number.isFinite(info2[i])){
				if(Number.isFinite(info1[i])){
					info1[i] += info2[i]
				}else{
					info1[i] = info2[i]
				}
			}else{
				info1[i] = info2[i]
			}
		}
	}
}
//获取基准战力表
model.getStandardCE = function() {
	return {standard_ce:standard_ce,standard_team_ce:standard_team_ce}
}
//获取基准战力阵容
model.standardTeam = function(uid,list,dl,lv) {
	var team = list.concat()
	var standardInfo = standard_ce[lv]
	var dlInfo = standard_dl[dl]
	var info = Object.assign({},standardInfo)
	if(dlInfo.lv){
		info.lv += dlInfo.lv
		delete dlInfo.lv
	}
	info = Object.assign(info,dlInfo)
	for(var i = 0;i < team.length;i++){
		if(team[i]){
			team[i] = Object.assign({id : team[i]},info)
			if(team[i].star < herosCfg[team[i]["id"]]["min_star"])
				team[i].star = herosCfg[team[i]["id"]]["min_star"]
		}
	}
	team.unshift(JSON.parse(JSON.stringify(standard_team_ce[lv])))
	return team
}
//获取原始基准战力阵容(无属性加成)
model.oriStandardTeam = function(list,lv) {
	var team = list.concat()
	var standardInfo = standard_ce[lv]
	var info = Object.assign({},standardInfo)
	delete info["crit"]
	delete info["critDef"]
	delete info["slay"]
	delete info["slayDef"]
	delete info["hitRate"]
	delete info["dodgeRate"]
	for(var i = 0;i < team.length;i++){
		if(team[i]){
			team[i] = Object.assign({id : team[i]},info)
			if(team[i].star < herosCfg[team[i]["id"]]["min_star"])
				team[i].star = herosCfg[team[i]["id"]]["min_star"]
		}
	}
	team.unshift(JSON.parse(JSON.stringify(standard_team_ce[lv])))
	return team
}
//获取共鸣属性
model.getCoexistInfo = function(lv) {
	if(coexistLvMap[lv])
		return coexistLvMap[lv]
	else
		return false
}
module.exports = model