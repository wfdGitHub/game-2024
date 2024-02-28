//巫术
var buffBasic = require("../buffBasic.js")
var BASIC_DAMAGE = 0.03
var BASIC_LOWHEAL = 0.15
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.damage = Math.floor(BASIC_DAMAGE * buff.character.getTotalAtt("maxHP"))
	buff.refresh = function() {
		if(buff.character.died)
			return
		var info = {type : "poisonDamage",value : buff.damage ,id : buff.character.id,d_type:"mag"}
		info = buff.character.onHit(buff.releaser,info)
		buff.fightRecord.push(info)
	}
	buff.clear = function() {
		// console.log(buff.character.id+"燃烧结束")
	}
	buff.getValue = function() {
		return BASIC_LOWHEAL
	}
	return buff
}
module.exports = model