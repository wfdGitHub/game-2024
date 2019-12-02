//禁疗
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var forbidden = new buffBasic(releaser,character,otps)
	console.log("角色"+forbidden.character.id+"被禁疗!!!!!!")
	forbidden.name = "禁疗"
	forbidden.character.forbidden = true
	forbidden.clear = function() {
		console.log(forbidden.character.id+"禁疗结束")
		forbidden.character.forbidden = false
	}
	return forbidden
}
module.exports = model