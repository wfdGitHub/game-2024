//战斗模块
var seeded = require("./seeded.js")
var locator = require("./locator.js")
var formula = require("./formula.js")
var skillManager = require("../skill/skillManager.js")
var character = require("../entity/character.js")
var fightRecord = require("./fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var maxRound = 20				//最大回合
var indexMap = [4,0,2,1,3,5]
var model = function(atkInfo,defInfo,otps) {
    fightRecord.init()
    this.atkTeamInfo = {"comeId":0,"rival":"def"}
    this.defTeamInfo = {"comeId":0,"rival":"atk"}
	this.seededNum = otps.seededNum || (new Date()).getTime()
    this.seeded = new seeded(this.seededNum)
    this.locator = new locator(this.seeded)
    this.formula = new formula(this.seeded,otps)
	this.isFight = true				//战斗中标识
	this.runFlag = true 			//回合行动标识
	this.runCount = 1 				//行动次数标识
	this.round = 0					//当前回合
	this.maxRound = otps.maxRound || maxRound		//最大回合
	this.atkTeam = atkInfo.team			//攻方阵容  长度为6的角色数组  位置无人则为NULL
	this.defTeam = defInfo.team			//守方阵容
	this.atkTeamCfg = atkInfo.teamCfg   //攻方团队数据
	this.defTeamCfg = defInfo.teamCfg   //守方团队数据
	this.atkMaster = atkInfo.master		//攻方主角
	this.defMaster = defInfo.master		//守方主角
	this.allHero = []				//所有英雄列表
	this.character = false 			//当前行动角色
	this.next_character = []		//插入行动角色
	this.teamDiedList = {"atk":[],"def":[]} //死亡列表
	this.diedList = []				//死亡列表
    this.manual = otps.manual || false  //手动操作标识
    this.video = otps.video || false 	//是否为录像
	this.masterSkills = [] 			//主角技能列表
	this.masterIndex = 0 			//技能列表标识
	this.globalId = 0 				//全局英雄ID
	if(otps.masterSkills && Array.isArray(otps.masterSkills))
		this.masterSkillsRecord = JSON.parse(JSON.stringify(otps.masterSkills))   //录像技能释放列表
	else
		this.masterSkillsRecord = []
	this.load("atk",otps)
	this.load("def",otps)
    skillManager.init(this,this.locator,this.formula,this.seeded)
    this.skillManager = skillManager
}
//初始配置
model.prototype.load = function(belong,otps) {
	var teamAdds = otps[belong+"TeamAdds"] ? JSON.parse(JSON.stringify(otps[belong+"TeamAdds"])) : {}
	var teamInfo = this[belong+"TeamInfo"]
	var rival = teamInfo["rival"]
	teamInfo["realms"] = {"1":0,"2":0,"3":0,"4":0,"5":0}
	teamInfo["realms_ation"] = {"1":0,"2":0,"3":0,"4":0,"5":0}
	var team = this[belong+"Team"]
	for(var i = 0;i < team.length || i < 6;i++){
		if(!team[i]){
			team[i] = new character({})
			team[i].isNaN = true
		}else{
			if(!teamInfo["realms"][team[i].realm])
				teamInfo["realms"][[team[i].realm]] = 0
			teamInfo["realms"][team[i].realm]++
		}
		team[i].init(this)
		if(team[i].resurgence_team){
			teamInfo["resurgence_team_character"] = team[i]
			teamInfo["resurgence_team"] = team[i].resurgence_team
			if(team[i]["resurgence_realmRate"]){
				teamInfo["resurgence_realmRate"] = team[i]["resurgence_realmRate"]
				teamInfo["resurgence_realmId"] = team[i]["realm"]
			}
		}
		team[i].team = team
		team[i].enemy = this[rival+"Team"]
		team[i].heroId = team[i].heroId
		team[i].id = this.globalId++
		if(team[i].team_adds){
			for(var j in team[i].team_adds){
				if(!teamAdds[j]){
					teamAdds[j] = team[i].team_adds[j]
				}else{
					teamAdds[j] += team[i].team_adds[j]
				}
			}
		}
	}
	teamInfo["realms_survival"] = teamInfo["realms"]
	//属性加成
	for(var i = 0;i < team.length;i++){
		team[i].calAttAdd(teamAdds)
		team[i].teamInfo = teamInfo
	}
	this[belong+"Master"].init(this,team[0].team,team[0].enemy,this.locator,this.seeded,this[rival+"Master"])
	var comeonNum = this[belong+"TeamCfg"]["comeonNum"] || 3
	for(var i = 0;i < comeonNum;i++)
		this.loadHero(belong,indexMap[i])
}
//载入英雄
model.prototype.loadHero = function(belong,index,show) {
	var id = this[belong+"TeamInfo"]["comeId"]
	for(var i = id;i < this[belong+"Team"].length;i++){
		this[belong+"TeamInfo"]["comeId"]++
		var hero = this[belong+"Team"][i]
		if(!hero.isNaN && hero["surplus_health"] !== 0){
			if(show)
				fightRecord.push({type:"hero_comeon",id:hero.id,index:index,belong:belong})
			hero.index = index
			hero.belong = belong
			hero.comeon = true
			hero.heroComeon()
			this.allHero.push(hero)
			break
		}
	}
}
//战斗开始
model.prototype.fightBegin = function() {
	var info = {type : "fightBegin",atkTeam : [],defTeam : [],seededNum : this.seededNum,maxRound : this.maxRound}
	for(var i = 0;i < this.atkTeam.length;i++){
		this.atkTeam[i].begin()
		info.atkTeam.push(this.atkTeam[i].getSimpleInfo())
	}
	for(var i = 0;i < this.defTeam.length;i++){
		this.defTeam[i].begin()
		info.defTeam.push(this.defTeam[i].getSimpleInfo())
	}
	info.comeonHero = []
	for(var i = 0;i < this.allHero.length;i++)
		info.comeonHero.push({id:this.allHero[i].id,index:this.allHero[i].index})
	fightRecord.push(info)
	this.trampoline(this.nextRound.bind(this))
}
//开始新轮次
model.prototype.nextRound = function() {
	if(this.round >= this.maxRound){
		//达到最大轮次，战斗结束
		this.fightOver(false,true)
		return
	}
	this.round++
	fightRecord.push({type : "nextRound",round : this.round})
	//助战上阵
	var comeonList = []
	for(var i = 0;i < this.allHero.length;i++){
		if(this.allHero[i].died){
			comeonList.push({"belong":this.allHero[i].belong,"index":this.allHero[i].index})
			this.allHero.splice(i,1)
			i--
		}
	}
	for(var i = 0;i < comeonList.length;i++)
		this.loadHero(comeonList[i].belong,comeonList[i].index,true)
	// console.log("第 "+this.round+" 轮开始")
	for(var i = 0;i < this.allHero.length;i++){
		this.allHero[i].isAction = false
		this.allHero[i].roundBegin()
	}
	return this.runCheck.bind(this)
}
//整体回合结束
model.prototype.endRound = function() {
	for(var i = 0;i < 6;i++){
		this.atkTeam[i].roundOver()
		this.defTeam[i].roundOver()
		if(this.atkTeam[i].round_anger_rate && this.atkTeam[i].curAnger < 4){
			if(this.seeded.random("回合结束怒气") < this.atkTeam[i].round_anger_rate)
				this.atkTeam[i].addAnger(4 - this.atkTeam[i].curAnger)
		}
		if(this.defTeam[i].round_anger_rate && this.defTeam[i].curAnger < 4){
			if(this.seeded.random("回合结束怒气") < this.defTeam[i].round_anger_rate)
				this.defTeam[i].addAnger(4 - this.defTeam[i].curAnger)
		}
	}
	this.atkTeamInfo["realms_ation"] = {"1":0,"2":0,"3":0,"4":0}
	this.defTeamInfo["realms_ation"] = {"1":0,"2":0,"3":0,"4":0}
	this.atkMaster.endRound()
	this.defMaster.endRound()
	if(!this.checkOver())
		return this.nextRound.bind(this)
}
//运行检测
model.prototype.runCheck = function() {
	if(this.manual){
		this.runFlag = false
		return
	}else if(this.checkMaster()){
		return this.runCheck.bind(this)
	}else{
		return this.run.bind(this)
	}
}
//轮到下一个角色行动
model.prototype.run = function() {
	this.runCount++
	if(!this.runFlag)
		return
	if(!this.isFight){
		return
	}
	var index = -1
	//找出下一个行动目标
	for(var i = 0;i < this.allHero.length;i++){
		if(!this.allHero[i].died && !this.allHero[i].isAction && !this.allHero[i].buffs["banish"]){
			if(index == -1 || this.allHero[i].getTotalAtt("speed") > this.allHero[index].getTotalAtt("speed")){
				index = i
			}
		}
	}
	if(index != -1){
		this.character = this.allHero[index]
		this.character.isAction = true
		return this.before.bind(this)
	}else{
		return this.endRound.bind(this)
		return
	}
}
//回合前结算
model.prototype.before = function() {
	fightRecord.push({type : "characterAction",id : this.character.id})
	this.character.before()
	return this.action.bind(this)
}
//开始行动释放技能
model.prototype.action = function() {
	var skill = this.character.chooseSkill()
	if(skill){
		skillManager.useSkill(skill)
	}else{
		fightRecord.push({type : "freeze",id : this.character.id})
		if(this.character.no_ation_buff)
			buffManager.createBuff(this.character,this.character,{buffId : this.character.no_ation_buff.buffId,buffArg : this.character.no_ation_buff.buffArg,duration : this.character.no_ation_buff.duration})
	}
	return this.after.bind(this)
}
//行动后结算
model.prototype.after = function() {
	this.character.after()
	if(this.character.next_must_crit)
		this.character.must_crit = true
	else
		this.character.must_crit = false
	this.character.next_must_crit = false
	this.character = false
	this.diedListCheck()
	//检测战斗是否结束
	if(!this.checkOver()){
		if(this.next_character[0] && (this.next_character[0].died || this.next_character[0].extra_count >= 7)){
			this.next_character.shift()
		}
		if(this.next_character.length){
			var next_character = this.next_character.shift()
			if(next_character.died){
				return this.runCheck.bind(this)
			}else{
				fightRecord.push({type : "extraAtion",id : next_character.id})
				this.character = next_character
				this.character.extra_count++
				return this.before.bind(this)
			}
		}else{
			return this.runCheck.bind(this)
		}
	}
}
//检查结束
model.prototype.checkOver = function() {
	this.diedListCheck()
	var flag = true
	for(var i = 0;i < this.atkTeam.length;i++){
		if(!this.atkTeam[i].died && !this.atkTeam[i].buffs["ghost"]){
			flag = false
			break
		}
	}
	if(flag){
		this.fightOver(false)
		return true
	}
	flag = true
	for(var i = 0;i < this.defTeam.length;i++){
		if(!this.defTeam[i].died && !this.defTeam[i].buffs["ghost"]){
			flag = false
			break
		}
	}
	if(flag){
		this.fightOver(true)
		return true
	}
	return false
}
//死亡检测
model.prototype.diedListCheck = function() {
	for(var i = 0;i < this.diedList.length;i++){
		for(var j in this.diedList[i]["died_buffs"]){
			var buffInfo = this.diedList[i]["died_buffs"][j]
			var buffTargets = this.locator.getBuffTargets(this.diedList[i],buffInfo.buff_tg)
			for(var k = 0;k < buffTargets.length;k++){
				if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
					buffManager.createBuff(this.diedList[i],buffTargets[k],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
				}
			}
		}
		if(this.diedList[i].died_use_skill){
			var flag = false
			for(var j = 0;j < this.diedList[i].team.length;j++){
				if(!this.diedList[i].team[j].died){
					flag = true
					break
				}
			}
			if(flag)
				skillManager.useSkill(this.diedList[i].angerSkill)
		}
		//死亡触发感电
		if(this.diedList[i].flash_died_settle){
			var targets = this.locator.getTargets(this.diedList[i],"enemy_all")
			for(var k = 0;k < targets.length;k++){
				if(targets[k].buffs["flash"])
					targets[k].buffs["flash"].settle()
			}
		}
		//死亡时全队回血
		if(this.diedList[i].died_heal_team){
			var targets = this.locator.getTargets(this.diedList[i],"team_all")
			var healValue = Math.round(this.diedList[i].getTotalAtt("atk") * this.diedList[i].died_heal_team)
			var tmpRecord = {type : "other_heal",targets : []}
			for(var k = 0;k < targets.length;k++){
				var info = this.formula.calHeal(this.diedList[i],targets[k],healValue,{})
				tmpRecord.targets.push(targets[k].onHeal(this.diedList[i],info))
			}
			fightRecord.push(tmpRecord)
			this.diedList[i].died_heal_team = 0
		}
		//死亡时全队复活
		if(this.diedList[i].died_rescue_team){
			var targets = this.locator.getTargets(this.diedList[i],"team_died_all")
			for(var k = 0;k < targets.length;k++){
				targets[k].resurgence(this.diedList[i].died_rescue_team,this.diedList[i])
			}
			this.diedList[i].died_rescue_team = 0
		}
		//复活判断
		if(!this.diedList[i].buffs["jinhun"]){
        	if(this.diedList[i].first_resurgence && this.seeded.random("复活判断") < this.diedList[i].first_resurgence){
	            this.diedList[i].first_resurgence = 0
	            this.diedList[i].resurgence(0.3)
        	}else if(this.diedList[i].died_resurgence){
				this.diedList[i].died_resurgence = false
				this.diedList[i].resurgence(1,this.diedList[i])
			}else if(this.diedList[i].resurgence_self && this.seeded.random("复活判断") < this.diedList[i].resurgence_self){
				this.diedList[i].resurgence(1,this.diedList[i])
			}else if(this.diedList[i].teamInfo.resurgence_team){
				var rate = this.diedList[i].teamInfo.resurgence_team
				if(this.diedList[i].teamInfo.resurgence_realmRate && this.diedList[i].teamInfo.resurgence_realmId == this.diedList[i].realm){
					rate = rate * this.diedList[i].teamInfo.resurgence_realmRate
				}
				this.diedList[i].resurgence(rate,this.diedList[i].teamInfo.resurgence_team_character)
				delete this.diedList[i].teamInfo.resurgence_team
			}
		}
		if(this.diedList[i].died_once_buff){
			var buffInfo = this.diedList[i].died_once_buff
			if(!(buffInfo.buffId == "ghost" && !this.diedList[i].died)){
				var buffTargets = this.locator.getBuffTargets(this.diedList[i],buffInfo.buff_tg)
				for(var k = 0;k < buffTargets.length;k++){
					if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
						buffManager.createBuff(this.diedList[i],buffTargets[k],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
				this.diedList[i].died_once_buff = false
			}
		}
		//遗计
		if(this.diedList[i].last_strategy && this.diedList[i].curAnger > 0){
			var targets = this.locator.getTargets(this.diedList[i],"friend_minAnger_1")
			if(targets[0]){
				fightRecord.push({type : "show_tag",id : this.diedList[i].id,tag:"last_strategy"})
				targets[0].addAnger(this.diedList[i].curAnger)
			}
		}
		this.diedList[i].diedClear()
	}
	this.diedList = []
}
//继续运行
model.prototype.keepRun = function() {
	if(this.video)
		this.checkVideo()
	if(this.manual && !this.runFlag){
		this.runFlag = true
		this.run()
		return fightRecord.getStageList()
	}else{
		return false
	}
}
//攻方主角释放主动技能
model.prototype.atkMasterSkill = function(index) {
	if(this.isFight && this.atkMaster.masterPower(index)){
		var info = {
			belong : this.atkMaster.belong,
			runCount : this.runCount,
			index : index
		}
		this.masterSkills.push(info)
		return true
	}else{
		return false
	}
}
//守方主角释放主动技能
model.prototype.defMasterSkill = function(index) {
	if(this.isFight && this.defMaster.masterPower(index)){
		var info = {
			belong : this.defMaster.belong,
			runCount : this.runCount,
			index : index
		}
		this.masterSkills.push(info)
	}else{
		return false
	}
}
//获取主动技能显示数据
model.prototype.getMasterShowData = function() {
	var info = {
		"atkMaster" : this.atkMaster.getShowData(),
		"defMaster" : this.defMaster.getShowData()
	}
	return info
}
//检测主动技能
model.prototype.checkMaster = function() {
	if(this.video){
		//录像模式检测技能释放
		if(this.masterSkillsRecord.length){
			if(this.masterSkillsRecord[0]["runCount"] == this.runCount){
				var info = this.masterSkillsRecord.shift()
				if(info.belong == "atk"){
					return this.atkMasterSkill(info["index"])
				}else if(info.belong == "def"){
					return this.defMasterSkill(info["index"])
				}
			}
		}
	}else if(this.isFight){
		//自动战斗模式检测技能释放
		if(this.atkMaster.checkManualModel())
			return true
		if(this.defMaster.checkManualModel())
			return true
	}
	return false
}
//检查录像技能
model.prototype.checkVideo = function() {
	if(this.video && this.checkMaster())
		this.checkVideo()
}
//获取行动顺序
model.prototype.getActionList = function() {
	var self = this
	var info = {curRound : [],nextRound:[]}
	for(var i = 0;i < self.allHero.length;i++){
		if(!self.allHero[i].died){
			info["nextRound"].push(i)
			if(!self.allHero[i].isAction && !self.allHero[i].buffs["banish"]){
				info["curRound"].push(i)
			}
		}
	}
	info["curRound"].sort(function(a,b) {
		return self.allHero[a].getTotalAtt("speed") > self.allHero[b].getTotalAtt("speed") ? 1 : -1
	})
	for(var i = 0;i < info["curRound"].length;i++){
		info["curRound"][i] = self.allHero[info["curRound"][i]]["id"]
	}
	info["nextRound"].sort(function(a,b) {
		return self.allHero[a].getTotalAtt("speed") > self.allHero[b].getTotalAtt("speed") ? 1 : -1
	})
	for(var i = 0;i < info["nextRound"].length;i++){
		info["nextRound"][i] = self.allHero[info["nextRound"][i]]["id"]
	}
	return info
}
//战斗结束
model.prototype.fightOver = function(winFlag,roundEnd) {
	// console.log("战斗结束")
	this.isFight = false
	var info = {type : "fightOver",winFlag : winFlag,atkTeam:[],defTeam:[],round : this.round,roundEnd : roundEnd||false,atkDamage:0,defDamage:0}
	for(var i = 0;i < this.atkTeam.length;i++){
		if(!this.atkTeam[i].isNaN){
			info.atkDamage += this.atkTeam[i].totalDamage
			info.atkTeam.push(this.atkTeam[i].getSimpleInfo())
		}
	}
	for(var i = 0;i < this.defTeam.length;i++){
		if(!this.defTeam[i].isNaN){
			info.defDamage += this.defTeam[i].totalDamage
			info.defTeam.push(this.defTeam[i].getSimpleInfo())
		}
	}
	info.masterSkills = this.masterSkills
	fightRecord.push(info)
	// fightRecord.explain()
}
//蹦床函数
model.prototype.trampoline = function(f) {
	while (f && f instanceof Function) {
		f = f()
	}
	return f
}
model.prototype.arrayIndexOf = function(array,val) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == val) return i;
    }
    return -1;
}
model.prototype.arrayRemove = function(array,val) {
    var index = this.indexOf(array,val);
    if (index > -1) {
        array.splice(index, 1);
    }
}
module.exports = model