//眩晕
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被眩晕!!!!!!")
	buff.name = "眩晕"
    buff.damageType = "control"
	buff.character.dizzy = true
	buff.clear = function() {
		// console.log(buff.character.id+"眩晕结束")
		buff.character.dizzy = false
	}
	return buff
}
module.exports = model