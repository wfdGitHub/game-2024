//麻痹
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被麻痹!!!!!!")
	buff.clear = function() {
		// console.log(buff.character.id+"折戟结束")
	}
	return buff
}
module.exports = model