var logger = require('pomelo-logger').getLogger(__filename);
var formula = function() {}
//计算伤害
formula.prototype.calDamage = function(attacker, target, skill) {
	var atk = attacker.getTotalAttack();
	var def = target.getTotalDefence();
	var mul = Math.sqrt(Math.abs(atk-def))/5 + 1;
	var damage = Math.ceil(atk*skill.mul + skill.fixed)
	//暴击计算
	var critFlag = false
	var crit = 0.05 + ((Math.pow(attacker.crit,2) || 0) / ((attacker.critDef + target.critDef) || 1)) / 100
	if(Math.random() < crit){
		critFlag = true
		damage = Math.ceil(damage * 1.5)
	}
	
	if (damage <= 0) {
		damage = 1;
	}
	if (damage > target.hp) {
		damage = target.hp;
		if(damage == 0){
			logger.error('attack a died character!!! %j', target);
		}
	}
	return {damage : Math.round(damage),crit : critFlag,skill : skill}
};
//获取攻击目标
formula.prototype.getAttackTarget = function(attacker,team,skill) {
	switch(skill.targetType){
		case 1:
			return this.getTargetNormal(attacker,team)
		break
		case 2:
			return this.getTargetMinHP(attacker,team)
		break
		case 3:
			return this.getTargetMaxHP(attacker,team)
		break
		case 4:
			return formula.getTargetRandom(attacker,team,3)
		default:
			return false
		break
	}
}
//获取普通目标
formula.prototype.getTargetNormal = function(attacker,team) {
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
	var rand = Math.random() * allRand
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
//获取血量最少目标
formula.prototype.getTargetMinHP = function(attacker,team) {
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
//获取血量最多目标
formula.prototype.getTargetMaxHP = function(attacker,team) {
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
//获取指定数量随机目标
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
    	list.sort(function(a,b){return Math.random() > 0.5})
    	for(var i = 0; i < count && i < list.length;i++){
    		list[i] = team[list[i]]
    	}
        return list
    }
}
module.exports = {
	id : "formula",
	func : formula
}