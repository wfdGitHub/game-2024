//战斗模块
var seeded = require("./seeded.js")
var locator = require("./locator.js")
var formula = require("./formula.js")
var skillManager = require("../skill/skillManager.js")
var character = require("../entity/character.js")
var fightRecord = require("./fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var fightBegin = ["angerLessBook"]		//战斗开始前
var roundBegin = ["banishBook"]		//回合开始前
var oddRoundEndBook = ["singleAtk","angerAddBook","angerLessBook","reductionBuff"] //奇数回合结束后释放
var evenRoundEndBook = ["backDamage","frontDamage"] //偶数回合结束后释放
var roundEndBook = ["singleHeal","seckill"]	//回合结束后释放
var maxRound = 20				//最大回合
var teamLength = 6				//阵容人数
var model = function(atkInfo,defInfo,otps) {
    fightRecord.init()
    this.atkTeamInfo = {}
    this.defTeamInfo = {}
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
	this.atkBooks = atkInfo.books		//攻方天书
	this.defBooks = defInfo.books		//守方天书
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
	if(otps.masterSkills && Array.isArray(otps.masterSkills))
		this.masterSkillsRecord = JSON.parse(JSON.stringify(otps.masterSkills))   //录像技能释放列表
	else
		this.masterSkillsRecord = []
	this.load(atkInfo.team,defInfo.team,otps)
    skillManager.init(this,this.locator,this.formula,this.seeded)
    this.skillManager = skillManager
}
//初始配置
model.prototype.load = function(atkTeam,defTeam,otps) {
	var id = 0
	var atkTeamAdds = Object.assign({},otps.atkTeamAdds)
	var defTeamAdds = Object.assign({},otps.defTeamAdds)
	this.atkTeamInfo["realms"] = {"1":0,"2":0,"3":0,"4":0,"5":0}
	this.defTeamInfo["realms"] = {"1":0,"2":0,"3":0,"4":0,"5":0}
	this.atkTeamInfo["realms_ation"] = {"1":0,"2":0,"3":0,"4":0,"5":0}
	this.defTeamInfo["realms_ation"] = {"1":0,"2":0,"3":0,"4":0,"5":0}
	for(var i = 0;i < teamLength;i++){
		if(!atkTeam[i]){
			atkTeam[i] = new character({})
			atkTeam[i].isNaN = true
		}else{
			if(!this.atkTeamInfo["realms"][atkTeam[i].realm])
				this.atkTeamInfo["realms"][[atkTeam[i].realm]] = 0
			this.atkTeamInfo["realms"][atkTeam[i].realm]++
		}
		atkTeam[i].init(this)
		atkTeam[i].belong = "atk"
		if(atkTeam[i].resurgence_team){
			this.atkTeamInfo["resurgence_team_character"] = atkTeam[i]
			this.atkTeamInfo["resurgence_team"] = atkTeam[i].resurgence_team
			if(atkTeam[i]["resurgence_realmRate"]){
				this.atkTeamInfo["resurgence_realmRate"] = atkTeam[i]["resurgence_realmRate"]
				this.atkTeamInfo["resurgence_realmId"] = atkTeam[i]["realm"]
			}
		}
		atkTeam[i].index = i
		atkTeam[i].team = atkTeam
		atkTeam[i].enemy = defTeam
		atkTeam[i].heroId = atkTeam[i].heroId
		atkTeam[i].id = id++
		if(atkTeam[i].team_adds){
			for(var j in atkTeam[i].team_adds){
				if(!atkTeamAdds[j]){
					atkTeamAdds[j] = atkTeam[i].team_adds[j]
				}else{
					atkTeamAdds[j] += atkTeam[i].team_adds[j]
				}
			}
		}
		if(!atkTeam[i].isNaN)
			this.allHero.push(atkTeam[i])
	}
	for(var i = 0;i < teamLength;i++){
		if(!defTeam[i]){
			defTeam[i] = new character({})
			defTeam[i].isNaN = true
		}else{
			if(!this.defTeamInfo["realms"][defTeam[i].realm])
				this.defTeamInfo["realms"][[defTeam[i].realm]] = 0
			this.defTeamInfo["realms"][defTeam[i].realm]++
		}
		defTeam[i].init(this)
		defTeam[i].belong = "def"
		if(defTeam[i].resurgence_team){
			this.defTeamInfo["resurgence_team_character"] = defTeam[i]
			this.defTeamInfo["resurgence_team"] = defTeam[i].resurgence_team
			if(defTeam[i]["resurgence_realmRate"]){
				this.defTeamInfo["resurgence_realmRate"] = defTeam[i]["resurgence_realmRate"]
				this.defTeamInfo["resurgence_realmId"] = defTeam[i]["realm"]
			}
		}
		defTeam[i].index = i
		defTeam[i].team = defTeam
		defTeam[i].enemy = atkTeam
		defTeam[i].heroId = defTeam[i].heroId
		defTeam[i].id = id++
		if(defTeam[i].team_adds){
			for(var j in defTeam[i].team_adds){
				if(!defTeamAdds[j]){
					defTeamAdds[j] = defTeam[i].team_adds[j]
				}else{
					defTeamAdds[j] += defTeam[i].team_adds[j]
				}
			}
		}
		if(!defTeam[i].isNaN)
			this.allHero.push(defTeam[i])
	}
	this.atkTeamInfo["realms_survival"] = this.atkTeamInfo["realms"]
	this.defTeamInfo["realms_survival"] = this.defTeamInfo["realms"]
	//属性加成
	for(var i = 0;i < teamLength;i++){
		atkTeam[i].calAttAdd(atkTeamAdds)
		atkTeam[i].teamInfo = this.atkTeamInfo
		defTeam[i].calAttAdd(defTeamAdds)
		defTeam[i].teamInfo = this.defTeamInfo
	}
	this.atkMaster.init(this,this.atkTeam,this.defTeam,this.locator,this.seeded,this.defMaster)
	this.defMaster.init(this,this.defTeam,this.atkTeam,this.locator,this.seeded,this.atkMaster)
	//天书初始化
	for(var i in this.atkBooks){
		this.atkBooks[i].init(this.atkTeam,this.defTeam,this.locator,this.seeded,this.atkMaster)
	}
	for(var i in this.defBooks){
		this.defBooks[i].init(this.defTeam,this.atkTeam,this.locator,this.seeded,this.defMaster)
	}
}
//战斗开始
model.prototype.fightBegin = function() {
	var info = {type : "fightBegin",atkTeam : [],defTeam : [],seededNum : this.seededNum,maxRound : this.maxRound}
	for(var i = 0;i < teamLength;i++){
		this.atkTeam[i].siteInit()
		this.defTeam[i].siteInit()
	}
	for(var i = 0;i < teamLength;i++){
		this.atkTeam[i].begin()
		this.defTeam[i].begin()
		info.atkTeam.push(this.atkTeam[i].getSimpleInfo())
		info.defTeam.push(this.defTeam[i].getSimpleInfo())
	}
	fightRecord.push(info)
	for(var i = 0;i < teamLength;i++){
		this.atkTeam[i].beginAction()
		this.defTeam[i].beginAction()
	}
	//初始自身buff
	for(var i = 0;i < teamLength;i++){
		if(!this.atkTeam[i].died){
			if(this.atkTeam[i].first_buff_list.length){
				for(var j = 0;j < this.atkTeam[i].first_buff_list.length;j++){
					if(this.atkTeam[i].first_buff_list[j]["buff_tg"]){
						var targets = this.locator.getBuffTargets(this.atkTeam[i],this.atkTeam[i].first_buff_list[j]["buff_tg"])
						for(var k = 0;k < targets.length;k++)
							buffManager.createBuff(this.atkTeam[i],targets[k],this.atkTeam[i].first_buff_list[j])
					}else{
						buffManager.createBuff(this.atkTeam[i],this.atkTeam[i],this.atkTeam[i].first_buff_list[j])
					}
				}
			}
			if(this.atkTeam[i].first_realm_buff){
				for(var j = 0;j < this.atkTeam[i].team.length;j++){
					if(this.atkTeam[i].realm == this.atkTeam[i].team[j].realm)
						buffManager.createBuff(this.atkTeam[i],this.atkTeam[i].team[j],this.atkTeam[i].first_realm_buff)
				}
			}
			if(this.atkTeam[i].begin_realm_crit){
				fightRecord.push({type:"show_tag",id:this.atkTeam[i].id,tag:"begin_realm_crit"})
				for(var j = 0;j < this.atkTeam[i].team.length;j++){
					if(!this.atkTeam[i].team[j].died)
						buffManager.createBuff(this.atkTeam[i],this.atkTeam[i].team[j],{buffId : "crit",buffArg : this.atkTeam[i].begin_realm_crit * this.atkTeamInfo["realms"][this.atkTeam[i].realm],duration : 1})
				}
			}
			if(this.atkTeam[i].ignoreInvincible)
				fightRecord.push({type:"show_tag",id:this.atkTeam[i].id,tag:"ignoreInvincible"})
			if(this.atkTeam[i].ignore_shild)
				fightRecord.push({type:"show_tag",id:this.atkTeam[i].id,tag:"ignore_shild"})
			if(this.atkTeam[i].half_hp_red)
				fightRecord.push({type:"show_tag",id:this.atkTeam[i].id,tag:"half_hp_red"})
		}
		if(!this.defTeam[i].died){
			if(this.defTeam[i].first_buff_list.length){
				for(var j = 0;j < this.defTeam[i].first_buff_list.length;j++){
					buffManager.createBuff(this.defTeam[i],this.defTeam[i],this.defTeam[i].first_buff_list[j])
				}
			}
			if(this.defTeam[i].begin_realm_crit){
				fightRecord.push({type:"show_tag",id:this.defTeam[i].id,tag:"begin_realm_crit"})
				for(var j = 0;j < this.defTeam[i].team.length;j++){
					if(!this.defTeam[i].team[j].died)
						buffManager.createBuff(this.defTeam[i],this.defTeam[i].team[j],{buffId : "crit",buffArg : this.defTeam[i].begin_realm_crit * this.defTeamInfo["realms"][this.defTeam[i].realm],duration : 1})
				}
			}
			if(this.defTeam[i].ignoreInvincible)
				fightRecord.push({type:"show_tag",id:this.defTeam[i].id,tag:"ignoreInvincible"})
			if(this.defTeam[i].ignore_shild)
				fightRecord.push({type:"show_tag",id:this.defTeam[i].id,tag:"ignore_shild"})
			if(this.defTeam[i].half_hp_red)
				fightRecord.push({type:"show_tag",id:this.defTeam[i].id,tag:"half_hp_red"})
		}
	}
	for(var i = 0; i <= fightBegin.length;i++){
		if(this.atkBooks[fightBegin[i]])
			this.atkBooks[fightBegin[i]].before()
		if(this.defBooks[fightBegin[i]])
			this.defBooks[fightBegin[i]].before()
	}
	this.nextRound()
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
	// console.log("第 "+this.round+" 轮开始")
	for(var i = 0;i < this.allHero.length;i++){
		this.allHero[i].isAction = false
		this.allHero[i].roundBegin()
	}
	// this.teamIndex = 0
	for(var i = 0; i <= roundBegin.length;i++){
		if(this.atkBooks[roundBegin[i]])
			this.bookAction(this.atkBooks[roundBegin[i]])
		if(this.defBooks[roundBegin[i]])
			this.bookAction(this.defBooks[roundBegin[i]])
	}
	this.runCheck()
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
	if(this.round % 2 == 1){
		for(var i = 0; i <= oddRoundEndBook.length;i++){
			if(this.atkBooks[oddRoundEndBook[i]])
				this.bookAction(this.atkBooks[oddRoundEndBook[i]])
			if(this.defBooks[oddRoundEndBook[i]])
				this.bookAction(this.defBooks[oddRoundEndBook[i]])
		}
	}else{
		for(var i = 0; i <= evenRoundEndBook.length;i++){
			if(this.atkBooks[evenRoundEndBook[i]])
				this.bookAction(this.atkBooks[evenRoundEndBook[i]])
			if(this.defBooks[evenRoundEndBook[i]])
				this.bookAction(this.defBooks[evenRoundEndBook[i]])
		}
	}
	for(var i = 0; i <= roundEndBook.length;i++){
		if(this.atkBooks[roundEndBook[i]])
			this.bookAction(this.atkBooks[roundEndBook[i]])
		if(this.defBooks[roundEndBook[i]])
			this.bookAction(this.defBooks[roundEndBook[i]])
	}
	this.atkTeamInfo["realms_ation"] = {"1":0,"2":0,"3":0,"4":0}
	this.defTeamInfo["realms_ation"] = {"1":0,"2":0,"3":0,"4":0}
	this.atkMaster.endRound()
	this.defMaster.endRound()
	if(!this.checkOver())
		this.nextRound()
}
//运行检测
model.prototype.runCheck = function() {
	if(this.manual){
		this.runFlag = false
		return
	}else if(this.checkMaster()){
		this.runCheck()
	}else{
		this.run()
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
		this.before()
	}else{
		this.endRound()
		return
	}
}
//回合前结算
model.prototype.before = function() {
	fightRecord.push({type : "characterAction",id : this.character.id})
	this.character.before()
	this.action()
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
	this.after()
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
				this.runCheck()
			}else{
				fightRecord.push({type : "extraAtion",id : next_character.id})
				this.character = next_character
				this.character.extra_count++
				this.before()
			}
		}else{
			this.runCheck()
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
//天书行动
model.prototype.bookAction = function(book) {
	if(!this.isFight){
		return
	}
	book.action()
	this.diedListCheck()
	//检测战斗是否结束
	this.checkOver()
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
	            this.diedList[i].resurgence(0.3,this.diedList[i])
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
	for(var i = 0;i < teamLength;i++){
		if(!this.atkTeam[i].isNaN){
			info.atkDamage += this.atkTeam[i].totalDamage
			info.atkTeam.push(this.atkTeam[i].getSimpleInfo())
		}
		else {
			info.atkTeam.push(null)
		}
		if(!this.defTeam[i].isNaN){
			info.defDamage += this.defTeam[i].totalDamage
			info.defTeam.push(this.defTeam[i].getSimpleInfo())
		}
		else{
			info.defTeam.push(null)
		}
	}
	for(var i in this.atkBooks){
		info.atkDamage += this.atkBooks[i].totalDamage
	}
	for(var i in this.defBooks){
		info.defDamage += this.defBooks[i].totalDamage
	}
	info.masterSkills = this.masterSkills
	fightRecord.push(info)
	// fightRecord.explain()
}
module.exports = model