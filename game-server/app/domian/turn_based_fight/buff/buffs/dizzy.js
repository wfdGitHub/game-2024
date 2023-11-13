//眩晕
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被眩晕!!!!!!")
	if(buff.releaser.dizzy_add_anger)
		buff.releaser.addAnger(buff.releaser.dizzy_add_anger)
	buff.clear = function() {
		// console.log(buff.character.id+"眩晕结束")
		if(!buff.character.died && buff.releaser.dizzy_less_anger)
			buff.character.lessAnger(buff.releaser.dizzy_less_anger)
	}
	return buff
}
module.exports = model