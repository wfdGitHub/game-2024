//闪避buff 精灵祝福
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被锁定!!!!!!")
	buff.getValue = function() {
		return 0.5
	}
	return buff
}
module.exports = model