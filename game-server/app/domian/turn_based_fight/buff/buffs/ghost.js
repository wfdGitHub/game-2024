//亡魂
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	if(character.kill_ghost_value){
		buff.duration += character.kill_ghost_value
		character.kill_ghost_value = 0
	}
	character.ghost = true
	buff.character.died = false
	buff.character.addAnger(8)
	buff.clear = function() {
		// console.log(buff.character.id+"中毒结束")
		buff.character.died = true
	}
	return buff
}
module.exports = model