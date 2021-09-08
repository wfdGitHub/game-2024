//寒冷buff
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
		this.releaser = releaser
		if(otps.duration > this.duration)
			this.duration = otps.duration
		list[id++] = {duration : otps.duration}
		count++
		if(count >= 3){
			buff.destroy()
			buff.buffManager.createBuff(buff.releaser,buff.character,{buffId : "frozen",duration : 2})
		}
	}
	buff.getValue = function() {
		return Math.floor(this.character.attInfo.speed * count * -0.05)
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model