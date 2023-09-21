//恢复
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"恢复!!!!!!")
	buff.value = Math.floor(buff.buffArg * releaser.getTotalAtt("atk"))
	buff.refresh = function() {
		if(buff.character.died)
			return
		var info = {type : "recoverHeal",value : buff.value}
		info = buff.character.onHeal(buff.releaser,info)
		buff.fightRecord.push(info)
		if(!buff.releaser.died && buff.releaser.recover_anger){
			if(buff.buffManager.seeded.random("恢复回怒") < buff.releaser.recover_anger)
				buff.releaser.addAnger(1)
		}
	}
	buff.overlay = function(releaser,otps) {
		buff.releaser = releaser
		if(buff.releaser.recover_settle && buff.duration){
			var info = {type : "recoverHeal",value : buff.value * buff.duration}
			info = buff.character.onHeal(buff.releaser,info)
			buff.fightRecord.push(info)
		}
		buff.buffArg = otps.buffArg
		buff.duration = otps.duration
		buff.value = Math.floor(buff.buffArg * buff.releaser.getTotalAtt("atk"))
	}
	buff.clear = function() {
		if(!buff.character.died && buff.releaser.recover_maxHp && buff.releaser.realm == buff.character.realm){
			var recordInfo =  buff.character.onHeal(buff.releaser,{type : "heal",maxRate : buff.releaser.recover_maxHp})
			recordInfo.type = "self_heal"
			buff.fightRecord.push(recordInfo)
		}
	}
	return buff
}
module.exports = model