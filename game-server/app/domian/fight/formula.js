var K = 1
var A = 1
var formula = function() {}
formula.calDamage = function(attacker, target, skill) {
	var damageInfo = {damage : 0,skill : skill}
	//命中判断
	var hitRate = 	0.3 + 0.55 * (attacker.hitRate / (K * target.dodgeRate || 1))
	// console.log("hitRate",hitRate)
	if(attacker.fighting.seeded.random()  > hitRate){
		damageInfo.miss = true
		return damageInfo
	}
	//暴击判断
	var crit = 0.05 * ((attacker.crit) / (K * target.critDef || 1))
	// console.log("crit",crit)
	if(attacker.fighting.seeded.random()  < crit){
		damageInfo.crit = true
	}
	//格挡判断
	var block = 0.1 *  (K * target.block / (attacker.wreck || 1))
	// console.log("block",block)
	if(attacker.fighting.seeded.random()  < block){
		damageInfo.block = true
	}
	//伤害计算
	var atk = attacker.getTotalAttack();
	var def = target.getTotalDefence();
	var basic = Math.floor(atk*skill.mul + skill.fixed)
	var damage = Math.pow(basic,2) / ((basic + (A * def)) || 1)
	// console.log("basic : " + basic + " damage : "+damage,atk)
	if(damageInfo.crit){
		damage = Math.floor(damage * (1.5 + attacker.slay / 1000))
		// console.log("暴击 "+damage)
	}
	if(damageInfo.block){
		damage = Math.floor(damage * (1 - target.blockRate))
		// console.log("格挡 "+damage)
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
	damageInfo.damage = Math.floor(damage)
    return damageInfo
};
formula.getAttackTarget = function(attacker,team,skill) {
	switch(skill.targetType){
		case 1:
			return formula.getTargetNormal(attacker,team)
		break
		case 2:
			return formula.getTargetMinHP(attacker,team)
		break
		case 3:
			return formula.getTargetMaxHP(attacker,team)
		break
		case 4:
			return formula.getTargetRandom(attacker,team,3)
		default:
			return false
		break
	}
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
            target = list[parseInt(attacker.fighting.seeded.random() * list.length)]
            console.log("混乱随机选择目标 : ",target.name)
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
		allRand += rand
		arr.push(rand)
	}
	var rand = attacker.fighting.seeded.random() * allRand
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
    	list.sort(function(a,b){return attacker.fighting.seeded.random() > 0.5})
    	for(var i = 0; i < count && i < list.length;i++){
    		list[i] = team[list[i]]
    	}
        return list
    }
}
module.exports = formula