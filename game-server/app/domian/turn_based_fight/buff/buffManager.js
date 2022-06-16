var buffList = {}
var fightRecord = require("../fight/fightRecord.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
var buffFactory = function() {}
buffFactory.init = function(seeded,fighting) {
	for(var buffId in buff_cfg){
		buffList[buffId] = require("./buffs/"+buffId+".js")
	}
	this.seeded = seeded
	this.fighting = fighting
}
//创建BUFF
buffFactory.createBuff = function(releaser,character,otps) {
	var buffId = otps.buffId
	if(!buff_cfg[buffId]){
		console.error("buff 不存在 ",buffId)
		return
	}
	//亡魂不状态不可释放BUFF
	if(buffId != "ghost" && character.ghost)
		return
	//判断控制buff抗性
	if(buff_cfg[buffId].control){
		if(character.control_buff_lowrate && this.seeded.random("控制buff抗性") < character.control_buff_lowrate)
			return
		if(character.buffs["invincibleSuper"])
			return
		if(character.buffs["immune"])
			return
		if(character.always_immune)
			return
		if(character.defcontrol && this.seeded.random("免控饰品") < character.defcontrol)
			return
	}
	//判断灼烧、中毒buff抗性
	if(buff_cfg[buffId].hurt && character.damage_buff_lowrate && this.seeded.random("伤害buff抗性") < character.damage_buff_lowrate)
		return
	if((buffId == "invincible" || buffId == "invincibleSuck") && character.buffs["burn"] && character.buffs["burn"].releaser.burn_not_invincible)
		return
	if(buff_cfg[buffId].debuff && character.loss_hp_debuff && buffId != "banish"){
		if((character.attInfo.hp / character.attInfo.maxHP) > character.loss_hp_debuff){
			fightRecord.push({type:"show_tag",id:character.id,tag:"loss_hp_debuff"})
			var info = {type : "other_damage",value : Math.floor(character.attInfo.maxHP *  character.loss_hp_debuff),id : character.id,d_type:"phy"}
			info = character.onHit(character,info)
			fightRecord.push(info)
			return
		}
	}
	//判断伤害buff伤害降低
	if(buff_cfg[buffId].hurt && character.damage_buff_lowArg){
		otps.buffArg = otps.buffArg * (1 - character.damage_buff_lowArg)
	}
	if(buffList[buffId]){
		fightRecord.push({type : "createBuff",releaser : releaser.id,character : character.id,buffId : buffId,name : buff_cfg[buffId].name})
		var buff
		if(character.buffs[buffId]){
			buff = character.buffs[buffId]
			buff.overlay(releaser,otps)
		}else{
			buff = new buffList[buffId](releaser,character,otps,this.fighting)
			buff.name = buff_cfg[buffId].name
			character.addBuff(releaser,buff)
		}
		if(buffId == "poison" && releaser.poison_add_forbidden){
			this.createBuff(releaser,character,{"buffId" : "forbidden","duration":1})
		}
		if(buffId == "banAnger" && releaser.banAnger_add_forbidden){
			this.createBuff(releaser,character,{"buffId" : "forbidden","duration":1})
		}
		if(buffId == "dizzy" && releaser.dizzy_clear_anger){
			fightRecord.push({type:"show_tag",id:character.id,tag:"dizzy_clear_anger"})
			character.lessAnger(character.curAnger)
		}
	}else{
		console.error("buffId 不存在",buffId)
		return false
	}
}
module.exports = buffFactory