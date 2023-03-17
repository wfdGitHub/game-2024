const TEAMLENGTH = 5 				//队伍人数
const FRONT_NUM = 2 				//前排人数
const MY_MAP = [[0,0.5],[0,1.5],[1,0.1],[1,1],[1,1.9]]
const ENEMY_MAP = [[0,0.5],[0,1.5],[-1,0.1],[-1,1],[-1,1.9]]
var model = function(fighting) {
	this.fighting = fighting
}
//判断存在可攻击目标
model.prototype.existsTarget = function(character) {
	var enemyTeam =  character.fighting["fightInfo"][character.rival].team
	for(var i = 0;i < enemyTeam.length;i++){
		if(enemyTeam[i].checkAim()){
			return  true
		}
	}
	return false
}
model.prototype.getTargets = function(character,targetType) {
	switch(targetType){
		case "enemy_normal":
			//默认单体
			return this.getEnemyNormal(character)
		default :
			return this.getEnemyNormal(character)
	}
}
//选择常规敌方目标（按距离）
model.prototype.getEnemyNormal = function(character) {
	var aimList = []
	var enemyTeam =  character.fighting["fightInfo"][character.rival].team
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			aimList.push({character : enemyTeam[index],dist : this.callDist(MY_MAP[character.index],ENEMY_MAP[index])})
		}
	}
	aimList.sort((a,b) => {
		return a.dist - b.dist
	})
	if(aimList.length)
		return [aimList[0].character]
	else
		return []
}
model.prototype.callDist = function(pos1,pos2) {
	return Math.abs(pos1[0] - pos2[0]) * 10 + Math.abs(pos1[1] - pos2[1])
}
module.exports = model