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
		if(buff.releaser.invincibleHeal && buff.releaser.realm == buff.character.realm){
			var tmpRecord = {type : "other_heal",targets : []}
			var value = Math.floor(buff.releaser.invincibleHeal * buff.character.attInfo.maxHP)
			var info = buff.character.onHeal(buff.releaser,{value : value})
			tmpRecord.targets.push(info)
			fightRecord.push(tmpRecord)
		}
	}
	return buff
}
module.exports = model