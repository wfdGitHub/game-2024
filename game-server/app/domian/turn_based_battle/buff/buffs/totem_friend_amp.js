//弹奏百鸟朝风。弹奏期间，自身无法行动，增加友方除自己外全体侠客伤害增加，同时自身免疫控制 (眩晕、石化、冰冻、魅惑、沉默、束缚)，但无法恢复怒气，受到的普攻伤害翻倍
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.r_value = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//为友方添加增伤BUFF
model.prototype.buffOtps = function(attacker,info) {
	var targets = this.fighting.locator.getTargets(this.character,"team_friend")
	for(var i = 0;i < targets.length;i++)
		this.fighting.buffManager.createBuff(attacker,targets[i],{"buffId":"totem_amp","value":info.buff.value,"duration":info.buff.duration})
	if(this.character.talents.totem_friend_att){
		var friend = this.fighting.locator.getTargets(this.character,"team_maxAtk_1")[0]
		if(friend){
			this.fighting.buffManager.createBuff(attacker,targets[0],{"buffId":"atk_up_always","mul":this.character.talents.totem_friend_att,"duration":info.buff.duration})
			this.fighting.buffManager.createBuff(attacker,attacker,{"buffId":"atk_up_always","mul":-this.character.talents.totem_friend_att,"duration":info.buff.duration})
			this.fighting.buffManager.createBuff(attacker,targets[0],{"buffId":"armor_up_always","mul":this.character.talents.totem_friend_att,"duration":info.buff.duration})
			this.fighting.buffManager.createBuff(attacker,attacker,{"buffId":"armor_up_always","mul":-this.character.talents.totem_friend_att,"duration":info.buff.duration})
		}
	}
}
//死亡后取消友方BUFF
model.prototype.bufflLater = function() {
	//弹奏结束后,造成自身当前血量一定比例等量的真实伤害,由敌方全体共同分担;
	if(this.character.checkAim() && this.character.talents.totem_friend_mul){
		var damage = this.character.getTotalAtt("hp")
		var targets = this.fighting.locator.getTargets(this.character,"enemy_all")
		damage = Math.floor(damage / targets.length)
		for(var i = 0;i < targets.length;i++){
			var info = targets[i].onOtherDamage(this.character,damage)
			if(this.character.talents.totem_friend_dizzy && targets[i].checkAim() && info.realValue > (targets[i].getTotalAtt("maxHP") * 0.28) && this.fighting.randomCheck(this.character.talents.totem_friend_dizzy))
				this.fighting.buffManager.createBuff(this.character,targets[i],{"buffId":"dizzy","duration":1})
		}
	}
}
//开始行动
model.prototype.onAtion = function() {
	this.r_value++
	//弹奏状态下第1回合触发,使友方全体回怒25点
	if(this.r_value == 1 && this.character.talents["totem_friend_r1"]){
		var targets = this.fighting.locator.getTargets(this.character,"team_all")
		for(var i = 0;i < targets.length;i++)
			targets[i].addAnger(25,true)
	}
	//弹奏状态下第2回合触发,使友方全体恢复血量上限10%的血量,并清除1层负面状态
	if(this.r_value == 2 && this.character.talents["totem_friend_r2"]){
		var targets = this.fighting.locator.getTargets(this.character,"team_all")
		for(var i = 0;i < targets.length;i++){
			targets[i].onOtherHeal(this.character,targets[i].getTotalAtt("maxHP") * 0.1)
			targets[i].dispelLessBuff()
		}
	}
	//弹奏状态下第3回合触发,使敌方全体护甲降低40%,持续1回合
	if(this.r_value == 3 && this.character.talents["totem_friend_r3"]){
		var targets = this.fighting.locator.getTargets(this.character,"enemy_all")
		for(var i = 0;i < targets.length;i++)
			this.fighting.buffManager.createBuff(this.character,targets[i],{"buffId":"armor_down","mul":-0.4,"duration":1})
	}
}
module.exports = model