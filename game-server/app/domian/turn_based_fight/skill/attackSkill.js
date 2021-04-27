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
	this.skill_anger_s = otps.skill_anger_s || 0		//自身怒气恢复值
	this.skill_anger_a = otps.skill_anger_a || 0		//全队怒气恢复值
	this.skill_less_anger = otps.skill_less_anger || 0	//降低目标怒气值
	if(character.skill_anger_s)
		this.skill_anger_s += character.skill_anger_s
	if(character.skill_anger_a)
		this.skill_anger_a += character.skill_anger_a
	if(character.skill_less_anger)
		this.skill_less_anger += character.skill_less_anger
	this.turn_rate = otps.turn_rate || 0				//伤害转生命值比例
	this.turn_tg = otps.turn_tg || 0					//伤害转生命值目标类型
	this.add_d_s = otps.add_d_s							//追加一次普通攻击(默认技能)
	this.thr_anger = otps.thr_anger						//若攻击目标大于三人则增加两点怒气
	this.buffId = otps.buffId							//附加buffId
	this.buff_tg = otps.buff_tg || "skill_targets"		//BUFF目标
	this.buffArg = otps.buffArg							//buff参数
	this.duration = otps.duration						//buff持续回合数
	this.buffRate = otps.buffRate						//buff概率
	this.lessAmp = otps.lessAmp || 0 					//目标每减少一个伤害加成比例
	this.kill_amp = otps.kill_amp || 0					//每击杀一个目标提升伤害
	this.self_heal = otps.self_heal || 0 				//自身生命值恢复比例
	this.maxHP_damage = otps.maxHP_damage || 0			//技能附加最大生命值真实伤害
	this.seckill = otps.seckill || 0					//释放技能后目标血量低于20%且低于自身攻击力三倍时秒杀概率
	this.killRet = otps.killRet || false				//击杀目标后重复释放
	this.suckAtk = otps.suckAtk || 0					//技能吸取目标攻击力比例
	this.lose_hp = otps.lose_hp || 0					//技能消耗生命值
	this.enemy_debuff_amp = otps.enemy_debuff_amp || 0		//目标每有一个负面状态伤害加成
	this.my_intensify_amp = otps.my_intensify_amp || 0		//自身每有一个增益状态伤害加成
	if(otps.burn_att_change_skill)
		this.burn_att_change_skill = JSON.parse(otps.burn_att_change_skill)			//技能时 灼烧状态属性修改
	if(otps.burn_buff_change_skill)
		this.burn_buff_change_skill = JSON.parse(otps.burn_buff_change_skill)		//技能时 灼烧状态附加BUFF修改
	if(otps.burn_att_change_normal)
		this.burn_att_change_normal = JSON.parse(otps.burn_att_change_normal)		//普攻时 灼烧状态属性修改
	if(otps.burn_buff_change_normal)
		this.burn_buff_change_normal = JSON.parse(otps.burn_buff_change_normal)		//普攻时 灼烧状态附加BUFF修改
	if(this.skillId && (this.skillId == "disarm" || this.skillId == "dizzy" || this.skillId == "silence") || this.character.atkcontrol){
		if(!this.character.buffRate)
			this.character.buffRate = this.buffRate
		this.character.buffRate += this.buffRate * this.character.atkcontrol
		console.log("atkcontrol",this.character.buffRate)
	}
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