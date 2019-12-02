//战斗模块
var seeded = require("./seeded.js")
var locator = require("./locator.js")
var formula = require("./formula.js")
var skillManager = require("../skill/skillManager.js")
var character = require("../entity/character.js")
var fightRecord = require("./fightRecord.js")
var maxRound = 20				//最大回合
var teamLength = 6				//阵容人数
var model = function(atkTeam,defTeam,otps) {
    fightRecord.init()
	this.load(atkTeam,defTeam,otps)
	this.seededNum = otps.seededNum || (new Date()).getTime()
    this.seeded = new seeded(this.seededNum)
    this.locator = new locator(this.seeded)
    this.formula = new formula(this.seeded)
    skillManager.init(this.locator,this.formula,this.seeded)
	this.isFight = true				//战斗中标识
	this.round = 0					//当前回合
	this.maxRound = maxRound		//最大回合
	this.atkTeam = atkTeam			//攻方阵容  长度为6的角色数组  位置无人则为NULL
	this.defTeam = defTeam			//守方阵容
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
}
//初始配置
model.prototype.load = function(atkTeam,defTeam,otps) {
	var info = {type : "fightBegin",atkTeam : [],defTeam : []}
	var id = 0
	for(var i = 0;i < teamLength;i++){
		if(!atkTeam[i])
			atkTeam[i] = new character({})
		atkTeam[i].camp = "atk"
		atkTeam[i].index = i
		atkTeam[i].team = atkTeam
		atkTeam[i].enemy = defTeam
		atkTeam[i].id = id++
		info.atkTeam.push(atkTeam[i].getSimpleInfo())
	}
	for(var i = 0;i < teamLength;i++){
		if(!defTeam[i])
			defTeam[i] = new character({})
		defTeam[i].camp = "def"
		defTeam[i].index = i
		defTeam[i].team = defTeam
		defTeam[i].enemy = atkTeam
		defTeam[i].id = id++
		info.defTeam.push(defTeam[i].getSimpleInfo())
	}
	fightRecord.push(info)
}
//开始新轮次
model.prototype.nextRound = function() {
	if(this.round >= this.maxRound){
		//达到最大轮次，战斗结束
		this.fightOver()
		return
	}
	this.round++
	console.log("第 "+this.round+" 轮开始")
	this.allTeam[0].index = 0
	this.allTeam[1].index = 0
	this.teamIndex = 0
	fightRecord.push({type : "nextRound",round : this.round})
	this.run()
}
//轮到下一个角色行动
model.prototype.run = function() {
	if(!this.isFight){
		console.error("战斗已结束")
		return
	}
	if(this.allTeam[0].index == this.allTeam[0].team.length && this.allTeam[1].index == this.allTeam[1].team.length){
		this.nextRound()
		return
	}
	while(this.allTeam[this.teamIndex].index < 6){
		this.character = this.allTeam[this.teamIndex].team[this.allTeam[this.teamIndex].index]
		this.allTeam[this.teamIndex].index++
		if(this.character.died){
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
	this.action()
}
//开始行动释放技能
model.prototype.action = function() {
	var skill = false
	if(!this.character.dizzy){
		if(this.character.angerSkill && this.character.curAnger == this.character.maxAnger){
			if(!this.character.silence){
				skill = this.character.angerSkill
				this.character.lessAnger(this.character.maxAnger)
			}
		}else{
			if(!this.character.disarm){
				skill = this.character.defaultSkill
				this.character.addAnger(2)
			}
		}
		if(skill)
			skillManager.useSkill(skill)
	}
	this.after()
}
//行动后结算
model.prototype.after = function() {
	this.character.after()
	//检测战斗是否结束
	this.character = false
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
		this.fightOver()
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
		this.fightOver()
		return true
	}
	return false
}
//战斗结束
model.prototype.fightOver = function() {
	console.log("战斗结束")
	this.isFight = false
	fightRecord.push({type : "fightOver"})
	fightRecord.explain()
}
module.exports = model