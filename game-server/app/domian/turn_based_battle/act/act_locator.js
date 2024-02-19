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
//计算位移
model.prototype.callMove = function(release,target,moveSpeed,dt) {
	var dirX = target.pos.x > release.pos.x ? 1 : -1
	var dirY = target.pos.y > release.pos.y ? 1 : -1
	release.pos.x += Math.round(dirX * Math.min(moveSpeed * dt * 0.001,Math.abs(target.pos.x - release.pos.x)))
	release.pos.y += Math.round(dirY * Math.min(moveSpeed * dt * 0.001,Math.abs(target.pos.y - release.pos.y)))
}
//计算距离
model.prototype.callDist = function(release,target) {
	return Math.max(Math.abs(release.pos.x-target.pos.x),Math.abs(release.pos.y-target.pos.y))
}
module.exports = model