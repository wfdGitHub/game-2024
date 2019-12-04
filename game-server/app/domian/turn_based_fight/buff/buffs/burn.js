//燃烧
var fightRecord = require("../../fight/fightRecord.js")
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var burn = new buffBasic(releaser,character,otps)
	// console.log("角色"+burn.character.id+"被燃烧!!!!!!")
	burn.type = "dot"
	burn.name = "燃烧"
	burn.damage = Math.floor(burn.buffArg * releaser.getTotalAtt("atk"))
	burn.refresh = function() {
		let info = {type : "burnDamage",value : burn.damage ,id : burn.character.id}
		info = burn.character.onHit(burn.releaser,info)
		fightRecord.push(info)
	}
	burn.clear = function() {
		// console.log(burn.character.id+"燃烧结束")
	}
	return burn
}
module.exports = model