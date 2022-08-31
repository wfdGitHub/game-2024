//吸取攻击
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.overlay = function(releaser,otps) {
		var value = Math.floor(buff.character.getTotalAtt("atk") * otps.buffArg)
		buff.character.addAtt("atk",-value)
		releaser.addAtt("atk",value)
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model