//主动伤害技能
var model = function(otps,character) {
	this.otps = otps
	this.character = character
	this.skillId = otps.skillId							//技能ID
	this.isAnger = false								//是否怒气技能
	this.name = otps.name								//技能名称
	this.damageType = otps.damageType || "phy" 			//伤害类型（目标防御选取）phy 物理伤害 mag 法术伤害
	this.targetType = otps.targetType || "enemy_normal"	//目标类型  normal
	this.mul = otps.mul || 1							//技能系数
	this.skill_buffs = {}								//技能附带buff
	//初始化参数
	this.initArg = function() {}
	//使用技能结束
	this.useSkillOver = function() {}
	//击杀目标后
	this.onKill = function() {}
	//添加BUFF
	this.addBuff = function(buffStr) {
		var buff = JSON.parse(buffStr)
		if(this.character.buffDuration)
			buff.duration += this.character.buffDuration
		this.skill_buffs[buff.buffId] = buff
	}
	//获取信息
	this.getInfo = function() {
		var info = {
			type : this.type,
			id : this.character.id,
			skillId : this.skillId,
			name : this.name,
			isAnger : this.isAnger
		}
		return info
	}
}
module.exports = model