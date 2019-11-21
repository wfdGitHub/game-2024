var K = 1
var A = 1
var formula = function() {}
//计算伤害
formula.calDamage = function(attacker, target, skill) {
	var damageInfo = {damage : 0,skill : skill}
	//命中判断
	var hitRate = 	0.3 + 0.55 * (attacker.getTotalAtt("hitRate") / (K * target.getTotalAtt("dodgeRate") || 1))
	if(attacker.fighting.seeded.random("命中判断")  > hitRate){
		damageInfo.miss = true
		return damageInfo
	}
	//暴击判断
	var crit = 0.1 * ((attacker.getTotalAtt("crit")) / (K * target.getTotalAtt("critDef") || 1))
	if(attacker.fighting.seeded.random("暴击判断")  < crit){
		damageInfo.crit = true
	}
	//格挡判断
	var block = 0.1 *  (K * target.getTotalAtt("block") / (attacker.getTotalAtt("wreck") || 1))
	if(attacker.fighting.seeded.random("格挡判断")  < block){
		damageInfo.block = true
	}
	//伤害计算
	var atk = attacker.getTotalAtt("atk");
	var def = target.getTotalAtt("def");
	var basic = Math.round(atk*skill.mul + skill.fixed)
	var damage = Math.pow(basic,2) / ((basic + (A * def)) || 1)
	if(damageInfo.crit){
		damage = Math.round(damage * (1.5 + attacker.getTotalAtt("slay") / 1000))
	}
	if(damageInfo.block){
		damage = Math.round(damage * (1 - target.getTotalAtt("blockRate") - 0.25))
	}
	//伤害加深
	if(attacker.getTotalAtt("amp")){
		damage = Math.round(damage * (attacker.getTotalAtt("amp") + 1))
	}
	//最小伤害
	if (damage <= 1) {
		damage = 1;
	}
	//溢出判断
	if(damage > target.hp){
		damage = target.hp;
		if(damage <= 0){
			damage = 0
		}
	}
	damageInfo.damage = Math.round(damage)
    return damageInfo
};
//获取目标队列
formula.getAttackTarget = function(attacker,team,skill) {
	switch(skill.targetType){
		case "normal":
			return formula.getTargetNormal(attacker,team)
		break
		case "minhp":
			return formula.getTargetMinHP(attacker,team)
		break
		case "maxhp":
			return formula.getTargetMaxHP(attacker,team)
		break
		case "rand1":
			return formula.getTargetRandom(attacker,team,1)
		case "rand2":
			return formula.getTargetRandom(attacker,team,2)
		case "rand3":
			return formula.getTargetRandom(attacker,team,3)
		case "rand4":
			return formula.getTargetRandom(attacker,team,4)
		case "rand5":
			return formula.getTargetRandom(attacker,team,5)
		case "all":
			return formula.getAllTeam(attacker,team)
		case "self":
			return [attacker]
		default:
			return false
		break
	}
}
formula.getAllTeam = function(attacker,team) {
    var list = []
    team.forEach(function(character,index) {
        if(!character.died){
        	list.push(character)
        }
    })
    return list
}
formula.getTargetNormal = function(attacker,team) {
    var target = false
    if(attacker.chaos){
        var list = []
        attacker.fighting.characterArr.forEach(function(character) {
            if(!character.died && attacker != character){
                list.push(character)
            }
        })
        if(list.length > 0){
            target = list[parseInt(attacker.fighting.seeded.random("混乱选择目标") * list.length)]
        }
        return [target]
    }
	if(attacker.target && !attacker.target.died){
		return [attacker.target]
	}
	attacker.target = false
	var arr = []
	var allRand = 0
	for(var i = 0;i < team.length;i++){
		var rand = team[i].hp / team[i].maxHP
		if(rand < 0){
			rand = 0
		}
		allRand += rand
		arr.push(rand)
	}
	var rand = attacker.fighting.seeded.random("选择目标") * allRand
	var curRand = 0
	for(var i = 0;i < arr.length;i++){
		if(rand > curRand && rand <= arr[i] + curRand){
			attacker.target = team[i]
			break
		}
		curRand += arr[i]
	}
	if(attacker.target){
		return [attacker.target]
	}else{
		return false
	}
}
formula.getTargetMinHP = function(attacker,team) {
    var minIndex = -1
    team.forEach(function(character,index) {
        if(!character.died){
            if(minIndex === -1 || character.hp < team[minIndex].hp){
                minIndex = index
            }
        }
    })
    if(minIndex === -1){
        return false
    }else{
        return [team[minIndex]]
    }
}
formula.getTargetMaxHP = function(attacker,team) {
    var maxIndex = -1
    team.forEach(function(character,index) {
        if(!character.died){
            if(maxIndex === -1 || character.hp > team[maxIndex].hp){
                maxIndex = index
            }
        }
    })
    if(maxIndex === -1){
        return false
    }else{
        return [team[maxIndex]]
    }
}
formula.getTargetRandom = function(attacker,team,count) {
    var list = []
    team.forEach(function(character,index) {
        if(!character.died){
        	list.push(index)
        }
    })
    if(list.length === 0){
        return false
    }else{
    	for(var i = 0;i < list.length;i++){
    		var index = Math.floor(attacker.fighting.seeded.random("排序") * list.length)
    		var tmp = list[i]
    		list[i] = list[index]
    		list[index] = tmp
    	}
    	var tmpTeam = []
    	for(var i = 0; i < count && i < list.length;i++){
    		tmpTeam.push(team[list[i]])
    	}
        return tmpTeam
    }
}
module.exports = formula