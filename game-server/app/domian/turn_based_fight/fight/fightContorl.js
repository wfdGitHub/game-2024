var bearcat = require("bearcat")
const fightingFun = require("./fighting.js")
const fightRecord = require("./fightRecord.js")
const masterEntity = require("../entity/master.js")
const powerEntity = require("../entity/powerEntity.js")
const fightCfg = require("./fightCfg.js")
const officer = fightCfg.getCfg("officer")
var fightVerifyInfo = {}
//战斗控制器
var model = function() {
	this.fighting = false
	this.overInfo = {}
}
const handlers = ["util","equip","fabao","hero","standard"]
for(var i = 0;i < handlers.length;i++)
	require("../handler/"+handlers[i]+".js").call(model,model)
model.powerEntity = powerEntity
// //自定义战斗配置// model.libertyFight = function(atkTeam,defTeam,otps) {
// 	var fighting = new fightingFun(atkTeam,defTeam,otps)
// 	fighting.nextRound()
// 	return fightRecord.getList()
// }
//加载战斗
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
	try{
		otps.manual = false
		var fighting = model.loadFight(atkTeam,defTeam,otps)
		fighting.fightBegin()
		return fightRecord.isWin()
	}catch(err){
		var txt = JSON.stringify(fightVerifyInfo)
		console.log(err)
		console.log(txt)
		var redisDao = bearcat.getBean("redisDao")
		if(redisDao && redisDao.db)
			redisDao.db.rpush("fight_faild",txt)
		return false
	}
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
		for(var i = 1;i < fightVerifyInfo.atkTeam.length;i++){
				delete fightVerifyInfo.atkTeam[i]["combat"]
				delete fightVerifyInfo.atkTeam[i]["hId"]
				delete fightVerifyInfo.atkTeam[i]["custom"]
				delete fightVerifyInfo.atkTeam[i]["lock"]
		}
		for(var i = 1;i < fightVerifyInfo.defTeam.length;i++){
				delete fightVerifyInfo.defTeam[i]["combat"]
				delete fightVerifyInfo.defTeam[i]["hId"]
				delete fightVerifyInfo.defTeam[i]["custom"]
				delete fightVerifyInfo.defTeam[i]["lock"]
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
//获取战斗结束数据
model.getOverInfo = function() {
	var overInfo = fightRecord.list[fightRecord.list.length-1]
	if(overInfo && overInfo["type"] == "fightOver")
		return fightRecord.list[fightRecord.list.length-1]
	else
		return {"err":"not find overInfo"}
}
//获取战斗记录
model.getFightRecord = function() {
	return fightRecord.getList()
}
//获取阶段战斗数据
model.getFightStageRecord = function() {
	return fightRecord.getStageList()
}
//获取主动技能数据
model.getPowerInfo = function(powerInfo){
	return this.powerEntity.getPowerInfo(powerInfo)
}
//获取团队数据
model.getTeamData = function(team,belong) {
	var team = JSON.parse(JSON.stringify(team))
	var teamCfg = team.shift() || {}
    var masterAtts = {}
    var powerAtts = {}
    var heroAtts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0,"amplify":0,"reduction":0}
    var gSkill = {}
    var maxLv = 0
    for(var i = 0;i < team.length;i++)
    	if(team[i]["lv"] > maxLv)
    		maxLv = team[i]["lv"]
	//主角
	var master = new masterEntity({belong:belong,manualModel:teamCfg["manualModel"],maxLv:maxLv})
	//爵位属性
	if(teamCfg["officer"]){
		heroAtts["amplify"] += officer[teamCfg["officer"]]["amplify"]
		heroAtts["reduction"] += officer[teamCfg["officer"]]["reduction"]
	}
	//主动技能属性
	for(var i = 1;i <= 4;i++){
		if(teamCfg["power"+i]){
			var powerInfo = teamCfg["power"+i]
			powerAtts = this.powerEntity.getPowerInfo(powerInfo)
			teamCfg["power"+i]["basic"] = powerAtts["basic"]
		}
	}
	//家园属性 
	if(teamCfg["manors"])
		for(var i = 1;i <= 6;i++)
			if(teamCfg["manors"]["slot_ATT_"+i])
				teamCfg["manors"]["slot_ATT_"+i] = JSON.parse(teamCfg["manors"]["slot_ATT_"+i])
	//英雄
	var characters = []
	for(var i = 0;i < team.length;i++){
		var hero = this.getCharacterInfo(team[i],heroAtts,teamCfg)
		if(hero)
			characters.push(hero)
	}
	if(teamCfg.npcTeam){
		for(var i = 0;i < teamCfg.npcTeam.length;i++){
			teamCfg.npcTeam[i]["hero"] = this.getCharacterInfo(teamCfg.npcTeam[i]["hero"],heroAtts,teamCfg)
		}
	}
    var teamAdds = {}
    if(teamCfg){
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
	return {master:master,team:characters,teamAdds:teamAdds,masterAtts:masterAtts,powerAtts:powerAtts,heroAtts:heroAtts,teamCfg:teamCfg}
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
module.exports = model