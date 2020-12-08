//超级无敌BUFF 不可清除
var buffBasic = require("../buffBasic.js")
var buffManager = require("../buffManager.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.refreshType = "roundOver"
	buff.name = "无敌(超级)"
	buff.overlay = function(releaser,otps) {
		buff.releaser = releaser
		buff.duration = otps.duration
	}
	buff.clear = function() {
		if(!buff.character.died && buff.character.invincibleSuper_again){
			if(buffManager.seeded.random("超级无敌再生") < buff.character.invincibleSuper_again){
				buff.character.invincibleSuper_again = buff.character.invincibleSuper_again * 0.5
				buffManager.createBuff(buff.character,buff.character,{buffId : buff.buffId,duration : 1})
			}else{
				buff.character.invincibleSuper_again = 0
			}
		}
	}
	return buff
}
module.exports = model