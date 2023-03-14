const TEAMLENGTH = 5 				//队伍人数
const MAXROUND = 20 				//最大回合数
const character = require("./entity/character.js")
const fightRecordFun = require("./fightRecord.js")
var model = function(atkInfo,defInfo,otps) {
	this.fightInfo = {"atk":{"rival":"def"},"def":{"rival":"atk"}}
	this.fightInfo.atk.info = JSON.parse(JSON.stringify(atkInfo || []))
	this.fightInfo.def.info = JSON.parse(JSON.stringify(defInfo || []))
	this.otps = JSON.parse(JSON.stringify(otps || {}))
	this.fightRecord = new fightRecordFun(this)
	//战斗数据
	this.seededNum = this.otps.seededNum || (new Date()).getTime()
	this.fightState = 0				//战斗状态 0 未开始  1 已加载数据  2 已开始战斗  3  已结束
	this.characterId = 0 			//角色ID
	this.runFlag = true 			//行动状态标识
	this.runCount = 1 				//行动次数标识
	this.round = 0					//当前回合
    this.manual = this.otps.manual  //手动操作标识
    this.video = this.otps.video  	//是否为录像
    this.allHero = [] 				//所有英雄列表
	this.cur_character = false 		//当前行动角色
	this.next_character = []		//插入行动角色
	this.win_team = "" 				//失败方  planish  打平  atk  攻方赢  def  守方赢
	this.loadData()
}

//载入数据
model.prototype.loadData = function() {
	console.log("loadData")
	if(this.fightState !== 0){
		console.log("战斗已开启")
		return
	}
	this.fightState = 1
	this.loadTeam("atk",this.fightInfo.atk.info)
	this.loadTeam("def",this.fightInfo.def.info)
}
//载入阵容
model.prototype.loadTeam = function(type,team) {
	console.log("loadTeam",type)
	this.fightInfo[type]["team"] = []
	this.fightInfo[type]["enemy"] = this.fightInfo[this.fightInfo[type]["rival"]]
	this.fightInfo[type]["survival"] = 0
	for(var i = 0;i < TEAMLENGTH;i++){
		var team_character = new character(this,team[i],[])
		team_character.id = this.characterId++
		team_character.index = i
		team_character.belong = type
		this.fightInfo[type]["team"][i] = team_character
		if(!team_character.isNaN){
			this.fightInfo[type]["survival"]++
			this.allHero.push(team_character)
		}
	}
	for(var i = 0;i < TEAMLENGTH;i++){
		team_character.team = this.fightInfo[type]["team"]
	}
}
//战斗开始
model.prototype.fightBegin = function() {
	console.log("fightBegin")
	if(this.fightState !== 1){
		console.log("未加载战斗数据")
		return
	}
	this.fightState = 2
	//战斗初始化
	//英雄初始化
	for(var i = 0;i < this.allHero.length;i++)
		this.allHero[i].init()
	//开始首回合
	this.nextRound()
}
//开始新整体回合
model.prototype.nextRound = function() {
	console.log("nextRound : "+this.round)
	if(this.round >= MAXROUND){
		//达到最大轮次，战斗结束
		this.fightOver("planish")
		return
	}
	for(var i = 0;i < this.allHero.length;i++)
		this.allHero[i].roundBegin()
	this.round++
	//运行检测
	this.runCheck()
}
//运行检测
model.prototype.runCheck = function() {
	if(this.manual){
		this.runFlag = false
		return
	}else if(this.checkMaster()){
		this.runCheck()
	}else{
		//下一个英雄行动
		this.nextCharacter()
	}
}
//选择下一个英雄
model.prototype.nextCharacter = function() {
	this.runCount++
	if(!this.runFlag)
		return
	if(this.fightState !== 2){
		return
	}
	var index = -1
	//找出下一个行动目标
	for(var i = 0;i < this.allHero.length;i++){
		if(this.allHero[i].checkAction()){
			if(index == -1 || this.allHero[i].getTotalAtt("speed") > this.allHero[index].getTotalAtt("speed")){
				index = i
			}
		}
	}
	if(index != -1){
		this.cur_character = this.allHero[index]
		this.beforeCharacter()
	}else{
		this.endRound()
		return
	}
}
//英雄回合开始前
model.prototype.beforeCharacter = function(){
	this.cur_character.before()
	this.actionCharacter()
}
//英雄回合行动
model.prototype.actionCharacter = function(){
	console.log(this.cur_character.belong+"-"+this.cur_character.index+"开始行动")
	// var skill = this.cur_character.chooseSkill()
	// if(skill)
	// 	skillManager.useSkill(skill)
	// this.after()
	this.afterCharacter()
}
//英雄回合结束
model.prototype.afterCharacter = function() {
	this.cur_character.after()
	this.checkOver()
	this.runCheck()
}
//整体回合结束
model.prototype.endRound = function(){
	for(var i = 0;i < this.allHero.length;i++)
		this.allHero[i].roundOver()
	this.nextRound()
}
//检查结束
model.prototype.checkOver = function() {
	for(var type in this.fightInfo){
		if(this.fightInfo[type]["survival"] <= 0){
			this.fightOver(this.fightInfo[type]["rival"])
		}
	}
}
//战斗结束
model.prototype.fightOver = function(teamType) {
	console.log("fightOver ",teamType)
	if(this.fightState !== 2){
		console.error("未开始战斗")
		return
	}
	this.win_team = teamType
	this.fightState = 3
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
	return JSON.stringify({atkInfo:this.fightInfo.atk.info,defInfo:this.fightInfo.def.info,otps:this.otps})
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
model.prototype.getCombatData = function() {
	var list = []
	for(var i = 0;i < this.allHero.length;i++)
		list.push(this.allHero[i].getCombatData())
	return list
}
module.exports = model