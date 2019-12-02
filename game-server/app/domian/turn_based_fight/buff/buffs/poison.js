//中毒
var fightRecord = require("../../fight/fightRecord.js")
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var poison = new buffBasic(releaser,character,otps)
	console.log("角色"+poison.character.id+"被中毒!!!!!!")
	poison.name = "中毒"
	poison.damage = Math.floor(poison.buffArg * releaser.getTotalAtt("atk"))
	poison.refresh = function() {
		let info = {type : "poisonDamage",value : poison.damage ,id : poison.character.id}
		info = poison.character.onHit(poison.releaser,info)
		fightRecord.push(info)
	}
	poison.clear = function() {
		console.log(poison.character.id+"中毒结束")
	}
	return poison
}
module.exports = model