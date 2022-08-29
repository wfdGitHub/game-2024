//狩猎印记
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.refresh = function() {
		if(buff.releaser.died || buff.character.died)
			return
		if(buff.releaser.getTotalAtt("speed") > buff.character.getTotalAtt("speed"))
			buff.releaser.fighting.skillManager.useSkill(buff.releaser.defaultSkill,true,buff.character)
	}
	return buff
}
module.exports = model