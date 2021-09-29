//诅咒
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var id = 0
	var list = {}
	var count = 0
	buff.refresh = function() {
		for(var i in list){
			list[i].duration--
			if(list[i].duration <= 0){
				var recordInfo = buff.character.onHit(list[i].releaser,{type : "other_damage",id : buff.character.id,d_type:"mag",value:list[i].value})
				buff.fightRecord.push(recordInfo)
				delete list[i]
				count--
			}
		}
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.overlay = function(releaser,otps) {
		if(count >= 5)
			return
		if(otps.duration > this.duration)
			this.duration = otps.duration
		var amp = 1
		if(releaser.curse_amp)
			amp += releaser.curse_amp
		list[id++] = {releaser : releaser,value : Math.floor((releaser.getTotalAtt("atk") - buff.character.getTotalAtt("magDef")) * amp),duration : otps.duration}
		count++
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	//立即结算
	buff.settle = function() {
		for(var i in list){
			var recordInfo = buff.character.onHit(list[i].releaser,{type : "other_damage",id : buff.character.id,d_type:"mag",value:list[i].value})
			buff.fightRecord.push(recordInfo)
		}
		this.destroy()
	}
	buff.getValue = function() {
		return count
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model