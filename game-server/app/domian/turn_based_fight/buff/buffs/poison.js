//中毒
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var id = 0
	var list = {}
	var count = 0
	buff.refresh = function() {
		var info = {type : "poisonDamage",id : buff.character.id,d_type:"mag"}
		info.value = Math.floor(buff.releaser.getTotalAtt("atk") * count * 0.6)
		var recordInfo = buff.character.onHit(buff.releaser,info)
		buff.fightRecord.push(recordInfo)
		for(var i in list){
			list[i].duration--
			if(list[i].duration <= 0){
				delete list[i]
				count--
			}
		}
		if(buff.releaser.poison_change_hp){
			var value = Math.ceil(recordInfo.realValue * buff.releaser.poison_change_hp)
			recordInfo = {type : "other_heal",targets : []}
			recordInfo.targets.push(buff.releaser.onHeal(buff.releaser,{value : value}))
			buff.fightRecord.push(recordInfo)
		}
		recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
	}
	buff.overlay = function(releaser,otps) {
		for(var i = 0;i < otps.buffArg;i++){
			if(count >= 3)
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
	buff.clear = function() {
		// console.log(buff.character.id+"中毒结束")
		if(buff.releaser.poison_clean_damage){
			buff.fightRecord.push({type:"show_tag",id:buff.character.id,tag:"poison_clean_damage"})
			var info = {type : "poisonDamage",id : buff.character.id,d_type:"mag"}
			info.value = Math.floor(buff.character.attInfo.maxHP * buff.releaser.poison_clean_damage)
			info = buff.character.onHit(buff.releaser,info)
			buff.fightRecord.push(info)
		}
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model