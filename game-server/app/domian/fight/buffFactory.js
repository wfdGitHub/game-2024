var frozen = require("./buff/frozen.js")
var dizzy = require("./buff/dizzy.js")
var poison = require("./buff/poison.js")
var burn = require("./buff/burn.js")
var buffFactory = function() {

}
//获取BUFF
buffFactory.getBuff = function(character,target,otps) {
	var buffId = otps.buffId
	switch(buffId){
		case 0:
			return new frozen(character,target,otps)
		case 1:
			return new dizzy(character,target,otps)
		case 2:
			return new poison(character,target,otps)
		case 3:
			return new burn(character,target,otps)
		default:
			return false
	}
}

module.exports = buffFactory