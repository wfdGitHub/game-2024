var frozen = require("./buff/frozen.js")
var dizzy = require("./buff/dizzy.js")
var poison = require("./buff/poison.js")
var burn = require("./buff/burn.js")
var chaos = require("./buff/chaos.js")
var buffFactory = function() {

}
//获取BUFF
buffFactory.getBuff = function(attacker,target,otps) {
	var buffId = otps.buffId
	switch(buffId){
		case 0:
			return new frozen(attacker,target,otps)
		case 1:
			return new dizzy(attacker,target,otps)
		case 2:
			return new poison(attacker,target,otps)
		case 3:
			return new burn(attacker,target,otps)
        case 4:
            return new chaos(attacker,target,otps)
		default:
			return false
	}
}
//判断BUFF命中率
buffFactory.checkBuffRate = function(attacker,target,skill) {
	var buffId = skill.buffId
	var buffRate = skill.buffRate
	var tmpRate = 0
	switch(buffId){
		case 0:
			tmpRate = attacker.frozenAtk - target.frozenDef
		break
		case 1:
			tmpRate = attacker.dizzyAtk - target.dizzyDef
		break
		case 2:
			tmpRate = attacker.poisonAtk - target.poisonDef
		break
		case 3:
			tmpRate = attacker.burnAtk - target.burnDef
		break
        case 4:
        	tmpRate = attacker.chaosAtk - target.chaosDef
        break
		default:
			return false
	}
	buffRate = buffRate * (tmpRate + 1)
	if(attacker.fighting.seeded.random() < buffRate){
		return true
	}else{
		return false
	}
}
module.exports = buffFactory