//定位工具
var model = function(fighting) {
	this.fighting = fighting
}
model.prototype.getTargets = function(character,targetType) {
	switch(targetType){
		default:
			//默认单体
			return this.getEnemyNormal(character)
	}
}
//选择常规敌方目标（按距离）
model.prototype.getEnemyNormal = function(character) {
	var aimList = []
	var enemyTeam =  character.enemyTeam
	var target = false
	var minDist = 99999
	for(var i in enemyTeam){
		var dist = Math.abs(enemyTeam[i].pos.x - character.pos.x) + Math.abs(enemyTeam[i].pos.y - character.pos.y)
		if(dist < minDist){
			minDist = dist
			aimList = [enemyTeam[i]]
		}
	}
	return aimList
}

module.exports = model