//暴击印记buff
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
	//消耗1层暴击印记
	buff.useBuff = function() {
		for(var i in list){
			delete list[i]
			count--
			break
		}
		if(count <= 0){
			buff.destroy()
		}else{
			var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
			buff.fightRecord.push(recordInfo)
		}
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model