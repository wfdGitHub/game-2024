//定位工具
var model = function(fighting) {
	this.fighting = fighting
}
model.prototype.getTargets = function(character,targetType,radius) {
	switch(targetType){
		case "self":
			//自身
			return [character]
		case "enemy_near":
			//最近敌方
			return this.getEnemyNormal(character)
		case "team_near":
			//最近友方
			return this.getFriendNormal(character)
		case "todo":
			//血量最少友方
			return
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
			var dist = this.callDist(character.pos,team[i].pos)
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
		var dist = this.callDist(character.pos,team[i].pos)
		if(dist < minDist){
			minDist = dist
			aimList = [team[i]]
		}
	}
	return aimList
}
//选择范围内敌方目标
model.prototype.getEnemyRange = function(character,pos,radius) {
	var aimList = []
	var team =  character.enemyTeam
	for(var i in team){
		var dist = this.callDist(pos,team[i].pos)
		if(dist <= radius)
			aimList.push(team[i])
	}
	return aimList
}
//选择范围内友方目标
model.prototype.getTeamRange = function(character,pos,radius) {
	var aimList = []
	var team =  character.team
	for(var i in team){
		var dist = this.callDist(pos,team[i].pos)
		if(dist <= radius)
			aimList.push(team[i])
	}
	return aimList
}
//计算位移
model.prototype.callMove = function(pos1,pos2,speed,dt) {
	var dirX = pos2.x > pos1.x ? 1 : -1
	var dirY = pos2.y > pos1.y ? 1 : -1
	pos1.x += Math.round(dirX * Math.min(speed * dt * 0.001,Math.abs(pos2.x - pos1.x)))
	pos1.y += Math.round(dirY * Math.min(speed * dt * 0.001,Math.abs(pos2.y - pos1.y)))
}
//计算距离
model.prototype.callDist = function(pos1,pos2) {
	var dx = pos1.x - pos2.x
	var dy = pos1.y - pos2.y
	return Math.pow(dx*dx+dy*dy,0.5)
}
module.exports = model