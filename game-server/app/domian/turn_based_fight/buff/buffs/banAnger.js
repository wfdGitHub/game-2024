//压制buff  无法回怒
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被压制!!!!!!")
	buff.character.banAnger = true
	buff.clear = function() {
		// console.log(buff.character.id+"压制结束")
		buff.character.banAnger = false
	}
	return buff
}
module.exports = model