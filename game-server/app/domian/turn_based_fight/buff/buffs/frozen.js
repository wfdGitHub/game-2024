//冰冻
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被眩晕!!!!!!")
	if(releaser.frozen_anger)
		releaser.addAnger(releaser.frozen_anger)
	var count = 3
	buff.overlay = function(releaser,otps) {
		this.releaser = releaser
		if(otps.duration > this.duration)
			this.duration = otps.duration
		count = 3
	}
	buff.onHit = function() {
		count--
		if(count <= 0){
			buff.destroy()
		}
	}
	return buff
}
module.exports = model