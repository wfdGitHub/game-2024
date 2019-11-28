//主动治疗技能
var model = function(otps,character) {
	this.type = "heal"
	this.character = character
	this.skillId = otps.skillId						//技能ID
	this.name = otps.name							//技能名称
	this.healType = otps.healType || "atk" 			//恢复类型（基数） atk  施法者攻击力   hp 被治疗者最大生命值
	this.targetType = otps.targetType || "normal"	//目标类型  normal
	this.mul = otps.mul || 1						//技能系数
}

module.exports = model