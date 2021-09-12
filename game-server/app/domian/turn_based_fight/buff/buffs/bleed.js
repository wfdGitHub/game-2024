//流血buff
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var id = 0
	var list = {}
	var count = 0
	buff.refresh = function() {
		var info = {type : "other_damage",id : buff.character.id,d_type:"phy"}
		info.value = Math.floor(buff.character.attInfo.maxHP * count * 0.02)
		var recordInfo = buff.character.onHit(buff.releaser,info)
		buff.fightRecord.push(recordInfo)
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
			if(count >= 5)
				break
			this.releaser = releaser
			if(otps.duration > this.duration)
				this.duration = otps.duration
			list[id++] = {duration : otps.duration}
			count++
		}
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model