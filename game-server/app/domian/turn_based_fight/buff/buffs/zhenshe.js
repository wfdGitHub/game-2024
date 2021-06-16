//震慑BUFF
var buffBasic = require("../buffBasic.js")
var fightRecord = require("../../fight/fightRecord.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被震慑!!!!!!")
	buff.debuff = true
	buff.name = "震慑"
    buff.refreshType = "after"
	buff.refresh = function() {
		let info = {type : "other_damage",id : buff.character.id,d_type:"mag"}
		if(buff.character.isBoss)
			info.value = Math.floor(buff.character.attInfo.maxHP * 0.1)
		else
			info.value = Math.floor(buff.character.attInfo.hp * 0.1)
		info = buff.character.onHit(buff.releaser,info)
		fightRecord.push(info)
	}
	return buff
}
module.exports = model