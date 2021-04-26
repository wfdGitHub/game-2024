//伤害减免
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.name = "伤害减免"
	buff.refreshType = "roundOver"
	buff.value = otps.buffArg
	return buff
}
module.exports = model