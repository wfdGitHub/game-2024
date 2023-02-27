//中毒
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	var id = 0
	var list = {}
	var count = 0
	var poison_clean_damage = 0
	var MAX_COUNT = 5
	var BASIC_DAMAGE = 0.03
	var BASIC_LOWHEAL = 0.12
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
			if(count >= MAX_COUNT)
				break
			var duration = otps.duration
			if(releaser.poison_duration)
				duration += releaser.poison_duration
			if(duration > this.duration)
				this.duration = duration
			list[id++] = {duration : duration}
			count++
			if(this.releaser.poison_clean_damage){
				this.releaser = releaser
				poison_clean_damage = this.releaser.poison_clean_damage
			}
			if(this.releaser.poison_change_hp)
				this.releaser = releaser
		}
		var recordInfo = {type : "buff_num",id : buff.character.id,buffId : buff.buffId,num : count}
		buff.fightRecord.push(recordInfo)
		if(releaser.poison_settle && buff.buffManager.seeded.random("中毒结算") < releaser.poison_settle){
			buff.settle()
		}
	}
	//立即结算
	buff.settle = function() {
		var num = 0
		for(var i in list){
			num += list[i].duration
		}
		var info = {type : "poisonDamage",id : buff.character.id,d_type:"mag"}
		info.value = Math.floor(buff.character.attInfo.maxHP * num * BASIC_DAMAGE)
		var recordInfo = buff.character.onHit(buff.releaser,info)
		buff.fightRecord.push(recordInfo)
		this.destroy()
	}
	buff.clear = function() {
		if(poison_clean_damage && !buff.character.died){
			buff.fightRecord.push({type:"show_tag",id:buff.character.id,tag:"poison_clean_damage"})
			var info = {type : "poisonDamage",id : buff.character.id,d_type:"mag"}
			info.value = Math.floor(buff.character.attInfo.maxHP * poison_clean_damage)
			info = buff.character.onHit(buff.releaser,info)
			buff.fightRecord.push(info)
		}
	}
	buff.getValue = function() {
		return (1 - (count * BASIC_LOWHEAL))
	}
	buff.overlay(releaser,otps)
	return buff
}
module.exports = model