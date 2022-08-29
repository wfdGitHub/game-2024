//共生（接收者）
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var maxHP = Math.floor(releaser.getTotalAtt("maxHP") * 0.25)
	var phyDef = Math.floor(releaser.getTotalAtt("phyDef") * 0.25)
	var magDef = Math.floor(releaser.getTotalAtt("magDef") * 0.25)
	character.addAtt("maxHP",maxHP)
	character.addAtt("hp",maxHP)
	character.addAtt("phyDef",phyDef)
	character.addAtt("magDef",magDef)
	return buff
}
module.exports = model