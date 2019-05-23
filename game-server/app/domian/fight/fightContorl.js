var bearcat = require("bearcat")
var fightContorl = function() {
	this.maxTime = 30000 			//最长战斗时间

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
	for(var i in atkTeam){
		atkTeam[i].setEnemyTeam(defTeam)
	}
	for(var i in defTeam){
		defTeam[i].setEnemyTeam(atkTeam)
	}
	var fighting = bearcat.getBean("fighting",atkTeam,defTeam)
	for(curTime = 0;curTime < maxTime;curTime += stepper){
	 	fighting.update(stepper)
	 	if(fighting.isOver()){
	 		break
	 	}
	}
	console.log("result : ",curTime,fighting.getResult())
}
module.exports = {
	id : "fightContorl",
	func : fightContorl,
	props : [{
		name : "formula",
		ref : "formula"
	}]
}