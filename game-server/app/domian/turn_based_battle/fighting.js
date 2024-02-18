'use strict';
const character = require("./entity/character.js")
const fightRecord = require("./fightRecord.js")
const locatorFun = require("./act/act_locator.js")
const formulaFun = require("./skill/formula.js")
const skillManagerFun = require("./skill/skillManager.js")
const TIME_LAG = 100
const MAX_TIME = 90000
var model = function(atkTeam,defTeam,otps,managers) {
	console.time("fight")
	this.fightInfo = {"atk":{"rival":"def","team":[]},"def":{"rival":"atk","team":[]}}
	this.fightInfo.atk.teamInfo = JSON.parse(JSON.stringify(atkTeam || []))
	this.fightInfo.def.teamInfo = JSON.parse(JSON.stringify(defTeam || []))
	this.otps = JSON.parse(JSON.stringify(otps || {}))
	this.seededNum = this.otps.seededNum || (new Date()).getTime()
	this.fightRecord = fightRecord
	this.fightRecord.clear(this)
	this.locator = new locatorFun(this)
	this.formula = new formulaFun(this)
	this.skillManager = new skillManagerFun(this)
	this.managers = managers
	this.buffManager = managers.buffManager
	this.RUNTIME = 0 				//当前时间
	this.maxRound = 20
	//战斗数据
	this.fightState = 0				//战斗状态 0 未开始  1 已加载数据  2 已开始战斗  3  已结束
	this.characterId = 0 			//角色ID
	this.runFlag = true 			//行动状态标识
	this.runCount = 1 				//行动次数标识
	this.round = 0					//当前回合
    this.manual = this.otps.manual  //手动操作标识
    this.video = this.otps.video  	//是否为录像
    this.allHero = {} 				//所有英雄映射表
	this.cur_character = false 		//当前行动角色
	this.next_character = []		//插入行动角色
	this.win_team = "" 				//失败方  planish  打平  atk  攻方赢  def  守方赢
	this.nextRecord = [] 			//后续插入记录
	this.heroAtionMonitor = []		//行动监听
	this.anyDieMonitor = [] 		//任意角色阵亡监听
	this.loadData()
}
//载入数据
model.prototype.loadData = function() {
	if(this.fightState !== 0){
		console.log("战斗已开启")
		return
	}
	this.fightState = 1
	this.loadTeam("atk")
	this.loadTeam("def")
	this.loadEnemy()
}
//载入阵容
model.prototype.loadTeam = function(belong) {
	var teamCfg = this.fightInfo[belong]["teamInfo"].shift() || {}
	this.fightInfo[belong]["team"] = []
	this.fightInfo[belong]["survival"] = 0
	this.fightInfo[belong]["skillMonitor"] = []
	this.fightInfo[belong]["teamAtt"] = {}
	var teamTalents = this.managers.getTeamTalents(teamCfg)
	for(var index = 0;index < this.fightInfo[belong]["teamInfo"].length;index++){
		this.loadHero(belong,index,this.fightInfo[belong]["teamInfo"][index],teamTalents,teamCfg)
	}
}
model.prototype.loadHero = function(belong,index,info,teamTalents,teamCfg) {
	var talents = this.managers.getHeroTalents(info,teamCfg)
	Object.assign(talents,teamTalents)
	var team_character = new character(this,info,talents)
	team_character.id = this.characterId++
	team_character.index = index
	team_character.belong = belong
	team_character.rival = this.fightInfo[belong]["rival"]
	team_character.fightInfo = this.fightInfo[belong]
	if(!team_character.isNaN){
		this.fightInfo[belong]["survival"]++
		this.fightInfo[belong]["team"][team_character.id] = team_character
		this.allHero[team_character.id] = team_character
		if(belong == "atk")
			team_character.pos = {x : 500,y : 0}
		else
			team_character.pos = {x : 0,y : 0}
	}
}
//载入敌方阵容
model.prototype.loadEnemy = function() {
	for(var i in this.fightInfo["atk"]["team"]){
		this.fightInfo["atk"]["team"][i].team = this.fightInfo["atk"]["team"]
		this.fightInfo["atk"]["team"][i].enemyTeam = this.fightInfo["def"]["team"]
	}
	for(var i in this.fightInfo["def"]["team"]){
		this.fightInfo["def"]["team"][i].team = this.fightInfo["def"]["team"]
		this.fightInfo["def"]["team"][i].enemyTeam = this.fightInfo["atk"]["team"]
	}
}
//获取战斗数据
model.prototype.getTeamData = function() {
	//英雄初始化
	var teamDatas = {}
	for(var i in this.allHero){
		this.allHero[i].init()
		teamDatas[this.allHero[i].id] = this.allHero[i].getFullInfo()
	}
	return teamDatas
}
//战斗开始
model.prototype.fightBegin = function() {
	if(this.fightState !== 1){
		// console.log("未加载战斗数据")
		return
	}
	var info = {type : "fightBegin",allHero : [],maxRound : this.maxRound}
	this.fightState = 2
	//战斗初始化
	//英雄初始化
	for(var i in this.allHero){
		this.allHero[i].init()
		info.allHero.push(this.allHero[i].getSimpleInfo())
	}
	this.fightRecord.push(info)
	for(var i in this.allHero)
		this.allHero[i].begin()
	//开始首回合
	this.trampoline(this.timeUpdate.bind(this))
}
//英雄移除
model.prototype.heroRemove = function(hero) {
	delete this.allHero[hero.id]
	delete this.fightInfo[hero.belong]["team"][hero.id]
	this.fightInfo[hero.belong]["survival"]--
}
//英雄添加
model.prototype.heroAdd = function(hero) {
	this.allHero[hero.id] = hero
	this.fightInfo[hero.belong]["team"][hero.id] = hero
	this.fightInfo[hero.belong]["survival"]++
}
//刷新
model.prototype.timeUpdate = function() {
	this.RUNTIME += TIME_LAG
	for(var i in this.allHero)
		this.allHero[i].timeUpdate(TIME_LAG)
	if(!this.checkOver())
		this.timeUpdate()
}
//检查结束
model.prototype.checkOver = function() {
	this.insertTmpRecord()
	//判断结束
	if(this.RUNTIME >= MAX_TIME){
		this.fightOver("def")
		return true
	}
	for(var belong in this.fightInfo){
		if(this.fightInfo[belong]["survival"] <= 0){
			this.fightOver(this.fightInfo[belong]["rival"])
			return true
		}
	}
	return false
}
//战斗结束
model.prototype.fightOver = function(teamType) {
	if(this.fightState !== 2){
		// console.error("未开始战斗")
		return
	}
	this.win_team = teamType
	this.fightState = 3
	var info = {type:"fightOver","win_team":this.win_team,allHero:[]}
	for(var i in this.allHero){
		info.allHero.push(this.allHero[i].getOverData())
	}
	this.fightRecord.push(info)
	console.timeEnd("fight")
}
//获取常规战斗结果，打平为守方获胜
model.prototype.getNormalWin = function() {
	return this.win_team === "atk" ? true : false
}
//获取特殊战斗结果，打平计算伤害
model.prototype.getSpecialWin = function() {
	return this.win_team === "atk" ? true : false
}
//获取战斗录像
model.prototype.getRecordStr = function() {
	return JSON.stringify({atkTeam:this.fightInfo.atk.teamInfo,defTeam:this.fightInfo.def.teamInfo,otps:this.otps})
}
//检测主动技能
model.prototype.checkMaster = function() {
	// if(this.video){
	// 	//录像模式检测技能释放
	// 	if(this.masterSkillsRecord.length){
	// 		if(this.masterSkillsRecord[0]["runCount"] == this.runCount){
	// 			var info = this.masterSkillsRecord.shift()
	// 			if(info.belong == "atk"){
	// 				return this.atkMasterSkill(info["index"])
	// 			}else if(info.belong == "def"){
	// 				return this.defMasterSkill(info["index"])
	// 			}
	// 		}
	// 	}
	// }else if(this.fightState){
	// 	//自动战斗模式检测技能释放
	// 	if(this.atkMaster.checkManualModel())
	// 		return true
	// 	if(this.defMaster.checkManualModel())
	// 		return true
	// }
	return false
}
//随机数
model.prototype.random = function(reason) {
    this.seededNum = (this.seededNum * 9301 + 49297) % 233280
    var rnd = this.seededNum / 233280
    // console.log("seeded.random",rnd,reason)
    return rnd
}
//判断满足随机条件
model.prototype.randomCheck = function(num,reason) {
	return (num > 1 || this.random(reason) < num) ? true : false
}
model.prototype.getCombatData = function() {
	var list = []
	for(var i in this.allHero)
		list.push(this.allHero[i].getCombatData())
	return list
}
//临时记录插入
model.prototype.insertTmpRecord = function() {
	for(var i = 0;i < this.nextRecord.length;i++)
		this.fightRecord.push(this.nextRecord[i])
	this.nextRecord = []
}
//蹦床函数
model.prototype.trampoline = function(f) {
	while (f && f instanceof Function) {
		f = f()
	}
	return f
}
// //开始新整体回合
// model.prototype.nextRound = function() {
// 	if(this.fightState !== 2)
// 		return
// 	if(this.round >= this.maxRound){
// 		//达到最大轮次，战斗结束
// 		this.fightOver("planish")
// 		return
// 	}
// 	this.round++
// 	this.fightRecord.push({type : "nextRound",round : this.round})
// 	for(var i in this.allHero)
// 		this.allHero[i].roundBegin()
// 	//运行检测
// 	return this.runCheck.bind(this)
// }
// //运行检测
// model.prototype.runCheck = function() {
// 	if(this.manual){
// 		this.runFlag = false
// 		return
// 	}else if(this.checkMaster()){
// 		return this.runCheck.bind(this)
// 	}else{
// 		//下一个英雄行动
// 		return this.nextCharacter.bind(this)
// 	}
// }
// //选择下一个英雄
// model.prototype.nextCharacter = function() {
// 	this.runCount++
// 	if(!this.runFlag)
// 		return
// 	if(this.fightState !== 2){
// 		return
// 	}
// 	var id = -1
// 	//找出下一个行动目标
// 	for(var i in this.allHero){
// 		if(this.allHero[i].checkAction()){
// 			if(id == -1 || this.allHero[i].getTotalAtt("speed") > this.allHero[id].getTotalAtt("speed")){
// 				id = this.allHero[i].id
// 			}
// 		}
// 	}
// 	if(id != -1){
// 		this.cur_character = this.allHero[id]
// 		return this.beforeCharacter.bind(this)
// 	}else{
// 		return this.endRound.bind(this)
// 	}
// }
// //英雄回合开始前
// model.prototype.beforeCharacter = function(){
// 	this.insertTmpRecord()
// 	this.cur_character.before()
// 	return this.actionCharacter.bind(this)
// }
// //英雄回合行动
// model.prototype.actionCharacter = function(){
// 	var skillInfo
// 	if(this.cur_character.buffs["chaofeng"] && this.cur_character.buffs["chaofeng"].list[0].attacker){
// 		skillInfo = this.cur_character.useNormalSkill()
// 		if(skillInfo)
// 			skillInfo.targets = [this.cur_character.buffs["chaofeng"].list[0].attacker]
// 	}else{
// 		skillInfo = this.cur_character.chooseSkill()
// 	}
// 	if(skillInfo){
// 		this.skillManager.useSkill(skillInfo)
// 	}else{
// 		//未行动恢复怒气
// 		this.cur_character.addAnger(20,true)
// 	}
// 	return this.afterCharacter.bind(this)
// }
// //英雄回合结束
// model.prototype.afterCharacter = function() {
// 	this.cur_character.after()
// 	this.checkOver()
// 	return this.runCheck.bind(this)
// }
// //整体回合结束
// model.prototype.endRound = function(){
// 	for(var i in this.allHero)
// 		this.allHero[i].roundEnd()
// 	this.checkOver()
// 	return this.nextRound.bind(this)
// }
module.exports = model