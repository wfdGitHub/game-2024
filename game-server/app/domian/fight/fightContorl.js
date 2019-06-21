var entityFun = require("../entity/entity.js")
var fightingFun = require("./fighting.js")
var fightContorl = function() {
	this.maxCount = 2000			//最长计算次数
	this.maxTime = 180000 			//最长战斗时间
	this.stepper = 50 				//间隔
}
//获取战斗结果 atkTeam 攻方阵容 defTeam  守方阵容
fightContorl.prototype.fighting = function(atkTeamInfo,defTeamInfo,seededNum,readList) {
	var curTime = 0			//当前时间
	var stepper = 50    	//单位时间
	var maxTime = 180000		//最大时间
	var atkTeam = []
	var defTeam = []
	for(var i in atkTeamInfo){
		atkTeam.push(entityFun(atkTeamInfo[i]))
	}
	for(var i in defTeamInfo){
		defTeam.push(entityFun(defTeamInfo[i]))
	}
	console.log(atkTeam,defTeam)
	var fighting = new fightingFun(atkTeam,defTeam,{stepper : this.stepper,maxTime : this.maxTime,seededNum : seededNum,readList : readList})
	for(var i in atkTeam){
		atkTeam[i].setArg(defTeam,fighting)
	}
	for(var i in defTeam){
		defTeam[i].setArg(atkTeam,fighting)
	}
	fighting.characterArr.forEach(function(character) {
		if(character.defaultSkill){
			character.defaultSkill.updateCD()
		}
	})
	var count = 0
	while(!fighting.isOver() && count++ < this.maxCount){
	 	fighting.update()
	}
	return fighting.getResult()
}
module.exports = function() {
	return new fightContorl()
}