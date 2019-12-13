var skillsCfg = require("../../../../config/gameCfg/skills.json")
var charactersCfg = require("../../../../config/gameCfg/characters.json")
var advanced_base = require("../../../../config/gameCfg/advanced_base.json")
var advanced_talent = require("../../../../config/gameCfg/advanced_talent.json")
var talent_list = require("../../../../config/gameCfg/talent_list.json")
var fightingFun = require("./fighting.js")
var fightRecord = require("./fightRecord.js")
var character = require("../entity/character.js")
//战斗控制器
var model = function() {
	this.fighting = false
}
//开始战斗
model.beginFight = function(atkTeam,defTeam,otps) {
	var fighting = new fightingFun(atkTeam,defTeam,otps)
	fighting.nextRound()
	return fightRecord.getList()
}
//获取角色数据
model.getCharacterInfo = function(info) {
	if(!info || !charactersCfg[info.id]){
		return false
	}
	let id = info.id
	Object.assign(info,charactersCfg[id])
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
	//进阶计算
	if(info.advanced){
		if(advanced_talent[info.id]){
			var advancedInfo = {}
			for(var i = 1;i <= info.advanced;i++){
				var talentId = advanced_talent[info.id]["talent_"+i]
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
			model.mergeData(info,advancedInfo)
		}
		if(advanced_base[info.advanced] && advanced_base[info.advanced]["att"])
				var strs = advanced_base[info.advanced]["att"].split("&")
				var advancedInfo = {}
				strs.forEach(function(m_str) {
					var m_list = m_str.split(":")
					advancedInfo[m_list[0]] = Number(m_list[1])
				})
				model.mergeData(info,advancedInfo)
	}
	return new character(info)
}
//数据合并
model.mergeData = function(info1,info2) {
	for(var i in info2){
		if(info1[i]){
			if(Number.isInteger(info1[i]) && Number.isInteger(info2[i])){
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