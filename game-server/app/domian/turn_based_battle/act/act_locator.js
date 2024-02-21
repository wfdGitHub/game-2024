//定位工具
var model = function(fighting) {
	this.fighting = fighting
}
model.prototype.getTargets = function(character,targetType,radius) {
	switch(targetType){
		case "team_near":
			//最近友方
			return this.getFriendNormal(character)
		case "todo"
			//血量最少友方
			return
		case "enemy_range"
			//范围内敌方目标
		default:
			//默认距离最近敌方单体  
			return this.getEnemyNormal(character)
	}
}
//选择常规友方目标(距离最近)
model.prototype.getFriendNormal = function(character) {
	var aimList = []
	var team =  character.team
	var minDist = 99999
	for(var i in team){
		if(team[i] != character){
			var dist = this.callDist(character,team[i])
			if(dist < minDist){
				minDist = dist
				aimList = [team[i]]
			}
		}
	}
	return aimList
}
//选择常规敌方目标（按距离）
model.prototype.getEnemyNormal = function(character) {
	var aimList = []
	var team =  character.enemyTeam
	var minDist = 99999
	for(var i in team){
		var dist = this.callDist(character,team[i])
		if(dist < minDist){
			minDist = dist
			aimList = [team[i]]
		}
	}
	return aimList
}
//选择范围内敌方目标
model.prototype.getEnemyRange = function(character,radius) {
	var aimList = []
	var team =  character.enemyTeam
	for(var i in team){
		var dist = this.callDist(character,team[i])
		if(dist <= radius)
			aimList = aimList.push(team[i])
	}
	return aimList
}
//选择范围内友方目标
model.prototype.getEnemyRange = function(character,radius) {
	var aimList = []
	var team =  character.team
	for(var i in team){
		var dist = this.callDist(character,team[i])
		if(dist <= radius)
			aimList = aimList.push(team[i])
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
	var dx = release.pos.x - target.pos.x
	var dy = release.pos.y - target.pos.y
	return Math.pow(dx*dx+dy*dy,0.5)
}
module.exports = model