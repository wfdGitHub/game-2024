var seeded = require("./seeded.js")
var fighting = function(atkTeam,defTeam,otps) {
	this.curTime = 0
	this.atkTeam = atkTeam
	this.defTeam = defTeam
	this.stepper = otps.stepper
	this.maxTime = otps.maxTime
	this.characterArr = this.atkTeam.concat(this.defTeam)
	this.over = false
	this.result = "none"	//deuce  win   lose
	this.skillList = []		//使用技能列表
	this.seeded = new seeded(otps.seeded || (new Date()).getTime())
}
//时间推进
fighting.prototype.update = function() {
	var self = this
    //检测使用技能
    if(this.skillList.length){
    	var skill = this.skillList.shift()
    	if(!skill.character.died){
    		skill.useSkill()
    	}
    }else{
		this.curTime += this.stepper
	    //更新
	    this.characterArr.forEach(function(character,index) {
	        if(!character.died){
	        	character.update(self.stepper)
	        }
	    })
    }
	this.checkOver()
}
//结束标识
fighting.prototype.checkOver = function() {
	if(this.curTime >= this.maxTime){
		this.over = true
		this.result = "deuce"
		return
	}
	var flag = true
	for(var i in this.atkTeam){
		if(!this.atkTeam[i].died){
			flag = false
			break
		}
	}
	if(flag){
		this.over = true
		this.result = "lose"
		return
	}
	flag = true
	for(var i in this.defTeam){
		if(!this.defTeam[i].died){
			flag = false
			break
		}
	}
	if(flag){
		this.over = true
		this.result = "win"
		return
	}
}
fighting.prototype.isOver = function() {
	return this.over
}
//获取战斗结果
fighting.prototype.getResult = function() {
	return this.result
}
module.exports = {
	"id" : "fighting",
	func : fighting,
	scope : "prototype",
	args : [{
		name : "atkTeam",
		type : "Object"
	},{
		name : "defTeam",
		type : "Object"
	},{
		name : "otps",
		type : "Object"
	}],
	props : [{
		name : "formula",
		ref : "formula"
	}]
}