//技能基类 伤害  治疗  BUFF
var model = function(character,otps,talentList) {
	otps = otps || {}
	this.character = character
	this.sid = otps.sid 			//技能ID
	this.isAnger = false  			//是否为怒气技能
	this.damageType = "phy" 		//phy  物伤  mag  法伤   real  真伤
	//伤害参数
	this.atk_mul = otps["atk_mul"] || 0
	this.atk_value = otps["atk_value"] || 0
	this.atk_aim = otps["atk_aim"] || 0
	//治疗参数
	this.heal_mul = otps["heal_mul"] || 0
	this.heal_value = otps["heal_value"] || 0
	this.heal_aim = otps["heal_aim"] || 0
	this.buffs = []
}
//技能初始化
model.prototype.init = function() {}
//使用技能前
model.prototype.before = function() {}
//使用技能后
model.prototype.after = function() {}
module.exports = model