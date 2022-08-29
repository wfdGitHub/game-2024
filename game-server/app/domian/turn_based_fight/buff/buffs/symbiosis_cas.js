//共生（施法者） releaser为目标
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	//共生对象不能是自身
	// if(releaser == character)
	// 	return
	var buff = new buffBasic(releaser,character,otps)
	var heal_value = Math.floor(character.getTotalAtt("maxHP") * 0.1)
	buff.refresh = function() {
		if(buff.releaser.died || buff.character.died)
			return
		recordInfo = {type : "other_heal",targets : []}
		recordInfo.targets.push(buff.releaser.onHeal(buff.character,{value : heal_value}))
		buff.fightRecord.push(recordInfo)
	}
	buff.buffManager.createBuff(buff.character,buff.releaser,{buffId : "symbiosis_rec",duration : -1})
	return buff
}
module.exports = model