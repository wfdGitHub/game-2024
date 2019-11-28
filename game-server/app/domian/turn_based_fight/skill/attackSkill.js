//主动伤害技能
var model = function(otps,character) {
	this.type = "attack"
	this.character = character
	this.skillId = otps.skillId						//技能ID
	this.name = otps.name							//技能名称
	this.damageType = otps.damageType || "phy" 		//伤害类型（目标防御选取）phy 物理伤害 mag 法术伤害
	this.targetType = otps.targetType || "enemy_normal"	//目标类型  normal
	this.mul = otps.mul || 1						//技能系数
}
module.exports = model