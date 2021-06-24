var skillsCfg = require("../../../../config/gameCfg/skills.json")
var herosCfg = require("../../../../config/gameCfg/heros.json")
var lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
var star_base = require("../../../../config/gameCfg/star_base.json")
var advanced_base = require("../../../../config/gameCfg/advanced_base.json")
var advanced_talent = require("../../../../config/gameCfg/advanced_talent.json")
var talent_list = require("../../../../config/gameCfg/talent_list.json")
var equip_base = require("../../../../config/gameCfg/equip_base.json")
var equip_level = require("../../../../config/gameCfg/equip_level.json")
var ace_pack = require("../../../../config/gameCfg/ace_pack.json")
var artifact_level = require("../../../../config/gameCfg/artifact_level.json")
var artifact_talent = require("../../../../config/gameCfg/artifact_talent.json")
var stone_base = require("../../../../config/gameCfg/stone_base.json")
var stone_skill = require("../../../../config/gameCfg/stone_skill.json")
var book_list = require("../../../../config/gameCfg/book_list.json")
var book_lv = require("../../../../config/gameCfg/book_lv.json")
var book_star = require("../../../../config/gameCfg/book_star.json")
var guild_cfg = require("../../../../config/gameCfg/guild_cfg.json")
var guild_skill = require("../../../../config/gameCfg/guild_skill.json")
var hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
var hufu_quality = require("../../../../config/gameCfg/hufu_quality.json")
var heroSpine = require("../../../../config/gameCfg/heroSpine.json")
var skin_list = require("../../../../config/gameCfg/skin_list.json")
var title_list = require("../../../../config/gameCfg/title_list.json")
var zhanfa = require("../../../../config/gameCfg/zhanfa.json")
var fightingFun = require("./fighting.js")
var fightRecord = require("./fightRecord.js")
var character = require("../entity/character.js")
var bookIds = ["singleAtk","backDamage","frontDamage","banishBook","angerAddBook","angerLessBook","reductionBuff","seckill","singleHeal"]
var bookList = {}
var bookMap = {}
var gSkillAtts = {}
var hufuSkillCes = {}
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
for(var i in hufu_skill){
	for(var j = 1;j<= 4;j++){
		hufuSkillCes[hufu_skill[i]["lv"+j]] = 50000 * j
	}
}
//战斗控制器
var model = function() {
	this.fighting = false
	this.overInfo = {}
}
// //自定义战斗配置// model.libertyFight = function(atkTeam,defTeam,otps) {
// 	var fighting = new fightingFun(atkTeam,defTeam,otps)
// 	fighting.nextRound()
// 	return fightRecord.getList()
// }
//根据配置表生成战斗配置
model.beginFight = function(atkTeam,defTeam,otps) {
    var atkInfo = this.getTeamData(atkTeam,"atk")
    var defInfo = this.getTeamData(defTeam,"def")
    var myotps = Object.assign({},otps)
    myotps.atkTeamAdds = atkInfo.teamAdds
    myotps.defTeamAdds = defInfo.teamAdds
	var fighting = new fightingFun(atkInfo.team,defInfo.team,atkInfo.books,defInfo.books,myotps)
	fighting.fightBegin()
	model.overInfo = fightRecord.list[fightRecord.list.length-1]
	return fightRecord.isWin()
}
model.getOverInfo = function() {
	return this.overInfo
}
//获取种族加成类型
model.getRaceType = function(team) {
	let raceList = {"1" : 0,"2" : 0, "3" : 0, "4" : 0}
	let maxNum = 0
	for(let i = 0;i < team.length;i++){
		if(team[i]){
			raceList[team[i].realm]++
			if(raceList[team[i].realm] > maxNum){
				maxNum = raceList[team[i].realm]
			}
		}
	}
	if(maxNum >= 4){
		return maxNum
	}
	let list = [0,0,0,0,0,0,0]
	for(let i in raceList){
		list[raceList[i]]++
	}
	if(list[3] >= 2){
		return 3
	}
	if(maxNum >= 3){
		return 2
	}
	if(list[2] >= 3){
		return 1
	}
	return 0
}
//种族加成
model.raceAdd = function(raceType) {
	switch(raceType){
		case 1:
		return {"atk" : 0.06,"maxHP" : 0.09}
		case 2:
		return {"atk" : 0.08,"maxHP" : 0.12}
		case 3:
		return {"atk" : 0.1,"maxHP" : 0.15}
		case 4:
		return {"atk" : 0.12,"maxHP" : 0.18}
		case 5:
		return {"atk" : 0.14,"maxHP" : 0.21,"reduction" : 0.05}
		case 6:
		return {"atk" : 0.2,"maxHP" : 0.3,"reduction" : 0.1}
		default:
		return {}
	}
}
model.getFightRecord = function() {
	return fightRecord.getList()
}
//获取角色数据
model.getCharacterInfo = function(info,bookAtts,teamCfg) {
	if(!info || !herosCfg[info.id]){
		return false
	}
	info = Object.assign({},info)
	info.bookAtts = bookAtts
	let id = info.id
	model.mergeData(info,herosCfg[id])
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
	//等级计算
	if(info.lv && lv_cfg[info.lv]){
		let lvInfo = {
		    "maxHP": lv_cfg[info.lv].manHP,
		    "atk": lv_cfg[info.lv].atk,
		    "phyDef": lv_cfg[info.lv].phyDef,
		    "magDef": lv_cfg[info.lv].magDef,
		}
		model.mergeData(info,lvInfo)
	}
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
		}
	}
	//升星计算
	if(info.star){
		if(advanced_talent[info.id]){
			let starInfo = {}
			for(let i = 6;i <= info.star;i++){
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
	}
	//进阶计算
	if(info.ad){
		if(advanced_talent[info.id]){
			let advancedInfo = {}
			for(let i = 1;i <= info.ad;i++){
				if(i > 5)
					break
				let talentId = advanced_talent[info.id]["talent_"+i]
				if(talentId)
					model.mergeTalent(advancedInfo,talentId)
			}
			// console.log("advancedInfo",advancedInfo)
			model.mergeData(info,advancedInfo)
		}
		if(advanced_base[info.ad] && advanced_base[info.ad]["att"]){
			let strs = advanced_base[info.ad]["att"].split("&")
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
	//神器计算
	if(info["artifact"] !== undefined){
		let artifact = info["artifact"]
		let lvInfo = {
		    "maxHP": artifact_level[artifact].maxHP,
		    "atk": artifact_level[artifact].atk,
		    "phyDef": artifact_level[artifact].phyDef,
		    "magDef": artifact_level[artifact].magDef,
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
	//护符计算
	if(info.hfLv){
		if(hufu_quality[info.hfLv])
			model.mergeData(info,{"self_atk_add" : hufu_quality[info.hfLv]["atk"],"self_maxHP_add" : hufu_quality[info.hfLv]["hp"]})
		if(info.hfs1){
			model.mergeTalent(info,info.hfs1)
		}
		if(info.hfs2)
			model.mergeTalent(info,info.hfs2)
	}
	//称号属性
	if(teamCfg && teamCfg["title"] && title_list[teamCfg["title"]] && title_list[teamCfg["title"]]["talent"])
		model.mergeTalent(info,title_list[teamCfg["title"]]["talent"])
	//皮肤计算
	if(info.skin){
		if(heroSpine[info.skin] && heroSpine[info.skin]["talent"])
			model.mergeTalent(info,heroSpine[info.skin]["talent"])
	}
	//战法技能
	if(info.zf_1 && zhanfa[info.zf_1]["talent"])
		model.mergeTalent(info,zhanfa[info.zf_1]["talent"])
	if(info.zf_2 && zhanfa[info.zf_2]["talent"])
		model.mergeTalent(info,zhanfa[info.zf_2]["talent"])
	if(info.zf_3 && zhanfa[info.zf_3]["talent"])
		model.mergeTalent(info,zhanfa[info.zf_3]["talent"])
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
//获取团队数据
model.getTeamData = function(team,belong) {
	var team = team.concat([])
	var teamCfg = team[6]
    var books = {}
    var bookAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var gSkill = {}
	if(teamCfg){
		//天书
		for(var bookId in teamCfg){
			if(bookList[bookId] && bookMap[bookId]){
				books[bookId] = this.getBookInfo(bookId,teamCfg[bookId])
				books[bookId].belong = belong
				bookAtts["maxHP"] += Math.floor(books[bookId].attInfo.maxHP/30)
				bookAtts["atk"] += Math.floor(books[bookId].attInfo.atk/30)
				bookAtts["phyDef"] += Math.floor(books[bookId].attInfo.phyDef/30)
				bookAtts["magDef"] += Math.floor(books[bookId].attInfo.magDef/30)
			}
		}
	}
	var characters = []
	for(var i = 0;i < 6;i++){
		characters[i] = this.getCharacterInfo(team[i],bookAtts,teamCfg)
	}
    var teamAdds = this.raceAdd(this.getRaceType(characters))
	return {team:characters,books:books,teamAdds:teamAdds}
}
//获取团队显示数据
model.getTeamShowData = function(team) {
	var atkTeam = team.concat([])
	var info = this.getTeamData(atkTeam)
	atkTeam = info.team
	var bookAtts = info.bookAtts
	var defTeam = []
	var fighting = new fightingFun(atkTeam,defTeam,{},{},{atkTeamAdds:info.teamAdds})
	return {atkTeam : fighting.atkTeam,bookAtts : bookAtts}
}
//计算差值
model.calcCEDiff = function(name,oldValue,newValue) {
	var oldCE = 0
	var newCE = 0
	switch(name){
		case "lv":
			oldCE = lv_cfg[oldValue || 1]["ce"]
			newCE = lv_cfg[newValue || 1]["ce"]
		break
		case "ad":
			oldCE = advanced_base[oldValue || 0]["ce"]
			newCE = advanced_base[newValue || 0]["ce"]
		break
		case "star":
			oldCE = star_base[oldValue || 1]["ce"]
			newCE = star_base[newValue || 1]["ce"]
		break
		case "artifact":
			if(oldValue)
				oldCE = artifact_level[oldValue]["ce"]
			if(newCE)
				newCE = artifact_level[newValue]["ce"]
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
				oldCE = ace_pack[oldValue]["ce"]
			if(newValue)
				newCE = ace_pack[newValue]["ce"]
		break
		case "s1":
		case "s2":
		case "s3":
		case "s4":
			if(oldValue)
				oldCE = stone_base[oldValue]["ce"]
			if(newValue)
				newCE = stone_base[newValue]["ce"]
		break
		case "s5":
		case "s6":
		case "s7":
		case "s8":
			if(oldValue)
				oldCE = stone_skill[oldValue]["ce"]
			if(newValue)
				newCE = stone_skill[newValue]["ce"]
		break
		case "hfLv":
			if(oldValue)
				oldCE = hufu_quality[oldValue]["ce"]
			if(newValue)
				newCE = hufu_quality[newValue]["ce"]
		break 
	}
	return newCE - oldCE
}
model.getTeamCE = function(team) {
	var allCE = 0
	var careers = {"1":0,"2":0,"3":0,"4":0}
	for(var i = 0;i < 6;i++){
		if(team[i]){
			allCE += lv_cfg[team[i]["lv"] || 1]["ce"]
			allCE += advanced_base[team[i]["ad"] || 0]["ce"]
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
		}
	}
	if(team[6]){
		for(var i in team[6]){
			if(bookMap[i]){
				allCE += book_lv[team[6][i]["lv"]]["ce"]
				allCE += book_star[team[6][i]["star"]]["ce"]
			}
		}
		for(var i = 1;i <= 4;i++){
			if(team[6]["g"+i] && guild_skill[team[6]["g"+i]]){
				allCE += Math.ceil(guild_skill[team[6]["g"+i]]["ce"] * careers[i])
			}
		}
		if(team[6]["title"] && title_list[team[6]["title"]] && title_list[team[6]["title"]]["ce"])
			allCE += title_list[team[6]["title"]]["ce"]
	}
	return allCE
}
//新增天赋
model.mergeTalent = function(info,talentId) {
	if(talent_list[talentId]){
		let tmpTalent = {}
		tmpTalent[talent_list[talentId].key1] = talent_list[talentId].value1
		if(talent_list[talentId].key2)
			tmpTalent[talent_list[talentId].key2] = talent_list[talentId].value2
		model.mergeData(info,tmpTalent)
	}else{
		console.error("talentId error",talentId)
	}
}
//数据合并
model.mergeData = function(info1,info2) {
	for(var i in info2){
		if(info1[i]){
			if(Number.isFinite(info1[i]) && Number.isFinite(info2[i])){
				info1[i] += info2[i]
			}else{
				info1[i] = info2[i]
			}
		}else{
			info1[i] = info2[i]
		}
	}
}
module.exports = model