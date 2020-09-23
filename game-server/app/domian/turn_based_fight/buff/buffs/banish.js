//放逐
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.debuff = true
	buff.refreshType = "roundOver"
	buff.name = "放逐"
	return buff
}
module.exports = model