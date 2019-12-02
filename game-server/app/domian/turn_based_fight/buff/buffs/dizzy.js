//眩晕
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var dizzy = new buffBasic(releaser,character,otps)
	console.log("角色"+dizzy.character.id+"被眩晕!!!!!!")
	dizzy.name = "眩晕"
	dizzy.character.dizzy = true
	dizzy.clear = function() {
		console.log(dizzy.character.id+"眩晕结束")
		dizzy.character.dizzy = false
	}
	return dizzy
}
module.exports = model