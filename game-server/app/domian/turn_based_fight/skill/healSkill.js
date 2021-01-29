//主动治疗技能
var model = function(otps,character) {
	this.type = "heal"
	this.character = character
	this.skillId = otps.skillId						//技能ID
	this.isAnger = false							//是否怒气技能
	this.name = otps.name							//技能名称
	this.healType = otps.healType || "atk" 			//恢复类型（基数） atk  施法者攻击力   hp 被治疗者最大生命值
	this.targetType = otps.targetType || "team_1"	//目标类型  normal
	this.mul = otps.mul || 0						//技能系数
	this.buffId = otps.buffId						//附加buffId
	this.buff_tg = otps.buff_tg || "skill_targets"	//BUFF目标
	this.buffArg = otps.buffArg						//buff参数
	this.duration = otps.duration					//buff持续回合数
	this.buffRate = otps.buffRate					//buff概率
	this.anger_s = otps.anger_s || 0				//自身怒气恢复值
	this.anger_a = otps.anger_a || 0				//全队怒气恢复值
	this.cleanDebuff = otps.cleanDebuff || false	//治疗时净化负面状态
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