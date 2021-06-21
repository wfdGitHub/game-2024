//恢复
var fightRecord = require("../../fight/fightRecord.js")
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"恢复!!!!!!")
	buff.refreshType = "before"
	buff.intensify = true
	buff.name = "恢复"
	buff.value = Math.floor(buff.buffArg * releaser.getTotalAtt("atk"))
	buff.refresh = function() {
		if(buff.character.died)
			return
		var info = {type : "recoverHeal",value : buff.value}
		info = buff.character.onHeal(buff.releaser,info)
		fightRecord.push(info)
		if(!buff.releaser.died && buff.releaser.recover_anger){
			if(buffManager.seeded.random("恢复回怒") < buff.releaser.recover_anger)
				buff.releaser.addAnger(1)
		}
	}
	buff.clear = function() {
		if(!buff.character.died && buff.releaser.recover_maxHp && buff.releaser.realm == buff.character.realm){
			var recordInfo =  buff.character.onHeal(buff.releaser,{type : "heal",maxRate : buff.releaser.recover_maxHp})
			recordInfo.type = "self_heal"
			fightRecord.push(recordInfo)
		}
	}
	return buff
}
module.exports = model