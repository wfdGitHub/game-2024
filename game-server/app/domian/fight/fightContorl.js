var bearcat = require("bearcat")
var fightContorl = function() {
	this.maxCount = 2000	//最长计算次数
}
//获取战斗结果 atkTeam 攻方阵容 defTeam  守方阵容
fightContorl.prototype.fighting = function(atkTeamInfo,defTeamInfo) {
	var curTime = 0			//当前时间
	var stepper = 50    	//单位时间
	var maxTime = 180000		//最大时间
	var atkTeam = []
	var defTeam = []
	for(var i in atkTeamInfo){
		atkTeam.push(bearcat.getBean("hero",atkTeamInfo[i]))
	}
	for(var i in defTeamInfo){
		defTeam.push(bearcat.getBean("mob",defTeamInfo[i]))
	}
	var fighting = bearcat.getBean("fighting",atkTeam,defTeam,{maxTime : maxTime,stepper : stepper})
	for(var i in atkTeam){
		atkTeam[i].setArg(defTeam,fighting)
	}
	for(var i in defTeam){
		defTeam[i].setArg(atkTeam,fighting)
	}
	var count = 0
	while(!fighting.isOver() && count++ < this.maxCount){
	 	fighting.update()
	}
	console.log("result : ",fighting.getResult())
}
module.exports = {
	id : "fightContorl",
	func : fightContorl,
	props : [{
		name : "formula",
		ref : "formula"
	}]
}