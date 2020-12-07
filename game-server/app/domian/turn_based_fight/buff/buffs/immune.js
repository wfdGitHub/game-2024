//免控盾
var buffBasic = require("../buffBasic.js")
var fightRecord = require("../../fight/fightRecord.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.name = "免控盾"
	if(otps.refreshType)
		buff.refreshType = otps.refreshType
	else
		buff.refreshType = "before_2"
	return buff
}
module.exports = model