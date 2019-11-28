//目标选择
var model = function(seededNum) {
	this.seededNum = seededNum
}
//获取目标
model.prototype.getTargets = function(character,skill) {
	switch(skill.targetType){
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
		case "team_horizontal_front":
			//己方后排
			return	this.getTeamHorizontalBack(character)
		default :
			console.error("targetType error ",skill.targetType)
			return []
	}
}

//默认单个目标
model.prototype.getTargetNormal = function(character) {
	var index = character.index
	if(index >= 3){
		index -= 3
	}
	//优先打对位的敌方前排
	if(!character.enemy[index].died){
		return  [character.enemy[index]]
	}
	//若不存在,选取前排位置顺序靠前单位
	for(var i = 0;i < 3;i++){
		if(i != index){
			if(!character.enemy[i].died){
				return  [character.enemy[i]]
			}
		}
	}
	//若不存在前排，选取对位的地方后排
	if(!character.enemy[index + 3].died){
		return  [character.enemy[index + 3]]
	}
	//最后选取后排位置靠前单位
	for(var i = 3;i < 6;i++){
		if(i != index + 3){
			if(!character.enemy[i].died){
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
	if(!character.enemy[index].died){
		return  [character.enemy[index]]
	}
	//若不存在,选取后排位置顺序靠前单位
	for(var i = 3;i < 6;i++){
		if(i != index){
			if(!character.enemy[i].died){
				return  [character.enemy[i]]
			}
		}
	}
	//若不存在后排，选取对位的地方前排
	if(!character.enemy[index - 3].died){
		return  [character.enemy[index - 3]]
	}
	//最后选取前排位置靠前单位
	for(var i = 0;i < 3;i++){
		if(i != index - 3){
			if(!character.enemy[i].died){
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
        if(!target.died){
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
	if(list[0] && list[0].index < 3 && !list[0].team[list[0].index + 3].died){
		list.push(list[0].team[list[0].index + 3])
	}
	return list
}
//敌方前排
model.prototype.getEnemyHorizontalFront = function(character) {
	var list = []
	for(var i = 0;i < 3;i++){
        if(!character.enemy[i].died){
        	list.push(character.enemy[i])
        }
	}
	if(!list.length){
		for(var i = 3;i < 6;i++){
	        if(!character.enemy[i].died){
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
        if(!character.enemy[i].died){
        	list.push(character.enemy[i])
        }
	}
	if(!list.length){
		for(var i = 0;i < 3;i++){
	        if(!character.enemy[i].died){
	        	list.push(character.enemy[i])
	        }
		}
	}
	return list
}
//敌方全体
model.prototype.getEnemyAll = function(character) {
    var list = []
    character.enemy.forEach(function(target,index) {
        if(!target.died){
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
		if(list[0].index % 3 >= 1 && !list[0].team[list[0].index - 1].died){
			list.push(list[0].team[list[0].index - 1])
		}
		//右方向
		if(list[0].index % 3 <= 1 && !list[0].team[list[0].index + 1].died){
			list.push(list[0].team[list[0].index + 1])
		}
		//后方向
		if(list[0].index < 3 && !list[0].team[list[0].index + 3].died){
			list.push(list[0].team[list[0].index + 3])
		}
	}
	return list
}
//敌方血量最少目标
model.prototype.getEnemyMinHP = function(character) {
    var minIndex = -1
    character.enemy.forEach(function(target,index) {
        if(!target.died){
            if(minIndex === -1 || target.hp < character.enemy[minIndex].hp){
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
//敌方随机N个单位
model.prototype.getTeamRandom = function(character,count) {
    var list = []
    character.team.forEach(function(target,index) {
        if(!target.died){
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
        if(!character.team[i].died){
        	list.push(character.team[i])
        }
	}
	if(!list.length){
		for(var i = 3;i < 6;i++){
	        if(!character.team[i].died){
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
        if(!character.team[i].died){
        	list.push(character.team[i])
        }
	}
	if(!list.length){
		for(var i = 0;i < 3;i++){
	        if(!character.team[i].died){
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
        if(!target.died){
        	list.push(target)
        }
    })
    return list
}
module.exports = model