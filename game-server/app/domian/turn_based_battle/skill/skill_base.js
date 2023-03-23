//技能基类 伤害  治疗  BUFF
var buff_base = require("./buff_base.js")
var model = function(character,otps,talentList) {
	otps = otps || {}
	this.character = character
	this.sid = otps.sid || 0 		//技能ID
	this.lv = otps.lv || 1 			//技能等级
	this.isAnger = false  			//是否为怒气技能
	this.damageType = "phy" 		//phy  物伤  mag  法伤   real  真伤
	//伤害参数
	this.atk_count = otps["atk_count"] || 1
	this.atk_mul = otps["atk_mul"] || 0
	this.atk_value = otps["atk_value"] || 0
	this.atk_aim = otps["atk_aim"] || 0
	//治疗参数
	this.heal_mul = otps["heal_mul"] || 0
	this.heal_value = otps["heal_value"] || 0
	this.heal_aim = otps["heal_aim"] || 0
	this.buffs = {}
	this.buffs["mag_damage"] = new buff_base(JSON.stringify({buffId : "mag_damage","mul" : 0.3,"value":1000,"rate" : 0.5,"targetType":"skill_targets","duration":2}))
	this.talents = {
		"hp_to_damage" : 0.3,
		"hp_low_count" : 0.2
	}
	this.tmpCount = 0
	this.tmpDamage = 0
}
//技能初始化
model.prototype.init = function() {}
//使用技能前
model.prototype.before = function() {
	//释放技能时消耗生命值为临时伤害
	if(this.talents.hp_to_damage){
		var info = this.character.onOtherDamage(this,this.character.getTotalAtt("hp") * 0.3)
		this.tmpDamage += info.realValue
	}
	//自身每损失一定血量，增加一段伤害
	if(this.talents.hp_low_count)
		this.tmpCount +=  Math.max(0,Math.floor((1 - this.character.getTotalAtt("hp") / this.character.getTotalAtt("maxHP")) / this.talents.hp_low_count))
}
//使用技能后
model.prototype.after = function() {
	this.tmpDamage = 0
	this.tmpCount = 0
}
module.exports = model