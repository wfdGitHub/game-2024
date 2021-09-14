//主动伤害技能
var model = function(otps,character) {
	this.type = "attack"
	this.character = character
	this.skillId = otps.skillId							//技能ID
	this.isAnger = false								//是否怒气技能
	this.name = otps.name								//技能名称
	this.damageType = otps.damageType || "phy" 			//伤害类型（目标防御选取）phy 物理伤害 mag 法术伤害
	this.targetType = otps.targetType || "enemy_normal"	//目标类型  normal
	this.mul = otps.mul || 1							//技能系数
	this.skill_buffs = {}								//技能附带buff
	this.skill_anger_s = 0 								//自身怒气恢复值
	this.skill_anger_a = 0 								//全队怒气恢复值
	this.skill_less_anger = 0 							//降低目标怒气值
	this.otps = otps
}
model.prototype.init = function() {
	for(var i = 1;i <= 5;i++){
		if(this.otps["key"+i] && this.otps["value"+i]){
			var key = this.otps["key"+i]
			var value = this.otps["value"+i]
			switch(key){
				case "burn_att_change_skill":
				case "burn_buff_change_skill":
				case "burn_att_change_normal":
				case "burn_buff_change_normal":
					value = JSON.parse(value)
				break
				case "buff1":
					this.addBuff(this.otps.value1)
				break
				case "buff2":
					this.addBuff(this.otps.value2)
				break
				case "buff3":
					this.addBuff(this.otps.value3)
				break
			}
			this[key] = value
		}
	}
	if(this.character.skill_anger_s)
		this.skill_anger_s += this.character.skill_anger_s
	if(this.character.skill_anger_a)
		this.skill_anger_a += this.character.skill_anger_a
	if(this.character.skill_less_anger)
		this.skill_less_anger += this.character.skill_less_anger
	if(this.character.atkcontrol){
		for(var id in this.skill_buffs){
			if(this.skill_buffs[id].buffId == "disarm" || this.skill_buffs[id].buffId == "dizzy" || this.skill_buffs[id].buffId == "silence")
				this.skill_buffs[id].buffRate += this.skill_buffs[id].buffRate * this.character.atkcontrol
		}
	}
}
model.prototype.addBuff = function(buffStr) {
	var buff = JSON.parse(buffStr)
	if(this.character.buffDuration)
		buff.duration += this.character.buffDuration
	this.skill_buffs[buff.buffId] = buff
}
model.prototype.getInfo = function() {
	var info = {
		type : this.type,
		id : this.character.id,
		skillId : this.skillId,
		name : this.name
	}
	return info
}

module.exports = model