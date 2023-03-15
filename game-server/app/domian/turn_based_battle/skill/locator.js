const TEAMLENGTH = 5 				//队伍人数
const FRONT_NUM = 2 				//前排人数
const MY_MAP = [[0,0.5],[0,1.5],[2,0.1],[2,1],[2,1.9]]
const ENEMY_MAP = [[0,0.5],[0,1.5],[-2,0.1],[-2,1],[-2,1.9]]
var model = function(fighting) {
	this.fighting = fighting
}
model.prototype.getTargets = function(character,targetType) {
	switch(targetType){
		case "enemy_normal":
			//默认敌人前排单体
			return this.getEnemyNormal(character)
		default :
			console.error("targetType error ",targetType)
			return this.getEnemyNormal(character)
	}
}
//选择常规敌方目标
model.prototype.getEnemyNormal = function(character) {
	var aimList = []
	for(var index = 0;index < character.fighting[character.rival].team.length;index++){
		if(character.fighting[character.rival].team[index].checkAim()){
			aimList.push({character : character.fighting[character.rival].team[index],dist : this.callDist(MY_MAP[character.index],ENEMY_MAP[index])})
		}
	}
	aimList.sort((a,b) => {
		return a.dist - b.dist
	})
	return [aimList[0]]
}
model.prototype.callDist = function(pos1,pos2) {
	return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1])
}
module.exports = model