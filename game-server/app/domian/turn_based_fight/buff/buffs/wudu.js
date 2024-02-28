//巫毒
var buffBasic = require("../buffBasic.js")
var BASIC_DAMAGE = 0.03
var BASIC_LOWHEAL = 0.15
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var id = 0
	var list = {}
	var count = 0
	var MAX_COUNT = 3
	buff.refresh = function() {
		var info = {type : "poisonDamage",id : buff.character.id,d_type:"mag"}
		info.value = Math.floor(buff.character.getTotalAtt("maxHP") * count * BASIC_DAMAGE)
		var recordInfo = buff.character.onHit(buff.releaser,info)
		buff.fightRecord.push(recordInfo)
		for(var i in list){
			list[i].duration--
			if(list[i].duration <= 0){
				delete list[i]
				count--
			}
		}
		recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.overlay = function(releaser,otps) {
		if(count >= MAX_COUNT)
			return
		var duration = otps.duration
		if(releaser.poison_duration)
			duration += releaser.poison_duration
		if(duration > this.duration)
			this.duration = duration
		list[id++] = {duration : duration}
		count++
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.getValue = function() {
		return BASIC_LOWHEAL * count
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model