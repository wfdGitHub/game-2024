var skillsCfg = require("../../../../config/gameCfg/skills.json")
var herosCfg = require("../../../../config/gameCfg/heros.json")
var lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
var star_base = require("../../../../config/gameCfg/star_base.json")
var advanced_base = require("../../../../config/gameCfg/advanced_base.json")
var advanced_talent = require("../../../../config/gameCfg/advanced_talent.json")
var talent_list = require("../../../../config/gameCfg/talent_list.json")
var equip_base = require("../../../../config/gameCfg/equip_base.json")
var equip_level = require("../../../../config/gameCfg/equip_level.json")
var fightingFun = require("./fighting.js")
var fightRecord = require("./fightRecord.js")
var character = require("../entity/character.js")
//战斗控制器
var model = function() {
	this.fighting = false
}
//自定义战斗配置
model.libertyFight = function(atkTeam,defTeam,otps) {
	var fighting = new fightingFun(atkTeam,defTeam,otps)
	fighting.nextRound()
	return fightRecord.getList()
}
//根据配置表生成战斗配置
model.beginFight = function(atkTeam,defTeam,otps) {
	var atkTeamList = []
	var defTeamList = []
    for(var i = 0;i < 6;i++){
      atkTeamList[i] = this.getCharacterInfo(atkTeam[i])
      defTeamList[i] = this.getCharacterInfo(defTeam[i])
    }
	var fighting = new fightingFun(atkTeamList,defTeamList,otps)
	fighting.nextRound()
	return fightRecord.isWin()
}
model.getFightRecord = function() {
	return fightRecord.getList()
}
//获取角色数据
model.getCharacterInfo = function(info) {
	if(!info || !herosCfg[info.id]){
		return false
	}
	info = Object.assign({},info)
	let id = info.id
	Object.assign(info,herosCfg[id])
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
		var lvInfo = {
		    "maxHP": lv_cfg[info.lv].manHP,
		    "atk": lv_cfg[info.lv].atk,
		    "phyDef": lv_cfg[info.lv].phyDef,
		    "magDef": lv_cfg[info.lv].magDef,
		}
		model.mergeData(info,lvInfo)
	}
	//装备计算
	var equip_suit = {}
	for(var part = 1;part <= 4;part++){
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
				if(talentId){
					if(talent_list[talentId]){
						let tmpTalent = {}
						tmpTalent[talent_list[talentId].key1] = talent_list[talentId].value1
						if(talent_list[talentId].key2)
							tmpTalent[talent_list[talentId].key2] = talent_list[talentId].value2
						model.mergeData(starInfo,tmpTalent)
					}else{
						console.error("talentId error",talentId)
					}
				}
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
				if(talentId){
					if(talent_list[talentId]){
						let tmpTalent = {}
						tmpTalent[talent_list[talentId].key1] = talent_list[talentId].value1
						if(talent_list[talentId].key2)
							tmpTalent[talent_list[talentId].key2] = talent_list[talentId].value2
						model.mergeData(advancedInfo,tmpTalent)
					}else{
						console.error("talentId error",talentId)
					}
				}
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
	return new character(info)
}
//获取团队显示数据
model.getTeamShowData = function(team) {
	var atkTeam = team.concat([])
	for(var i = 0;i < atkTeam.length;i++){
		atkTeam[i] = this.getCharacterInfo(atkTeam[i])
	}
	var defTeam = []
	var fighting = new fightingFun(atkTeam,defTeam,{})
	return fighting.atkTeam
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