//破浪
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var id = 0
	var list = {}
	var count = 0
	buff.refresh = function() {
		if(buff.character.polang_heal){
			var recordInfo =  buff.character.onHeal(buff.releaser,{type : "heal",maxRate : buff.character.polang_heal*count})
			recordInfo.type = "self_heal"
			buff.fightRecord.push(recordInfo)
		}
		for(var i in list){
			list[i].duration--
			if(list[i].duration <= 0){
				delete list[i]
				count--
			}
		}
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.overlay = function(releaser,otps) {
		for(var i = 0;i < otps.buffArg;i++){
			if(count >= 20)
				break
			this.releaser = releaser
			if(otps.duration > this.duration)
				this.duration = otps.duration
			list[id++] = {duration : otps.duration}
			count++
		}
		if(buff.character.polang_buff && count >= 20){
			buff.buffManager.createBuff(buff.character,buff.character,{"buffId":buff.character.polang_buff})
			delete buff.character.polang_buff
		}
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.getValue = function() {
		return count
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model