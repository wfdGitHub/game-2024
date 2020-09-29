//战斗模块
var seeded = require("./seeded.js")
var locator = require("./locator.js")
var formula = require("./formula.js")
var skillManager = require("../skill/skillManager.js")
var character = require("../entity/character.js")
var fightRecord = require("./fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var fightRecord = require("../fight/fightRecord.js")
var fightBegin = ["angerLessBook"]		//战斗开始前
var roundBegin = ["banishBook"]		//回合开始前
var oddRoundEndBook = ["singleAtk","angerAddBook","angerLessBook","reductionBuff"] //奇数回合结束后释放
var evenRoundEndBook = ["backDamage","frontDamage"] //偶数回合结束后释放
var roundEndBook = ["singleHeal","seckill"]	//回合结束后释放
var maxRound = 20				//最大回合
var teamLength = 6				//阵容人数
var model = function(atkTeam,defTeam,atkBooks,defBooks,otps) {
    fightRecord.init()
    this.atkTeamInfo = {}
    this.defTeamInfo = {}
	this.seededNum = otps.seededNum || (new Date()).getTime()
    this.seeded = new seeded(this.seededNum)
    this.locator = new locator(this.seeded)
    this.formula = new formula(this.seeded)
    skillManager.init(this,this.locator,this.formula,this.seeded)
	this.isFight = true				//战斗中标识
	this.round = 0					//当前回合
	this.maxRound = otps.maxRound || maxRound		//最大回合
	this.atkTeam = atkTeam			//攻方阵容  长度为6的角色数组  位置无人则为NULL
	this.defTeam = defTeam			//守方阵容
	this.atkBooks = atkBooks		//攻方天书
	this.defBooks = defBooks		//守方天书
	this.allTeam = 					//双方阵容
	[{
		team : atkTeam,
		index : 0
	},{
		team : defTeam,
		index : 0
	}]
	this.teamIndex = 0				//当前行动阵容
	this.character = false 			//当前行动角色
	this.diedList = []				//死亡列表
	this.load(atkTeam,defTeam,otps)
}
//初始配置
model.prototype.load = function(atkTeam,defTeam,otps) {
	var info = {type : "fightBegin",atkTeam : [],defTeam : [],seededNum : this.seededNum,maxRound : this.maxRound}
	var id = 0
	var atkTeamAdds = Object.assign({},otps.atkTeamAdds)
	var defTeamAdds = Object.assign({},otps.defTeamAdds)
	for(var i = 0;i < teamLength;i++){
		if(!atkTeam[i]){
			atkTeam[i] = new character({})
			atkTeam[i].isNaN = true
		}
		atkTeam[i].init(this)
		if(atkTeam[i].resurgence_team)
			this.atkTeamInfo["resurgence_team"] = atkTeam[i].resurgence_team
		atkTeam[i].index = i
		atkTeam[i].team = atkTeam
		atkTeam[i].enemy = defTeam
		atkTeam[i].heroId = atkTeam[i].id
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
	}
	for(var i = 0;i < teamLength;i++){
		if(!defTeam[i]){
			defTeam[i] = new character({})
			defTeam[i].isNaN = true
		}
		defTeam[i].init(this)
		if(defTeam[i].resurgence_team)
			this.defTeamInfo["resurgence_team"] = defTeam[i].resurgence_team
		defTeam[i].index = i
		defTeam[i].team = defTeam
		defTeam[i].enemy = atkTeam
		defTeam[i].heroId = defTeam[i].id
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
	}
	//属性加成
	for(var i = 0;i < teamLength;i++){
		atkTeam[i].calAttAdd(atkTeamAdds)
		atkTeam[i].teamInfo = this.atkTeamInfo
		info.atkTeam.push(atkTeam[i].getSimpleInfo())
		defTeam[i].calAttAdd(defTeamAdds)
		defTeam[i].teamInfo = this.defTeamInfo
		info.defTeam.push(defTeam[i].getSimpleInfo())
	}
	fightRecord.push(info)
	//初始buff
	for(var i = 0;i < teamLength;i++){
		if(!atkTeam[i].died && atkTeam[i].first_buff){
			var burnBuffInfo = atkTeam[i].first_buff
			buffManager.createBuff(atkTeam[i],atkTeam[i],{buffId : burnBuffInfo.buffId,buffArg : burnBuffInfo.buffArg,duration : burnBuffInfo.duration})
		}
		if(!defTeam[i].died && defTeam[i].first_buff){
			var burnBuffInfo = defTeam[i].first_buff
			buffManager.createBuff(atkTeam[i],defTeam[i],{buffId : burnBuffInfo.buffId,buffArg : burnBuffInfo.buffArg,duration : burnBuffInfo.duration})
		}
		if(!atkTeam[i].died && atkTeam[i].before_buff_s){
			var burnBuffInfo = atkTeam[i].before_buff_s
			buffManager.createBuff(atkTeam[i],atkTeam[i],{buffId : burnBuffInfo.buffId,buffArg : burnBuffInfo.buffArg,duration : burnBuffInfo.duration})
		}
		if(!defTeam[i].died && defTeam[i].before_buff_s){
			var burnBuffInfo = defTeam[i].before_buff_s
			buffManager.createBuff(atkTeam[i],defTeam[i],{buffId : burnBuffInfo.buffId,buffArg : burnBuffInfo.buffArg,duration : burnBuffInfo.duration})
		}
	}
	//天书初始化
	for(var i in this.atkBooks){
		this.atkBooks[i].init(this.atkTeam,this.defTeam,this.locator,this.seeded)
	}
	for(var i in this.defBooks){
		this.defBooks[i].init(this.defTeam,this.atkTeam,this.locator,this.seeded)
	}
}
//战斗开始
model.prototype.fightBegin = function() {
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
		this.fightOver(false)
		return
	}
	this.round++
	// console.log("第 "+this.round+" 轮开始")
	this.allTeam[0].index = 0
	this.allTeam[1].index = 0
	this.teamIndex = 0
	fightRecord.push({type : "nextRound",round : this.round})
	for(var i = 0; i <= roundBegin.length;i++){
		if(this.atkBooks[roundBegin[i]])
			this.bookAction(this.atkBooks[roundBegin[i]])
		if(this.defBooks[roundBegin[i]])
			this.bookAction(this.defBooks[roundBegin[i]])
	}
	this.run()
}
//整体回合结束
model.prototype.endRound = function() {
	for(var i = 0;i < 6;i++){
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
	if(!this.checkOver())
		this.nextRound()
}
//轮到下一个角色行动
model.prototype.run = function() {
	if(!this.isFight){
		return
	}
	if(this.allTeam[0].index == this.allTeam[0].team.length && this.allTeam[1].index == this.allTeam[1].team.length){
		for(var i = 0;i < 6;i++){
			if(this.atkTeam[i])
				this.atkTeam[i].roundOver()
			if(this.defTeam[i])
				this.defTeam[i].roundOver()
		}
		this.endRound()
		return
	}
	while(this.allTeam[this.teamIndex].index < 6){
		this.character = this.allTeam[this.teamIndex].team[this.allTeam[this.teamIndex].index]
		this.allTeam[this.teamIndex].index++
		if(this.character.died || this.character.buffs["banish"]){
			this.character = false
		}else{
			break
		}
	}
	this.teamIndex = (this.teamIndex + 1) % 2
	if(!this.character){
		//查询不到角色，换阵营
		this.run()
	}else{
		this.before()
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
	var skill = false
	var needValue = 0
	if(!this.character.died && !this.character.dizzy){
		if(!this.character.silence && this.character.angerSkill && this.character.curAnger >= this.character.needAnger){
			skill = this.character.angerSkill
			needValue = this.character.needAnger
			if(this.character.allAnger){
				skill.angerAmp = (this.character.curAnger - 4) * 0.15
				needValue = this.character.curAnger
			}
			if(this.character.skill_free && this.seeded.random("不消耗怒气判断") > this.character.skill_free){
				needValue = 0
			}
			if(needValue){
				this.character.lessAnger(needValue,needValue>4?false:true)
			}
		}else{
			if(!this.character.disarm){
				skill = this.character.defaultSkill
				this.character.addAnger(2,true)
			}
		}
	}
	if(skill){
		skillManager.useSkill(skill)
		//行动后
		if(this.character.action_anger)
			this.character.addAnger(this.character.action_anger)
		if(this.character.action_buff){
			if(!this.character.died){
				var buffInfo = this.character.action_buff
				if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
					buffManager.createBuff(this.character,this.character,{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
				}
			}
		}
		if(this.character.action_buff_s){
			if(!this.character.died){
				var buffInfo = this.character.action_buff_s
				if(this.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
					buffManager.createBuff(this.character,this.character,{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
				}
			}
		}
		if(this.character.record_anger_rate && this.seeded.random("判断BUFF命中率") < this.character.record_anger_rate){
			needValue = Math.floor(needValue/2)
			if(needValue){
				this.character.addAnger(Math.min(needValue,4))
			}
		}
		if(this.character.action_anger_s && this.seeded.random("行动后怒气") < this.character.action_anger_s){
			this.character.addAnger(1)
		}
	}
	else{
		fightRecord.push({type : "freeze",id : this.character.id})
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
	for(var i = 0;i < this.diedList.length;i++){
		if(this.diedList[i]["died_buff_s"]){
			var buffTargets = this.locator.getBuffTargets(this.diedList[i],this.diedList[i].died_buff_s.buff_tg)
			for(var j = 0;j < buffTargets.length;j++){
				if(this.seeded.random("判断BUFF命中率") < this.diedList[i].died_buff_s.buffRate){
					buffManager.createBuff(this.diedList[i],buffTargets[j],{buffId : this.diedList[i].died_buff_s.buffId,buffArg : this.diedList[i].died_buff_s.buffArg,duration : this.diedList[i].died_buff_s.duration})
				}
			}
		}
		//复活判断
		if(this.diedList[i].teamInfo.resurgence_team){
			this.diedList[i].resurgence(this.diedList[i].teamInfo.resurgence_team)
			delete this.diedList[i].teamInfo.resurgence_team
		}
	}
	this.diedList = []
	//检测战斗是否结束
	if(!this.checkOver())
		this.run()
}
model.prototype.checkOver = function() {
	var flag = true
	for(var i = 0;i < this.atkTeam.length;i++){
		if(!this.atkTeam[i].died){
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
		if(!this.defTeam[i].died){
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
model.prototype.bookAction = function(book) {
	if(!this.isFight){
		return
	}
	book.action()
	for(var i = 0;i < this.diedList.length;i++){
		if(this.diedList[i]["died_buff_s"]){
			var buffTargets = this.locator.getBuffTargets(this.diedList[i],this.diedList[i].died_buff_s.buff_tg)
			for(var j = 0;j < buffTargets.length;j++){
				if(this.seeded.random("判断BUFF命中率") < this.diedList[i].died_buff_s.buffRate){
					buffManager.createBuff(this.diedList[i],buffTargets[j],{buffId : this.diedList[i].died_buff_s.buffId,buffArg : this.diedList[i].died_buff_s.buffArg,duration : this.diedList[i].died_buff_s.duration})
				}
			}
		}
		if(this.diedList[i].died_use_skill){
			skillManager.useSkill(this.diedList[i].angerSkill)
		}
		//复活判断
		if(this.diedList[i].teamInfo.resurgence_team){
			this.diedList[i].resurgence(this.diedList[i].teamInfo.resurgence_team)
			delete this.diedList[i].teamInfo.resurgence_team
		}
	}
	this.diedList = []
	//检测战斗是否结束
	if(this.checkOver())
		this.fightOver()
}
//战斗结束
model.prototype.fightOver = function(winFlag) {
	// console.log("战斗结束")
	this.isFight = false
	let info = {type : "fightOver",winFlag : winFlag,atkTeam:[],defTeam:[],round : this.round}
	for(var i = 0;i < teamLength;i++){
		if(!this.atkTeam[i].isNaN)
			info.atkTeam.push(this.atkTeam[i].getSimpleInfo())
		else 
			info.atkTeam.push(null)
		if(!this.defTeam[i].isNaN)
			info.defTeam.push(this.defTeam[i].getSimpleInfo())
		else
			info.defTeam.push(null)
	}
	fightRecord.push(info)
	// fightRecord.explain()
}
module.exports = model