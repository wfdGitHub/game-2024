//战斗模块
var seeded = require("./seeded.js")
var locator = require("./locator.js")
var formula = require("./formula.js")
var skillManager = require("../skill/skillManager.js")
var character = require("../entity/character.js")
var maxRound = 20				//最大回合
var model = function(atkTeam,defTeam,otps) {
	this.load(atkTeam,defTeam,otps)
	this.seededNum = otps.seededNum || (new Date()).getTime()
    this.seeded = new seeded(this.seededNum)
    this.locator = new locator(this.seeded)
    this.formula = new formula(this.seeded)
    skillManager.init(this.locator,this.formula)
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
	this.allCharacter = []
	for(var i = 0;i < atkTeam.length;i++){
		if(!atkTeam[i])
			atkTeam[i] = new character()
		this.allCharacter.push(atkTeam[i])
		atkTeam[i].camp = "atk"
		atkTeam[i].index = i
		atkTeam[i].team = atkTeam
		atkTeam[i].enemy = defTeam
	}
	for(var i = 0;i < defTeam.length;i++){
		if(!defTeam[i])
			defTeam[i] = new character()
		this.allCharacter.push(defTeam[i])
		defTeam[i].camp = "def"
		defTeam[i].index = i
		defTeam[i].team = defTeam
		defTeam[i].enemy = atkTeam
	}
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

	this.action()
}
//开始行动释放技能
model.prototype.action = function() {
	var skill = false
	if(this.character.angerSkill && this.character.curAnger == this.character.maxAnger){
		skill = this.character.angerSkill
		this.character.lessAnger(this.character.maxAnger)
	}else{
		skill = this.character.defaultSkill
		this.character.addAnger(2)
	}
	if(skill){
		skillManager.useSkill(skill)
	}
	this.after()
}
//使用技能
model.prototype.useSkill = function(skill) {
	//获取目标
	var targets = this.locator.getTargets(this.character,skill)
	if(!targets){
		console.log(111)
	}
	for(var i = 0;i < targets.length;i++){
		let target = targets[i]
		//判断命中率
		let info = this.formula.calDamage(this.character, target, skill)
		var str = this.character.camp+this.character.index+"使用"+skill.name+"攻击"+target.camp+target.index
		if(!info.miss){
			info = target.onHit(this.character,info,skill)
			str += "  造成"+ info.value+"点伤害"
			if(info.crit){
				str +="(暴击)"
			}
			str += "   剩余"+target.hp+"/"+target.maxHP
			if(info.kill){
				str += "  击杀目标!"
			}
		}else{
			str += "  被闪避"
		}
		console.log(str)
	}
}
//行动后结算
model.prototype.after = function() {
	//检测战斗是否结束
	this.character = false
	var flag = true
	for(var i = 0;i < this.atkTeam.length;i++){
		if(!this.atkTeam[i].died){
			flag = false
			break
		}
	}
	if(flag){
		this.fightOver()
		return
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
		return
	}
	this.run()
}
//战斗结束
model.prototype.fightOver = function() {
	console.log("战斗结束")
	this.isFight = false
}
module.exports = model