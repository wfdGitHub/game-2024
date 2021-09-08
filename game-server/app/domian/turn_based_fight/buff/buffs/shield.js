//伤害吸收盾
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被沉默!!!!!!")
    if(otps.number)
    	buff.value = Math.floor(otps.buffArg)
    else
    	buff.value = Math.floor(otps.buffArg * buff.character.getTotalAtt("maxHP"))
	buff.overlay = function(releaser,otps) {
		buff.releaser = releaser
		buff.duration = otps.duration
		if(otps.number)
			buff.value += Math.floor(otps.buffArg)
		else
			buff.value += Math.floor(otps.buffArg * buff.character.getTotalAtt("maxHP"))
	}
	//抵消伤害
	buff.offset = function(value) {
		buff.value -= value
		if(buff.value <= 0){
			buff.destroy()
			return -buff.value
		}else{
			return 0
		}
	}
	return buff
}
module.exports = model