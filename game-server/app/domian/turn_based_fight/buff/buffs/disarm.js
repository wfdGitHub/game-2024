//麻痹
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var disarm = new buffBasic(releaser,character,otps)
	console.log("角色"+disarm.character.id+"被麻痹!!!!!!")
	disarm.name = "麻痹"
	disarm.character.disarm = true
	disarm.clear = function() {
		console.log(disarm.character.id+"麻痹结束")
		disarm.character.disarm = false
	}
	return disarm
}
module.exports = model