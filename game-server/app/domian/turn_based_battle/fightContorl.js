//战斗控制器
const fightingEntity = require("./fighting.js")
var model = function(){}
//开始战斗
model.prototype.beginFight = function(atkTeam,defTeam,otps) {
	var fighting = new fightingEntity(atkTeam,defTeam,otps)
	fighting.fightBegin()
	this.fighting = fighting
	return fighting.getNormalWin()
}
//手动战斗
//录像战斗
//获取校验数据
model.prototype.getVerifyInfo = function() {
	
}
module.exports = new model()