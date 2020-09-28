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
var fightingFun = require("./fighting.js")
var fightRecord = require("./fightRecord.js")
var character = require("../entity/character.js")
var bookIds = ["singleAtk","backDamage","frontDamage","banishBook","angerAddBook","angerLessBook","reductionBuff","seckill","singleHeal"]
var bookList = {}
var bookMap = {}
for(var i = 0;i < bookIds.length;i++){
	bookList[bookIds[i]] = require("../books/"+bookIds[i]+".js")
}
for(var i in book_list){
	bookMap[book_list[i]["type"]] = []
	for(var j = 0;j < 6;j++){
		bookMap[book_list[i]["type"]][j] = JSON.parse(book_list[i]["otps_"+j])
	}
}
//战斗控制器
var model = function() {
	this.fighting = false
}
// //自定义战斗配置// model.libertyFight = function(atkTeam,defTeam,otps) {
// 	var fighting = new fightingFun(atkTeam,defTeam,otps)
// 	fighting.nextRound()
// 	return fightRecord.getList()
// }
//根据配置表生成战斗配置
model.beginFight = function(atkTeam,defTeam,otps) {
    var atkBookInfos = atkTeam[6]
    var defBookInfos = defTeam[6]
    var atkBooks = {}
    var defBooks = {}
    var atkBookAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
    var defBookAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
	//天书
	if(atkBookInfos){
		for(var bookId in atkBookInfos){
			if(bookList[bookId] && bookMap[bookId]){
				atkBooks[bookId] = this.getBookInfo(bookId,atkBookInfos[bookId])
				atkBooks[bookId].belong = "atk"
				atkBookAtts["maxHP"] += Math.floor(atkBooks[bookId].attInfo.maxHP/30)
				atkBookAtts["atk"] += Math.floor(atkBooks[bookId].attInfo.atk/30)
				atkBookAtts["phyDef"] += Math.floor(atkBooks[bookId].attInfo.phyDef/30)
				atkBookAtts["magDef"] += Math.floor(atkBooks[bookId].attInfo.magDef/30)
			}
		}
	}
	if(defBookInfos){
		for(var bookId in defBookInfos){
			if(bookList[bookId] && bookMap[bookId]){
				defBooks[bookId] = this.getBookInfo(bookId,defBookInfos[bookId])
				defBooks[bookId].belong = "def"
				defBookAtts["maxHP"] += Math.floor(defBooks[bookId].attInfo.maxHP/30)
				defBookAtts["atk"] += Math.floor(defBooks[bookId].attInfo.atk/30)
				defBookAtts["phyDef"] += Math.floor(defBooks[bookId].attInfo.phyDef/30)
				defBookAtts["magDef"] += Math.floor(defBooks[bookId].attInfo.magDef/30)
			}
		}
	}
	console.log("atkBookAtts",atkBookAtts,defBookAtts)
	var atkTeamList = []
	var defTeamList = []
    for(var i = 0;i < 6;i++){
      atkTeamList[i] = this.getCharacterInfo(atkTeam[i],atkBookAtts)
      defTeamList[i] = this.getCharacterInfo(defTeam[i],defBookAtts)
    }
    var myotps = Object.assign({},otps)
    myotps.atkTeamAdds = Object.assign({},myotps.atkTeamAdds)
    myotps.defTeamAdds = Object.assign({},myotps.defTeamAdds)
    model.mergeData(myotps.atkTeamAdds,this.raceAdd(this.getRaceType(atkTeamList)))
    model.mergeData(myotps.defTeamAdds,this.raceAdd(this.getRaceType(defTeamList)))
	var fighting = new fightingFun(atkTeamList,defTeamList,atkBooks,defBooks,myotps)
	fighting.fightBegin()
	return fightRecord.isWin()
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
model.getCharacterInfo = function(info,bookAtts) {
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
		let elv = info["equip_"+part]
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
		if(info["acepack_"+i]){
			let talentId = ace_pack[info["acepack_"+i]]["pa"]
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
//获取团队显示数据
model.getTeamShowData = function(team) {
	var atkTeam = team.concat([])
	var atkBookInfos = atkTeam[6]
    var atkBooks = {}
    var atkBookAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
	//天书
	if(atkBookInfos){
		for(var bookId in atkBookInfos){
			if(bookList[bookId] && bookMap[bookId]){
				atkBooks[bookId] = this.getBookInfo(bookId,atkBookInfos[bookId])
				atkBooks[bookId].belong = "atk"
				atkBookAtts["maxHP"] += Math.floor(atkBooks[bookId].attInfo.maxHP/30)
				atkBookAtts["atk"] += Math.floor(atkBooks[bookId].attInfo.atk/30)
				atkBookAtts["phyDef"] += Math.floor(atkBooks[bookId].attInfo.phyDef/30)
				atkBookAtts["magDef"] += Math.floor(atkBooks[bookId].attInfo.magDef/30)
			}
		}
	}
	for(var i = 0;i < atkTeam.length;i++){
		atkTeam[i] = this.getCharacterInfo(atkTeam[i],atkBookAtts)
	}
	var defTeam = []
	var fighting = new fightingFun(atkTeam,defTeam,{},{},{atkRaceType : this.getRaceType(atkTeam)})
	return {atkTeam : fighting.atkTeam,bookAtts : atkBookAtts}
}
model.getTeamCE = function(team) {
	var allCE = 0
	for(var i = 0;i < 6;i++){
		if(team[i]){
			allCE += lv_cfg[team[i]["lv"] || 1]["ce"]
			allCE += advanced_base[team[i]["ad"] || 0]["ce"]
			allCE += star_base[team[i]["star"] || 1]["ce"]
			if(team[i]["artifact"] !== undefined)
				allCE += artifact_level[team[i]["artifact"]]["ce"]
			for(var j = 1;j <= 10;j++){
				if(team[i]["acepack_"+j]){
					allCE += ace_pack[team[i]["acepack_"+j]]["ce"]
				}
			}
			for(var j = 1;j <= 4;j++){
				if(team[i]["equip_"+j])
        			allCE += equip_base[equip_level[team[i]["equip_"+j]]["part_"+j]]["ce"]
			}
			for(var j = 1;j <= 4;j++){
				if(team[i]["s"+j] && stone_base[team[i]["s"+j]])
        			allCE += stone_base[team[i]["s"+j]]["ce"]
			}
			for(var j = 5;j <= 8;j++){
				if(team[i]["s"+j] && stone_skill[team[i]["s"+j]])
        			allCE += stone_skill[team[i]["s"+j]]["ce"]
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