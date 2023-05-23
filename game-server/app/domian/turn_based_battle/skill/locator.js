const fightCfg = require("../fightCfg.js")
const TEAMLENGTH = 5 				//队伍人数
const FRONT_NUM = 2 				//前排人数
const POS_MAP = [[0,0.5],[0,1.5],[1,0],[1,1],[1,2]]
const MY_MAP = [[0,0.5],[0,1.5],[1,0.1],[1,1],[1,1.9]]
const ENEMY_MAP = [[0,0.5],[0,1.5],[-1,0.1],[-1,1],[-1,1.9]]
const FRONT_LIST = [0,1]
const BACK_LIST = [2,3,4]
var model = function(fighting) {
	this.fighting = fighting
}
//判断存在可攻击目标
model.prototype.existsTarget = function(character) {
	var enemyTeam =  character.enemyTeam
	for(var i = 0;i < enemyTeam.length;i++){
		if(enemyTeam[i].checkAim()){
			return  true
		}
	}
	return false
}
model.prototype.getBuffTargets = function(character,targetType,targets) {
	switch(targetType){
		case "skill_targets":
			var list = []
			for(var i = 0;i < targets.length;i++)
				if(targets[i].checkAim())
					list.push(targets[i])
			return list
		break
		case "getDiffRealm":
			return this.getDiffRealm(character,targets)
		break
		default:
			return this.getTargets(character,targetType)
		break
	}
}
model.prototype.getTargets = function(character,targetType) {
	if(character.aim && character.aim.checkAim())
		return [character.aim]
	switch(targetType){
		case "enemy_normal":
			//默认单体
			return this.getEnemyNormal(character)
		case "enemy_far":
			return this.getEnemyFar(character)
		case "enemy_back_rand_1":
			//后排随机单体
			return this.getEnemyBackRandom(character,1)
		case "enemy_1":
			//敌方随机单体
			return this.getEnemyRandom(character,1)
		case "enemy_2":
			//敌方2个随机单体
			return this.getEnemyRandom(character,2)
		case "enemy_3":
			//敌方3个随机单体
			return this.getEnemyRandom(character,3)
		case "team_1":
			//我方随机单体
			return this.getTeamRandom(character,1)
		case "team_2":
			//我方2个随机单体
			return this.getTeamRandom(character,2)
		case "team3":
			//我方3个随机单体
			return this.getTeamRandom(character,3)
		case "enemy_all":
			//敌方全体
			return this.getEnemyAll(character)
		case "enemy_adjoin":
			return this.enemyAdjoin(character)
		case "enemy_front":
			return this.getEnemyFront(character)
		case "enemy_back":
			return this.getEnemyBack(character)
		case "team_front":
			return this.getTeamFront(character)
		case "team_back":
			return this.getTeamBack(character)
		case "team_only_front":
			return this.getFront(character.team)
		case "team_only_back":
			return this.getBack(character.team)
		case "enemy_maxAtk_1":
			//敌方攻击力最高单位
			return this.getEnemyMaxAtk(character)
		case "team_maxAtk_1":
			//友方攻击力最高单位
			return this.getTeamMaxAtk(character)
		case "enemy_maxHP":
			//敌方血量最高单位
			return this.getEnemyMaxHP(character)
		case "enemy_minHP":
			//敌方血量最少单位
			return this.getEnemyMinHP(character)
		case "team_self":
			return [character]
		case "team_all":
			return this.getTeamAll(character)
		case "team_friend":
			return this.getFriendAll(character)
		case "team_friend_1":
			return this.getFriend(character,1)
		case "same_realm":
			return this.getSameRealm(character)
		case "enemy_maxAnger":
			return this.getEnemyMaxAnger(character)
		case "friend_minHP":
			return this.getFriendMinHp(character)
		default:
			//默认单体
			return this.getEnemyNormal(character)
	}
}
//获取默认目标数量
model.prototype.getTargetTypeNum = function(targetType) {
	return fightCfg.getCfg("skill_targets")[targetType] ? fightCfg.getCfg("skill_targets")[targetType]["num"] : 1
}
//选择常规敌方目标（按距离）
model.prototype.getEnemyNormal = function(character) {
	var aimList = []
	var enemyTeam =  character.enemyTeam
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
//选择敌方最远目标
model.prototype.getEnemyFar = function(character) {
	var aimList = []
	var enemyTeam =  character.enemyTeam
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			aimList.push({character : enemyTeam[index],dist : this.callDist(MY_MAP[character.index],ENEMY_MAP[index])})
		}
	}
	aimList.sort((a,b) => {
		return a.dist - b.dist
	})
	if(aimList.length)
		return [aimList[aimList.length-1].character]
	else
		return []
}
//选择后排随机单体
model.prototype.getEnemyBackRandom = function(character,count) {
	const FRONT_LIST = [0,1]
	const BACK_LIST = [2,3,4]
	var enemyTeam =  character.enemyTeam
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
    	list.sort(function() {return character.fighting.randomCheck(0.5,"排序") ? 1 : -1})
    	for(var i = 0; i < count && i < list.length;i++)
    		tmpTeam.push(list[i])
        return tmpTeam
    }
}
//敌方全体
model.prototype.getEnemyAll = function(character) {
    var list = []
    var enemyTeam =  character.enemyTeam
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			list.push(enemyTeam[index])
		}
	}
    return list
}
//敌方护甲最高的1个单位
model.prototype.getEnemyMaxArmor = function(character) {
    var list = []
    var target = false
    var enemyTeam =  character.enemyTeam
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			if(!target || enemyTeam[index].attInfo.armor > target.attInfo.armor){
				target = enemyTeam[index]
			}
		}
	}
	if(target)
		return [target]
	else
		return []
}
//敌方攻击最高的1个单位
model.prototype.getEnemyMaxAtk = function(character) {
    var list = []
    var target = false
    var enemyTeam =  character.enemyTeam
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			if(!target || enemyTeam[index].attInfo.atk > target.attInfo.atk){
				target = enemyTeam[index]
			}
		}
	}
	if(target)
		return [target]
	else
		return []
}
//友方攻击最高的1个单位
model.prototype.getTeamMaxAtk = function(character) {
    var list = []
    var target = false
    var team =  character.team
	for(var index = 0;index < team.length;index++){
		if(team[index].checkAim()){
			if(!target || team[index].attInfo.atk > target.attInfo.atk){
				target = team[index]
			}
		}
	}
	if(target)
		return [target]
	else
		return []
}
//敌方血量最少的1个目标
model.prototype.getEnemyMinHP = function(character) {
    var list = []
    var target = false
    var enemyTeam =  character.enemyTeam
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			if(!target || enemyTeam[index].attInfo.hp < target.attInfo.hp){
				target = enemyTeam[index]
			}
		}
	}
	if(target)
		return [target]
	else
		return []
}
//敌方血量最高的1个目标
model.prototype.getEnemyMaxHP = function(character) {
    var list = []
    var target = false
    var enemyTeam =  character.enemyTeam
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			if(!target || enemyTeam[index].attInfo.hp > target.attInfo.hp){
				target = enemyTeam[index]
			}
		}
	}
	if(target)
		return [target]
	else
		return []
}
//敌方随机N个单位
model.prototype.getEnemyRandom = function(character,count) {
	var enemyTeam =  character.enemyTeam
	var tmpList = []
	for(var i = 0;i < enemyTeam.length;i++)
		if(enemyTeam[i].checkAim())
			tmpList.push(enemyTeam[i])
	var list = []
	for(var i = 0;i < count && tmpList.length;i++){
		var rid = Math.floor(character.fighting.random("随机单位") * tmpList.length)
		list.push(tmpList.splice(rid,1)[0])
	}
	return list
}
//我方随机N个单位
model.prototype.getTeamRandom = function(character,count) {
	var team =  character.team
	var tmpList = []
	for(var i = 0;i < team.length;i++)
		if(team[i].checkAim())
			tmpList.push(team[i])
	var list = []
	for(var i = 0;i < count && tmpList.length;i++){
		var rid = Math.floor(character.fighting.random("随机单位") * tmpList.length)
		list.push(tmpList.splice(rid,1)[0])
	}
	return list
}
//我方前排
model.prototype.getTeamFront = function(character) {
	var team =  character.team
	var list = this.getFront(team)
	if(!list.length)
		list = this.getBack(team)
	return list
}
//我方后排
model.prototype.getTeamBack = function(character) {
	var team =  character.team
	var list = this.getBack(team)
	if(!list.length)
		list = this.getFront(team)
	return list
}
//敌方前排
model.prototype.getEnemyFront = function(character) {
	var enemyTeam =  character.enemyTeam
	var list = this.getFront(enemyTeam)
	if(!list.length)
		list = this.getBack(enemyTeam)
	return list
}
//敌方后排
model.prototype.getEnemyBack = function(character) {
	var enemyTeam =  character.enemyTeam
	var list = this.getBack(enemyTeam)
	if(!list.length)
		list = this.getFront(enemyTeam)
	return list
}
//获取前排
model.prototype.getFront = function(team) {
	var list = []
	for(var i = 0;i < FRONT_LIST.length;i++)
		if(team[FRONT_LIST[i]].checkAim())
			list.push(team[FRONT_LIST[i]])
	return list
}
//获取后排
model.prototype.getBack = function(team) {
	var list = []
	for(var i = 0;i < BACK_LIST.length;i++)
		if(team[BACK_LIST[i]].checkAim())
			list.push(team[BACK_LIST[i]])
	return list
}
//敌方相邻目标
model.prototype.enemyAdjoin = function(character) {
	var targets = this.getEnemyNormal(character)
	if(targets[0])
		targets = targets.concat(this.getNearby(targets[0]))
	return targets
}
//获取相邻目标
model.prototype.getNearby = function(character) {
	var aimList = []
	var team =  character.team
	for(var index = 0;index < team.length;index++){
		if(index != character.index && team[index].checkAim() && this.isNearby(character.index,index)){
			aimList.push(team[index])
		}
	}
	return aimList
}
//我方全体
model.prototype.getTeamAll = function(character) {
    var list = []
    var team =  character.team
	for(var index = 0;index < team.length;index++){
		if(team[index].checkAim()){
			list.push(team[index])
		}
	}
    return list
}
//友方除自己外全体
model.prototype.getFriendAll = function(character) {
    var list = []
    var team =  character.team
	for(var index = 0;index < team.length;index++){
		if(index != character.index && team[index].checkAim()){
			list.push(team[index])
		}
	}
    return list
}
//友方随机目标
model.prototype.getFriend = function(character,count) {
    var tmpList = []
    var team =  character.team
	for(var index = 0;index < team.length;index++){
		if(index != character.index && team[index].checkAim()){
			tmpList.push(team[index])
		}
	}
	var list = []
	for(var i = 0;i < count && tmpList.length;i++){
		var rid = Math.floor(character.fighting.random("随机单位") * tmpList.length)
		list.push(tmpList.splice(rid,1)[0])
	}
	return list
}
//获取同阵营
model.prototype.getSameRealm = function(character) {
    var list = []
    var team =  character.team
	for(var index = 0;index < team.length;index++){
		if(team[index].realm == character.realm && team[index].checkAim()){
			list.push(team[index])
		}
	}
    return list
}
//获取敌方存在指定BUFF的目标
model.prototype.getEnemyHasBuff = function(character,buffId) {
	var enemyTeam =  character.enemyTeam
	var list = []
	for(var i = 0;i < enemyTeam.length;i++)
		if(enemyTeam[i].checkAim() && enemyTeam[i].buffs[buffId])
			list.push(enemyTeam[i])
	return list
}
//与攻击目标职业不同的敌方目标
model.prototype.getDiffRealm = function(character,targets) {
	var list = []
	if(targets[0]){
		var enemyTeam =  targets[0].team
		for(var i = 0;i < enemyTeam.length;i++)
			if(enemyTeam[i].checkAim() && enemyTeam[i].realm != targets[0].realm)
				list.push(enemyTeam[i])
	}
	return list
}
//敌方怒气最高目标
model.prototype.getEnemyMaxAnger = function(character) {
    var list = []
    var target = false
    var enemyTeam =  character.enemyTeam
	for(var index = 0;index < enemyTeam.length;index++){
		if(enemyTeam[index].checkAim()){
			if(!target || enemyTeam[index].attInfo.curAnger > target.attInfo.curAnger){
				target = enemyTeam[index]
			}
		}
	}
	if(target)
		return [target]
	else
		return []
}
//友方血量最低目标
model.prototype.getFriendMinHp = function(character) {
    var list = []
    var target = false
    var team =  character.team
	for(var index = 0;index < team.length;index++){
		if(index != character.index && team[index].checkAim()){
			if(!target || team[index].attInfo.hp < target.attInfo.hp){
				target = team[index]
			}
		}
	}
	if(target)
		return [target]
	else
		return []
}
//计算距离 X轴权重高
model.prototype.callDist = function(pos1,pos2) {
	return Math.abs(pos1[0] - pos2[0]) * 10 + Math.abs(pos1[1] - pos2[1])
}
//判断相邻
model.prototype.isNearby = function(index1,index2) {
	return Math.abs(POS_MAP[index1][0] - POS_MAP[index2][0]) + Math.abs(POS_MAP[index1][1] - POS_MAP[index2][1]) <= 1.5 ? true : false
}
module.exports = model
