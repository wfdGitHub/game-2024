//亡魂
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	if(buff.character.kill_ghost_value){
		buff.duration += buff.character.kill_ghost_value
		buff.character.kill_ghost_value = 0
	}
	if(buff.character.index == 1){
		var a = 1
	}
	buff.overlay = function(releaser,otps) {
		buff.character.ghost = true
		buff.character.died = false
		buff.character.addAnger(8)
	}
	buff.clear = function() {
		// console.log(buff.character.id+"中毒结束")
		buff.character.died = true
	}
	buff.overlay()
	return buff
}
module.exports = model