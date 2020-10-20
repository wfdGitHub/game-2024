//目标选择
var model = function(seededNum) {
	this.seededNum = seededNum
}
//获取目标
model.prototype.getTargets = function(character,targetType) {
	switch(targetType){
		case "enemy_normal":
			//默认敌人前排单体
			return this.getTargetNormal(character)
		case "enemy_normal_back":
			//默认敌方后排单体
			return this.getEnemyNormalBack(character)
		case "enemy_1":
			//敌方随机单体
			return this.getEnemyRandom(character,1)
		case "enemy_2":
			//敌方2个随机单体
			return this.getEnemyRandom(character,2)
		case "enemy_3":
			//敌方3个随机单体
			return this.getEnemyRandom(character,3)
		case "enemy_4":
			//敌方4个随机单体
			return this.getEnemyRandom(character,4)
		case "enemy_5":
			//敌方5个随机单体
			return this.getEnemyRandom(character,5)
		case "enemy_vertical":
			//敌方纵排
			return this.getEnemyVertical(character)
		case "enemy_horizontal_front":
			//敌方前排
			return this.getEnemyHorizontalFront(character)
		case "enemy_horizontal_back":
			//敌方后排
			return this.getEnemyHorizontalBack(character)
		case "enemy_horizontal_front_real":
			//敌方仅前排
			return this.getEnemyHorizontalFrontReal(character)
		case "enemy_horizontal_back_real":
			//敌方仅后排
			return this.getEnemyHorizontalBackReal(character)
		case "enemy_all":
			//敌方全体
			return	this.getEnemyAll(character)
		case "enemy_adjoin":
			//敌方相邻目标
			return	this.getEnemyAdjoin(character)
		case "enemy_minHP":
			//敌方生命最少单位
			return	this.getEnemyMinHP(character)
		case "team_1":
			//己方随机1个目标
			return	this.getTeamRandom(character,1)
		case "team_2":
			//己方随机2个目标
			return	this.getTeamRandom(character,2)
		case "team_3":
			//己方随机3个目标
			return	this.getTeamRandom(character,3)
		case "team_4":
			//己方随机4个目标
			return	this.getTeamRandom(character,4)
		case "team_5":
			//己方随机5个目标
			return	this.getTeamRandom(character,5)
		case "team_all":
			//己方全体
			return	this.getTeamAll(character)
		case "team_horizontal_front":
			//己方前排
			return	this.getTeamHorizontalFront(character)
		case "team_horizontal_back":
			//己方后排
			return	this.getTeamHorizontalBack(character)
		case "team_lossMaxHP":
			//己方损失血量最多单位
			return	this.getTeamLossMaxHP(character)
		case "team_minHp_1":
			//获取己方生命值最少的1个单位
			return this.getTeamRandomMinHp(character,1)
		case "team_minHp_2":
			//获取己方生命值最少的2个单位
			return this.getTeamRandomMinHp(character,2)
		case "team_minHp_3":
			//获取己方生命值最少的3个单位
			return this.getTeamRandomMinHp(character,3)
		case "team_minHp_4":
			//获取己方生命值最少的4个单位
			return this.getTeamRandomMinHp(character,4)
		case "team_minHp_5":
			//获取己方生命值最少的5个单位
			return this.getTeamRandomMinHp(character,5)
		case "friend_minHp_1":
			//获取友方生命值最少的1个单位
			return this.getFriendRandomMinHp(character,1)
		break
		case "friend_minHp_2":
			//获取友方生命值最少的2个单位
			return this.getFriendRandomMinHp(character,2)
		break
		case "friend_minHp_3":
			//获取友方生命值最少的3个单位
			return this.getFriendRandomMinHp(character,3)
		break
		case "friend_minHp_4":
			//获取友方生命值最少的4个单位
			return this.getFriendRandomMinHp(character,4)
		break
		case "friend_minHp_5":
			//获取友方生命值最少的5个单位
			return this.getFriendRandomMinHp(character,5)
		break
		case "team_min_index":
			//己方阵容站位最靠前的单位
			return this.getTeamMinIndex(character)
		case "team_self":
			//选择自己
			return [character]
		default :
			console.error("targetType error ",targetType)
			return []
	}
}
//获取BUFF目标
model.prototype.getBuffTargets = function(character,targetType,targets) {
	switch(targetType){
		case "skill_targets":
			//技能目标
			return targets || []
		case "team_self":
			return [character]
		case "team_all":
			//己方全体
			return	this.getTeamAll(character)
		case "team_horizontal_front":
			//己方前排
			return	this.getTeamHorizontalFront(character)
		case "team_horizontal_back":
			//己方后排
			return	this.getTeamHorizontalBack(character)
		case "enemy_horizontal_front":
			//敌方前排
			return this.getEnemyHorizontalFront(character)
		case "enemy_horizontal_back":
			//敌方后排
			return this.getEnemyHorizontalBack(character)
		case "enemy_horizontal_front_real":
			//敌方仅前排
			return this.getEnemyHorizontalFrontReal(character)
		case "enemy_horizontal_back_real":
			//敌方仅后排
			return this.getEnemyHorizontalBackReal(character)
		case "friend_minHp_1":
			//获取友方生命值最少的1个单位
			return this.getFriendRandomMinHp(character,1)
		break
		case "friend_minHp_2":
			//获取友方生命值最少的2个单位
			return this.getFriendRandomMinHp(character,2)
		break
		case "friend_minHp_3":
			//获取友方生命值最少的3个单位
			return this.getFriendRandomMinHp(character,3)
		break
		case "friend_minHp_4":
			//获取友方生命值最少的4个单位
			return this.getFriendRandomMinHp(character,4)
		break
		case "friend_minHp_5":
			//获取友方生命值最少的5个单位
			return this.getFriendRandomMinHp(character,5)
		break
		case "enemy_all":
			//敌方全体
			return	this.getEnemyAll(character)
		default :
			return targets || []
	}
}
//获取目标类型对应目标数量
model.prototype.getTargetsNum = function(targetType) {
	switch(targetType){
		case "enemy_normal":
			//默认敌人前排单体
			return 1
		case "enemy_normal_back":
			//默认敌方后排单体
			return 1
		case "enemy_1":
			//敌方随机单体
			return 1
		case "enemy_2":
			//敌方2个随机单体
			return 2
		case "enemy_3":
			//敌方3个随机单体
			return 3
		case "enemy_4":
			//敌方4个随机单体
			return 4
		case "enemy_5":
			//敌方5个随机单体
			return 5
		case "enemy_vertical":
			//敌方纵排
			return 2
		case "enemy_horizontal_front":
			//敌方前排
			return 3
		case "enemy_horizontal_back":
			//敌方后排
			return 3
		case "enemy_all":
			//敌方全体
			return	6
		case "enemy_adjoin":
			//敌方相邻目标
			return	4
		case "enemy_minHP":
			//敌方生命最少单位
			return	1
		case "team_lossMaxHP":
			//己方损失血量最多单位
			return	1
		case "team_1":
			//己方随机1个目标
			return	1
		case "team_2":
			//己方随机2个目标
			return	2
		case "team_3":
			//己方随机3个目标
			return	3
		case "team_4":
			//己方随机4个目标
			return	4
		case "team_5":
			//己方随机5个目标
			return	5
		case "team_all":
			//己方全体
			return	6
		case "team_horizontal_front":
			//己方前排
			return	3
		case "team_horizontal_back":
			//己方后排
			return	3
		case "team_minHp_1":
			//获取友方生命值最少的1个单位
			return 1
		case "team_minHp_2":
			//获取友方生命值最少的2个单位
			return 2
		case "team_minHp_3":
			//获取友方生命值最少的3个单位
			return 3
		case "team_minHp_4":
			//获取友方生命值最少的4个单位
			return 4
		case "team_minHp_5":
			//获取友方生命值最少的5个单位
			return 5
		case "team_self":
			//选择自己
			return 1
		default :
			return 1
	}
}
//默认单个目标
model.prototype.getTargetNormal = function(character) {
	var index = character.index
	if(index >= 3){
		index -= 3
	}
	//优先打对位的敌方前排
	if(model.check(character.enemy[index])){
		return  [character.enemy[index]]
	}
	//若不存在,选取前排位置顺序靠前单位
	for(var i = 0;i < 3;i++){
		if(i != index){
			if(model.check(character.enemy[i])){
				return  [character.enemy[i]]
			}
		}
	}
	//若不存在前排，选取对位的地方后排
	if(model.check(character.enemy[index + 3])){
		return  [character.enemy[index + 3]]
	}
	//最后选取后排位置靠前单位
	for(var i = 3;i < 6;i++){
		if(i != index + 3){
			if(model.check(character.enemy[i])){
				return  [character.enemy[i]]
			}
		}
	}
	return []
}
//敌方后排单体
model.prototype.getEnemyNormalBack = function(character) {
	var index = character.index
	if(index < 3){
		index += 3
	}
	//优先打对位的敌方后排
	if(model.check(character.enemy[index])){
		return  [character.enemy[index]]
	}
	//若不存在,选取后排位置顺序靠前单位
	for(var i = 3;i < 6;i++){
		if(i != index){
			if(model.check(character.enemy[i])){
				return  [character.enemy[i]]
			}
		}
	}
	//若不存在后排，选取对位的地方前排
	if(model.check(character.enemy[index - 3])){
		return  [character.enemy[index - 3]]
	}
	//最后选取前排位置靠前单位
	for(var i = 0;i < 3;i++){
		if(i != index - 3){
			if(model.check(character.enemy[i])){
				return  [character.enemy[i]]
			}
		}
	}
	return []
}
//敌方随机N个单位
model.prototype.getEnemyRandom = function(character,count) {
    var list = []
    character.enemy.forEach(function(target,index) {
        if(model.check(target)){
        	list.push(index)
        }
    })
    if(list.length === 0){
        return list
    }else{
    	for(var i = 0;i < list.length;i++){
    		var index = Math.floor(this.seededNum.random("排序") * list.length)
    		var tmp = list[i]
    		list[i] = list[index]
    		list[index] = tmp
    	}
    	var tmpTeam = []
    	for(var i = 0; i < count && i < list.length;i++){
    		tmpTeam.push(character.enemy[list[i]])
    	}
        return tmpTeam
    }
}
//敌方纵排
model.prototype.getEnemyVertical = function(character) {
	var list = this.getTargetNormal(character)
	if(list[0] && list[0].index < 3 && model.check(list[0].team[list[0].index + 3])){
		list.push(list[0].team[list[0].index + 3])
	}
	return list
}
//敌方前排
model.prototype.getEnemyHorizontalFront = function(character) {
	var list = []
	for(var i = 0;i < 3;i++){
        if(model.check(character.enemy[i])){
        	list.push(character.enemy[i])
        }
	}
	if(!list.length){
		for(var i = 3;i < 6;i++){
	        if(model.check(character.enemy[i])){
	        	list.push(character.enemy[i])
	        }
		}
	}
	return list
}
//敌方后排
model.prototype.getEnemyHorizontalBack = function(character) {
	var list = []
	for(var i = 3;i < 6;i++){
        if(model.check(character.enemy[i])){
        	list.push(character.enemy[i])
        }
	}
	if(!list.length){
		for(var i = 0;i < 3;i++){
	        if(model.check(character.enemy[i])){
	        	list.push(character.enemy[i])
	        }
		}
	}
	return list
}
//敌方仅前排
model.prototype.getEnemyHorizontalFrontReal = function(character) {
	var list = []
	for(var i = 0;i < 3;i++){
        if(model.check(character.enemy[i])){
        	list.push(character.enemy[i])
        }
	}
	return list
}
//敌方仅后排
model.prototype.getEnemyHorizontalBackReal = function(character) {
	var list = []
	for(var i = 3;i < 6;i++){
        if(model.check(character.enemy[i])){
        	list.push(character.enemy[i])
        }
	}
	return list
}
//敌方全体
model.prototype.getEnemyAll = function(character) {
    var list = []
    character.enemy.forEach(function(target,index) {
        if(model.check(target)){
        	list.push(target)
        }
    })
    return list
}
//敌方相邻单位
model.prototype.getEnemyAdjoin = function(character) {
	var list = this.getTargetNormal(character)
	if(list[0]){
		//左方向
		if(list[0].index % 3 >= 1 && model.check(list[0].team[list[0].index - 1])){
			list.push(list[0].team[list[0].index - 1])
		}
		//右方向
		if(list[0].index % 3 <= 1 && model.check(list[0].team[list[0].index + 1])){
			list.push(list[0].team[list[0].index + 1])
		}
		//后方向
		if(list[0].index < 3 && model.check(list[0].team[list[0].index + 3])){
			list.push(list[0].team[list[0].index + 3])
		}
	}
	return list
}
//敌方血量最少目标
model.prototype.getEnemyMinHP = function(character) {
    var minIndex = -1
    character.enemy.forEach(function(target,index) {
        if(model.check(target)){
            if(minIndex === -1 || target.attInfo.hp < character.enemy[minIndex].attInfo.hp){
                minIndex = index
            }
        }
    })
    if(minIndex === -1){
        return []
    }else{
        return [character.enemy[minIndex]]
    }
}
//己方损失血量最多目标
model.prototype.getTeamLossMaxHP = function(character) {
    var minIndex = -1
    for(var i = 0;i < character.team.length;i++){
        if(model.check(character.team[i])){
            if(minIndex === -1 || (character.team[i].attInfo.maxHP - character.team[i].attInfo.hp) > (character.team[minIndex].attInfo.maxHP - character.team[minIndex].attInfo.hp)){
                minIndex = i
            }
        }
    }
    if(minIndex === -1){
        return []
    }else{
        return [character.team[minIndex]]
    }
}
//己方随机N个单位
model.prototype.getTeamRandom = function(character,count) {
    var list = []
    character.team.forEach(function(target,index) {
        if(model.check(target)){
        	list.push(index)
        }
    })
    if(list.length === 0){
        return list
    }else{
    	for(var i = 0;i < list.length;i++){
    		var index = Math.floor(this.seededNum.random("排序") * list.length)
    		var tmp = list[i]
    		list[i] = list[index]
    		list[index] = tmp
    	}
    	var tmpTeam = []
    	for(var i = 0; i < count && i < list.length;i++){
    		tmpTeam.push(character.team[list[i]])
    	}
        return tmpTeam
    }
}
//己方前排
model.prototype.getTeamHorizontalFront = function(character) {
	var list = []
	for(var i = 0;i < 3;i++){
        if(model.check(character.team[i])){
        	list.push(character.team[i])
        }
	}
	if(!list.length){
		for(var i = 3;i < 6;i++){
	        if(model.check(character.team[i])){
	        	list.push(character.team[i])
	        }
		}
	}
	return list
}
//己方后排
model.prototype.getTeamHorizontalBack = function(character) {
	var list = []
	for(var i = 3;i < 6;i++){
        if(model.check(character.team[i])){
        	list.push(character.team[i])
        }
	}
	if(!list.length){
		for(var i = 0;i < 3;i++){
	        if(model.check(character.team[i])){
	        	list.push(character.team[i])
	        }
		}
	}
	return list
}
//己方全体
model.prototype.getTeamAll = function(character) {
    var list = []
    character.team.forEach(function(target,index) {
        if(model.check(target)){
        	list.push(target)
        }
    })
    return list
}
//己方生命最少的n个单位
model.prototype.getTeamRandomMinHp = function(character,count) {
    var list = []
    character.team.forEach(function(target,index) {
        if(model.check(target)){
        	list.push(target)
        }
    })
    for(var i = 0;i < list.length;i++)
    	for(var j = i + 1;j < list.length;j++)
    		if(list[j].attInfo.hp < list[i].attInfo.hp){
    			var tmp = list[j]
    			list[j] = list[i]
    			list[i] = tmp
    		}
    return list.slice(0,count)
}
//友方(除自己)生命最少的n个单位
model.prototype.getFriendRandomMinHp = function(character,count) {
    var list = []
    character.team.forEach(function(target,index) {
        if(model.check(target) && target != character){
        	list.push(target)
        }
    })
    for(var i = 0;i < list.length;i++)
    	for(var j = i + 1;j < list.length;j++)
    		if(list[j].attInfo.hp < list[i].attInfo.hp){
    			var tmp = list[j]
    			list[j] = list[i]
    			list[i] = tmp
    		}
    return list.slice(0,count)
}
//己方阵容站位最靠前的单位
model.prototype.getTeamMinIndex = function(character) {
	for(var i = 0;i < character.team.length;i++){
		if(model.check(character.team[i])){
			return [character.team[i]]
		}
	}
    return []
}
model.check = function(character) {
	if(character.died || character.buffs["banish"])
		return false
	else
		return true
}
module.exports = model