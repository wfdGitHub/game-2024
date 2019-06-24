var frozen = require("./buff/frozen.js")
var dizzy = require("./buff/dizzy.js")
var poison = require("./buff/poison.js")
var burn = require("./buff/burn.js")
var chaos = require("./buff/chaos.js")
var blackArt = require("./buff/blackArt.js")
var silence = require("./buff/silence.js")
var buffFactory = function() {

}
//获取BUFF
buffFactory.getBuff = function(attacker,target,otps) {
	var buffId = otps.buffId
	switch(buffId){
		case 21001:
			return new frozen(attacker,target,otps)
		case 21002:
			return new dizzy(attacker,target,otps)
		case 21003:
			return new poison(attacker,target,otps)
		case 21004:
			return new burn(attacker,target,otps)
        case 21005:
            return new chaos(attacker,target,otps)
        case 21006:
        	return new blackArt(attacker,target,otps)
        case 21007:
        	return new silence(attacker,target,otps)
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
		case 21001:
			tmpRate = attacker.frozenAtk - target.frozenDef
		break
		case 21002:
			tmpRate = attacker.dizzyAtk - target.dizzyDef
		break
		case 21003:
			tmpRate = attacker.poisonAtk - target.poisonDef
		break
		case 21004:
			tmpRate = attacker.burnAtk - target.burnDef
		break
        case 21005:
			tmpRate = attacker.chaosAtk - target.chaosDef
		break
        case 21006:
			tmpRate = attacker.blackArtAtk - target.blackArtDef
		break
        case 21007:
			tmpRate = attacker.silenceAtk - target.silenceDef
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