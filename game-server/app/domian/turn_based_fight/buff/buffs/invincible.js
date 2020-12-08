//无敌BUFF低配版  可清除
var buffBasic = require("../buffBasic.js")
var fightRecord = require("../../fight/fightRecord.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.refreshType = "before_2"
	buff.name = "无敌"
	if(buff.releaser.invincibleAnger)
		buff.character.addAnger(buff.releaser.invincibleAnger)
	buff.overlay = function(releaser,otps) {
		buff.releaser = releaser
		buff.duration = otps.duration
		if(buff.releaser.invincibleAnger)
			buff.character.addAnger(buff.releaser.invincibleAnger)
	}
	buff.clear = function() {
		// console.log(buff.buff.character.id+"眩晕结束")
		if(!buff.character.died && buff.releaser.invincibleHeal && buff.releaser.realm == buff.character.realm){
			var recordInfo =  buff.character.onHeal(buff.releaser,{type : "heal",value : buff.character.getTotalAtt("maxHP") * buff.releaser.invincibleHeal})
			recordInfo.type = "self_heal"
			fightRecord.push(recordInfo)
		}
	}
	return buff
}
module.exports = model