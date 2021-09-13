//炙热光环
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps,fighting) {
	var buff = new buffBasic(releaser,character,otps)
	// console.log("角色"+buff.character.id+"被燃烧!!!!!!")
	buff.damage = Math.floor(buff.buffArg * (releaser.getTotalAtt("atk") - character.getTotalAtt("magDef")))
	if(releaser.burn_duration)
		buff.duration += releaser.burn_duration
	buff.refresh = function() {
		if(buff.character.died)
			return
		var info = {type : "heat_halo_damage",targets : []}
		var targets = fighting.locator.getTargets(buff.character,"team_adjoin")
		for(var i = 0;i < targets.length;i++){
			if(!targets[i].died){
				info.targets.push(targets[i].onHit(buff.releaser,{type : "burnDamage",value : buff.damage,d_type:"mag"}))
				if(buff.releaser.heat_halo_burn)
					buff.buffManager.createBuff(buff.releaser,targets[i],{"buffId":"burn","buffArg":0.2,"duration":2})
				if(buff.releaser.heat_halo_less)
					targets[i].lessAnger(1)
			}
		}
		buff.fightRecord.push(info)
	}
	buff.clear = function() {
		// console.log(buff.character.id+"燃烧结束")
	}
	return buff
}
module.exports = model