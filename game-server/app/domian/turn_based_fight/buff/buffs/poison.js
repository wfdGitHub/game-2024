//中毒
var fightRecord = require("../../fight/fightRecord.js")
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被中毒!!!!!!")
	buff.damageType = "dot"
	buff.name = "中毒"
	buff.damage = Math.floor(buff.buffArg * releaser.getTotalAtt("atk"))
	buff.refresh = function() {
		let info = {type : "poisonDamage",value : buff.damage ,id : buff.character.id}
		info = buff.character.onHit(buff.releaser,info)
		fightRecord.push(info)
	}
	buff.clear = function() {
		// console.log(buff.character.id+"中毒结束")
	}
	return buff
}
module.exports = model