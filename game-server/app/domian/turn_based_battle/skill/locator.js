const TEAMLENGTH = 5 				//队伍人数
const FRONT_NUM = 2 				//前排人数
const MY_MAP = [[0,0.5],[0,1.5],[1,0.1],[1,1],[1,1.9]]
const ENEMY_MAP = [[0,0.5],[0,1.5],[-1,0.1],[-1,1],[-1,1.9]]
const FRONT_LIST = [0,1]
const BACK_LIST = [2,3,4]
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
model.prototype.getBuffTargets = function(character,targetType,targets,attackInfos) {
	switch(targetType){
		case "skill_targets":
			var list = []
			for(var i = 0;i < targets.length;i++)
				if(targets[i].checkAim() && !attackInfos[i].dodge)
					list.push(targets[i])
			return list
		break
		default:
			return this.getTargets(character,targetType)
		break
	}
}
model.prototype.getTargets = function(character,targetType) {
	switch(targetType){
		case "enemy_normal":
			//默认单体
			return this.getEnemyNormal(character)
		case "enemy_back_rand_1":
			//后排随机单体
			return this.getEnemyBackRandom(character,1)
		case "enemy_all":
			//敌方全体
			return this.getEnemyAll(character)
		default:
			//默认单体
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
//选择后排随机单体
model.prototype.getEnemyBackRandom = function(character,count) {
	const FRONT_LIST = [0,1]
	const BACK_LIST = [2,3,4]
	var enemyTeam =  character.fighting["fightInfo"][character.rival].team
	var list = []
	for(var i = 0;i < BACK_LIST.length;i++)
		if(enemyTeam[BACK_LIST[i]].checkAim())
			list.push(enemyTeam[BACK_LIST[i]])
	if(!list.lenth){
		for(var i = 0;i < FRONT_LIST.length;i++)
			if(enemyTeam[FRONT_LIST[i]].checkAim())
				list.push(enemyTeam[FRONT_LIST[i]])
	}
    if(list.length === 0){
        return []
    }else{
    	var tmpTeam = []
    	list.sort(function() {return character.fighting.random("排序") < 0.5 ? 1 : -1})
    	for(var i = 0; i < count && i < list.length;i++)
    		tmpTeam.push(list[i])
        return tmpTeam
    }
}
//敌方全体
model.prototype.getEnemyAll = function(character) {
    var list = []
    var enemyTeam =  character.fighting["fightInfo"][character.rival].team
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			list.push(enemyTeam[index])
		}
	}
    return list
}
model.prototype.callDist = function(pos1,pos2) {
	return Math.abs(pos1[0] - pos2[0]) * 10 + Math.abs(pos1[1] - pos2[1])
}
module.exports = model