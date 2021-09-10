//伤害减免
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.value = 0.08
	return buff
}
module.exports = model