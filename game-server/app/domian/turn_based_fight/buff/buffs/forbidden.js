//禁疗
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被禁疗!!!!!!")
	buff.name = "禁疗"
	buff.character.forbidden = true
	buff.clear = function() {
		// console.log(buff.character.id+"禁疗结束")
		buff.character.forbidden = false
	}
	return buff
}
module.exports = model