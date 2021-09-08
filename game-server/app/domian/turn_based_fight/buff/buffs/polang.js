//破浪
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
				delete list[i]
				count--
			}
		}
		var info = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(info)
	}
	buff.overlay = function(releaser,otps) {
		if(otps.duration > this.duration)
			this.duration = otps.duration
		for(var i = 0;i < otps.buffArg;i++){
			if(count >= 20)
				break
			list[id++] = {duration : otps.duration}
			count++
		}
	}
	buff.getValue = function() {
		return count * 0.05
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model