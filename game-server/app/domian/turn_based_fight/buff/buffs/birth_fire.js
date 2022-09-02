//浴火重生BUFF
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被锁定!!!!!!")
	var rate = 0.1
	var round = -1
	buff.refresh = function() {
		round++
		if(!buff.character.buffs["jinhun"] && (round >= 5 || (round > 0 && buff.buffManager.seeded.random("恢复回怒") < rate))){
			buff.character.resurgence(1,buff.character)
			return
		}
		rate += 0.1
	}
	return buff
}
module.exports = model