//燃烧
var fightRecord = require("../../fight/fightRecord.js")
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被燃烧!!!!!!")
	buff.type = "dot"
	buff.name = "燃烧"
	buff.damage = Math.floor(buff.buffArg * releaser.getTotalAtt("atk"))
	buff.refresh = function() {
		let info = {type : "burnDamage",value : buff.damage ,id : buff.character.id}
		info = buff.character.onHit(buff.releaser,info)
		fightRecord.push(info)
	}
	buff.clear = function() {
		// console.log(buff.character.id+"燃烧结束")
	}
	return buff
}
module.exports = model