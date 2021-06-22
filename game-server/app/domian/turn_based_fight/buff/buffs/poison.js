//中毒
var fightRecord = require("../../fight/fightRecord.js")
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.debuff = true
	// console.log("角色"+buff.character.id+"被中毒!!!!!!")
	buff.refreshType = "before"
	buff.name = "中毒"
	buff.damage = Math.floor(buff.buffArg * (releaser.getTotalAtt("atk") - character.getTotalAtt("magDef")))
	if(releaser.poison_duration)
		buff.duration += releaser.poison_duration
	buff.refresh = function() {
		if(buff.character.died)
			return
		var info = {type : "poisonDamage",value : buff.damage ,id : buff.character.id,d_type:"mag"}
		info = buff.character.onHit(buff.releaser,info)
		fightRecord.push(info)
		if(releaser.poison_change_hp){
			var value = Math.ceil(info.realValue * releaser.poison_change_hp)
			info = {type : "other_heal",targets : []}
			info.targets.push(releaser.onHeal(releaser,{value : value},buff))
			fightRecord.push(info)
		}
	}
	buff.clear = function() {
		// console.log(buff.character.id+"中毒结束")
		if(buff.releaser.poison_clean_damage){
			fightRecord.push({type:"show_tag",id:this.id,tag:"poison_clean_damage"})
			var info = {type : "poisonDamage",id : buff.character.id,d_type:"mag"}
			info.value = Math.floor(buff.character.attInfo.maxHP * buff.releaser.poison_clean_damage)
			info = buff.character.onHit(buff.releaser,info)
			fightRecord.push(info)
		}
	}
	return buff
}
module.exports = model