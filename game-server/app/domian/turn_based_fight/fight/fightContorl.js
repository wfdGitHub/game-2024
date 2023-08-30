const standard_ce_cfg = require("../../../../config/gameCfg/standard_ce.json")
const standard_dl = require("../../../../config/gameCfg/standard_dl.json")
const stone_lv = require("../../../../config/gameCfg/stone_lv.json")
const skillsCfg = require("../../../../config/gameCfg/skills.json")
const heros = require("../../../../config/gameCfg/heros.json")
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
const guild_cfg = require("../../../../config/gameCfg/guild_cfg.json")
const guild_skill = require("../../../../config/gameCfg/guild_skill.json")
const hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
const hufu_quality = require("../../../../config/gameCfg/hufu_quality.json")
const hufu_lv = require("../../../../config/gameCfg/hufu_lv.json")
const zhanfa = require("../../../../config/gameCfg/zhanfa.json")
const officer = require("../../../../config/gameCfg/officer.json")
const manor_gjy = require("../../../../config/gameCfg/manor_gjy.json")
const manor_dby = require("../../../../config/gameCfg/manor_dby.json")
const manor_qby = require("../../../../config/gameCfg/manor_qby.json")
const aptitudeCfg = require("../../../../config/gameCfg/aptitude.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const evolves = require("../../../../config/gameCfg/evolves.json")
const equip_suit = require("../../../../config/gameCfg/equip_suit.json")
var fightingFun = require("./fighting.js")
var fightRecord = require("./fightRecord.js")
var character = require("../entity/character.js")
var masterEntity = require("../entity/master.js")
var bingfuEntity = require("../entity/bingfuEntity.js")
var powerEntity = require("../entity/powerEntity.js")
var fightHandler = require("./fightHandler.js")
var gSkillAtts = {}
var fightVerifyInfo = {}
for(var i = 1;i <= 4;i++){
	gSkillAtts[i] = JSON.parse(guild_cfg["career_"+i]["value"])
}
var hufu_map = {}
var hufuSkillCes = {}
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
//战斗控制器
var model = function() {
	this.fighting = false
	this.overInfo = {}
}
fightHandler.call(model)
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
		for(var i = 0;i < fightVerifyInfo.atkTeam.length;i++){
				delete fightVerifyInfo.atkTeam[i]["combat"]
				delete fightVerifyInfo.atkTeam[i]["hId"]
		}
		for(var i = 0;i < fightVerifyInfo.defTeam.length;i++){
				delete fightVerifyInfo.defTeam[i]["combat"]
				delete fightVerifyInfo.defTeam[i]["hId"]
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
model.getFightRecord = function() {
	return fightRecord.getList()
}
model.getFightStageRecord = function() {
	return fightRecord.getStageList()
}
//获取角色数据
model.getCharacterInfo = function(info,heroAtts,teamCfg) {
	if(!info || !heros[info.id])
		return false
	info = Object.assign({},info)
	info.heroAtts = heroAtts
	info.exalt = info.exalt || 1
	info.evo = info.evo || 1
	info.lv = info.lv || 1
	var id = info.id
	var aptitude = exalt_lv[info.exalt]["aptitude"] || 1
	model.mergeData(info,heros[id])
	var evoId = evolve_lv[info.evo]["evoId"]
	//被动技能
	for(var i = 1;i <= evoId;i++)
		model.mergeTalent(info,heros[info.id]["talent"+evoId])
	//初始属性
	var lvInfo = {
	    "maxHP":aptitudeCfg[aptitude].maxHP,
	    "atk": aptitudeCfg[aptitude].atk,
	    "phyDef": aptitudeCfg[aptitude].phyDef,
	    "magDef": aptitudeCfg[aptitude].magDef
	}
	//等级计算
	if(info.lv && lv_cfg[info.lv]){
		var growth = aptitudeCfg[aptitude].growth
		lvInfo.maxHP += Math.floor(lv_cfg[info.lv].maxHP * growth)
		lvInfo.atk += Math.floor(lv_cfg[info.lv].atk * growth)
		lvInfo.phyDef += Math.floor(lv_cfg[info.lv].phyDef * growth)
		lvInfo.magDef += Math.floor(lv_cfg[info.lv].magDef * growth)
		lvInfo.speed += lv_cfg[info.lv].speed
	}
	model.mergeData(info,lvInfo)
	//装备计算
	var suitMaps = {}
	for(var i = 1;i <= 6;i++){
		if(info["e"+i]){
			var eInfo = model.getEquipData(info["e"+i])
			model.mergeData(info,eInfo.mainAtt)
			model.mergeData(info,eInfo.extraAtt)
			model.mergeData(info,eInfo.stAtt)
			model.mergeData(info,eInfo.zfAtt)
			for(var j = 0;j < eInfo.spe.length;i++)
				model.mergeTalent(info,eInfo.spe[i])
			if(eInfo.suit){
				if(!suitMaps[eInfo.suit])
					suitMaps[eInfo.suit] = 0
				suitMaps[eInfo.suit]++
			}
		}
	}
	//装备套装
	for(var i in suitMaps){
		if(suitMaps[i] >= equip_suit[i]["count"])
			model.mergeTalent(info,i)
	}
	//宝物加成
	for(var i = 1;i <= 10;i++){
		if(info["a"+i]){
			var talentId = ace_pack[info["a"+i]]["pa"]
			model.mergeTalent(info,talentId)
		}
	}
	//神兵加成
	if(info["artifact"] !== undefined){
		var artifact = info["artifact"]
		var lvInfo = {
		    "maxHP": artifact_level[artifact].maxHP,
		    "atk": artifact_level[artifact].atk,
		    "phyDef": artifact_level[artifact].phyDef,
		    "magDef": artifact_level[artifact].magDef,
		    "speed" : artifact_level[artifact].speed
		}
		model.mergeData(info,lvInfo)
		for(var i = 0;i <= artifact;i++){
			if(artifact_level[i].talent){
				var talentId = artifact_level[i].talent
				model.mergeTalent(info,talentId)
			}
		}
		if(artifact >= 25){
			if(artifact_talent[info.id]){
				var talentId = artifact_talent[info.id].talent
				model.mergeTalent(info,talentId)
			}
		}
	}
	//属性宝石加成
	var stonebaseInfo = {}
	for(var i = 1;i <= 4;i++){
		if(info["s"+i] && stone_base[info["s"+i]]){
			stonebaseInfo[stone_base[info["s"+i]]["key"]] = stone_base[info["s"+i]]["arg"]
		}
	}
	model.mergeData(info,stonebaseInfo)
	//技能宝石加成
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
	//被动技能
	var PSScore = 0
	for(var i = 0;i <= 10;i++){
		if(info["PS"+i]){
			if(hufu_map[info["PS"+i]]){
				if(!hufu_talents[hufu_map[info["PS"+i]].id] || hufu_map[info["PS"+i]].lv > hufu_talents[hufu_map[info["PS"+i]].id])
					hufu_talents[hufu_map[info["PS"+i]].id] = hufu_map[info["PS"+i]].lv
			}
			PSScore += hufu_lv[hufu_map[info["PS"+i]].lv]["score"]
		}
	}
	for(var i in hufu_talents)
		model.mergeTalent(info,hufu_skill[i]["lv"+hufu_talents[i]])
	//建筑属性
	if(teamCfg && teamCfg["gjy"])
		model.mergeData(info,{"self_atk_add":manor_gjy[teamCfg["gjy"]]["add"]})
	if(teamCfg && teamCfg["dby"])
		model.mergeData(info,{"self_maxHP_add":manor_dby[teamCfg["dby"]]["add"]})
	if(teamCfg && teamCfg["qby"])
		model.mergeData(info,{"speed":manor_qby[teamCfg["qby"]]["add"]})
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
	//主属性计算
	info["M_HP"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_HP"] * (info["MR1"] || 1))
	info["M_ATK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_ATK"] * (info["MR2"] || 1))
	info["M_DEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_DEF"] * (info["MR3"] || 1))
	info["M_STK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_STK"] * (info["MR4"] || 1))
	info["M_SEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SEF"] * (info["MR5"] || 1))
	info["M_SPE"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SPE"] * (info["MR6"] || 1))
	//主属性增益
	info["maxHP"] += Math.floor((info["maxHP"] * (info["M_HP"]-40) / (info["M_HP"]+60)))
	info["score"] = Math.floor((info["M_HP"]+info["M_ATK"]+info["M_DEF"]+info["M_STK"]+info["M_SEF"]+info["M_SPE"]) * 28 + aptitude * 600 + PSScore)
	return new character(info)
}
//获取主动技能数据
model.getPowerInfo = function(powerInfo){
	return this.powerEntity.getPowerInfo(powerInfo)
}
//获取团队数据
model.getTeamData = function(team,belong) {
	var team = JSON.parse(JSON.stringify(team))
	var teamCfg = team.shift() || {}
    var masterAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var powerAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var heroAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var gSkill = {}
	//主角
	var master = new masterEntity({belong:belong,manualModel:teamCfg["manualModel"]})
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
	//主公属性加成
	for(var i in masterAtts)
		heroAtts[i] = Math.floor(masterAtts[i] / 20)
	//英雄属性
	var characters = []
	for(var i = 0;i < team.length;i++){
		characters[i] = this.getCharacterInfo(team[i],heroAtts,teamCfg)
	}
    var teamAdds = {}
    if(teamCfg){
		for(var i = 1;i <= 4;i++)
			if(teamCfg["power"+i])
				master.addPower(teamCfg["power"+i])
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
	return {master:master,team:characters,teamAdds:teamAdds,masterAtts:masterAtts,powerAtts:powerAtts,heroAtts:heroAtts}
}
//获取团队显示数据
model.getTeamShowData = function(team) {
	var atkTeam = team.concat([])
	var atkInfo = this.getTeamData(atkTeam,"atk")
	var defInfo = this.getTeamData([],"def")
	var defTeam = []
	var fighting = new fightingFun(atkInfo,defInfo,{atkTeamAdds:atkInfo.teamAdds})
	return {atkTeam : fighting.atkTeam,masterAtts : atkInfo.masterAtts}
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
		case "e5":
		case "e6":
			oldCE = this.getEquipCE(oldValue)
			newCE = this.getEquipCE(newValue)
		break
		case "lv":
			oldCE = lv_cfg[oldValue || 1]["ce"] || 0
			newCE = lv_cfg[newValue || 1]["ce"] || 0
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
		case "zf_1":
		case "zf_2":
		case "zf_3":
			if(oldValue && zhanfa[oldValue])
				oldCE = zhanfa[oldValue]["ce"] || 0
			if(newValue && zhanfa[newValue])
				newCE = zhanfa[newValue]["ce"] || 0
		break
	}
	return newCE - oldCE
}
//获取团队战力
model.getTeamCE = function(team) {
	team = JSON.parse(JSON.stringify(team))
	var allCE = 0
	var careers = {"1":0,"2":0,"3":0,"4":0}
	var teamCfg = team.shift() || {}
	for(var i = 0;i < team.length;i++){
		if(team[i]){
			allCE += this.getHeroCE(team[i])
		}
	}
	if(teamCfg){
		for(var i = 1;i <= 4;i++)
			if(teamCfg["g"+i] && guild_skill[teamCfg["g"+i]])
				allCE += Math.ceil(guild_skill[teamCfg["g"+i]]["ce"] * careers[i])
		if(teamCfg["officer"] && officer[teamCfg["officer"]] && officer[teamCfg["officer"]]["ce"])
			allCE += officer[teamCfg["officer"]]["ce"]
		if(teamCfg["gjy"])
			allCE += 10000 * teamCfg["gjy"]
		if(teamCfg["dby"])
			allCE += 10000 * teamCfg["dby"]
		if(teamCfg["qby"])
			allCE += 10000 * teamCfg["qby"]
		//主动技能
		for(var i = 1;i <= 4;i++)
			if(teamCfg["power"+i])
				allCE += this.powerEntity.getPowerCE(teamCfg["power"+i])
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
	if(!info2)
		return
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
	return []
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
			if(team[i].star < heros[team[i]["id"]]["min_star"])
				team[i].star = heros[team[i]["id"]]["min_star"]
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
			if(team[i].star < heros[team[i]["id"]]["min_star"])
				team[i].star = heros[team[i]["id"]]["min_star"]
		}
	}
	team.unshift(JSON.parse(JSON.stringify(standard_team_ce[lv])))
	return team
}
module.exports = model