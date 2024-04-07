//通用BUFF
var buffBasic = require("./buffBasic.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var id = 0
	var count = 0
	buff.value = otps.value || 0
	buff.mul = otps.mul || 0
	var max = buff_cfg[buff.buffId]["max"]
	buff.refresh = function() {
		for(var i in buff.list){
			buff.list[i].duration--
			if(buff.list[i].duration <= 0){
				delete buff.list[i]
				count--
			}
		}
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.overlay = function(releaser,otps) {
		if(buff_cfg[buff.buffId]["fury"])
			buff.character.removeDeBuff()
		otps.buffArg = otps.buffArg || 1
		for(var i = 0;i < otps.buffArg;i++){
			if(count >= max)
				break
			this.releaser = releaser
			if(otps.duration > this.duration)
				this.duration = otps.duration
			buff.list[id++] = {duration : otps.duration}
			count++
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