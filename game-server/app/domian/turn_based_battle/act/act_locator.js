//定位工具
var model = function(fighting) {
	this.fighting = fighting
}
model.prototype.getBuffTargets = function(release,skill,buff) {
	if(buff.targetType == "target")
		return [skill.target]
	return this.getTargets(release,skill,buff.targetType)
}
model.prototype.getTargets = function(release,skill,targetType) {
	switch(targetType){
		case "self":
			//自身
			return [release]
		case "enemy_near":
			//最近敌方
			return this.getEnemyNormal(release)
		case "team_near":
			//最近友方
			return this.getFriendNormal(release)
		case "team_min":
			//血量最少友方
			return this.getFriendMinHP(release,skill)
		default:
			//默认距离最近敌方单体  
			return this.getEnemyNormal(release)
	}
}
//选择常规友方目标(距离最近)
model.prototype.getFriendNormal = function(release) {
	var aimList = []
	var team =  release.team
	var minDist = 99999
	for(var i in team){
		if(team[i] != release){
			var dist = this.callDist(release.pos,team[i].pos)
			if(dist < minDist){
				minDist = dist
				aimList = [team[i]]
			}
		}
	}
	return aimList
}
//选择常规友方目标(血量最少)
model.prototype.getFriendMinHP = function(release,skill) {
	var aimList = []
	var team =  release.team
	for(var i in team){
		var dist = this.callDist(release.pos,team[i].pos)
		if(dist < skill.resRange && (!aimList[0] || team[i].attInfo.hp < aimList[0].attInfo.hp)){
			aimList = [team[i]]
		}
	}
	return aimList
}
//选择常规敌方目标（按距离）
model.prototype.getEnemyNormal = function(release) {
	var aimList = []
	var team =  release.enemyTeam
	var minDist = 99999
	for(var i in team){
		var dist = this.callDist(release.pos,team[i].pos)
		if(dist < minDist){
			minDist = dist
			aimList = [team[i]]
		}
	}
	return aimList
}
//选择范围内敌方目标
model.prototype.getEnemyRange = function(release,pos,radius) {
	var aimList = []
	var team =  release.enemyTeam
	for(var i in team){
		var dist = this.callDist(pos,team[i].pos)
		if(dist <= radius)
			aimList.push(team[i])
	}
	return aimList
}
//选择范围内友方目标
model.prototype.getTeamRange = function(release,pos,radius) {
	var aimList = []
	var team =  release.team
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