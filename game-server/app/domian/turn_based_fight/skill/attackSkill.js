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
	this.anger_s = otps.anger_s || 0					//自身怒气恢复值
	this.anger_a = otps.anger_a || 0					//全队怒气恢复值
	this.turn_rate = otps.turn_rate || 0				//伤害转生命值比例
	this.turn_tg = otps.turn_tg || 0					//伤害转生命值目标类型
	this.add_d_s = otps.add_d_s							//追加一次普通攻击(默认技能)
	this.thr_anger = otps.thr_anger						//若攻击目标大于三人则增加两点怒气
	this.buffId = otps.buffId							//附加buffId
	this.buffArg = otps.buffArg							//buff参数
	this.duration = otps.duration						//buff持续回合数
	this.buffRate = otps.buffRate						//buff概率
	this.lessAmp = otps.lessAmp 						//目标每减少一个伤害加成比例
	this.premise = otps.premise							//先决条件
	this.effect = otps.effect							//效果
}
module.exports = model