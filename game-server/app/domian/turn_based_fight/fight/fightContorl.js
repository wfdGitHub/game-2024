var skillsCfg = require("../../../../config/gameCfg/skills.json")
var charactersCfg = require("../../../../config/gameCfg/characters.json")
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
	//
	return new character(info)
}
module.exports = model