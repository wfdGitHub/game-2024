//技能基类 伤害  治疗  BUFF
var model = function(character,otps,talents) {
	otps = otps || {}
	this.character = character
	this.sid = otps.sid || 0 		//技能ID
	this.isAnger = otps.isAnger || false //是否为怒气技能
	this.d_type = otps.d_type || "phy" 	//phy  物伤  mag  法伤   real  真伤
	//属性
	this.attInfo = {}
	this.attTmpInfo = {}
	//伤害参数
	this.attInfo.atk_count = otps["atk_count"] || 1
	this.attInfo.atk_mul = otps["atk_mul"] || 0
	this.attInfo.atk_value = otps["atk_value"] || 0
	this.attInfo.real_value = 0
	this.atk_aim = otps["atk_aim"] || 0
	//治疗参数
	this.attInfo.heal_mul = otps["heal_mul"] || 0
	this.attInfo.heal_value = otps["heal_value"] || 0
	this.heal_aim = otps["heal_aim"] || 0
	this.buffs = {} 					//附带BUFF
	this.trigger_buffs = {} 			//触发BUFF
	this.talents = talents || {}
	this.otps = otps
	this.init()
}
//技能初始化
model.prototype.init = function() {
	for(var i = 1;i <= 3;i++){
		if(this.talents["buff"+i]){
			var buff = this.character.fighting.buffManager.getBuffByData(this.talents["buff"+i])
			this.buffs[buff.buffId] = buff
		}
	}
	//技能系数和附加值转为全目标共享,每个目标不超过最大值的一半
	if(this.talents.attack_share){
		this.attInfo.atk_share_value = this.attInfo.atk_value
		this.attInfo.atk_share_mul = this.attInfo.atk_mul
		this.attInfo.atk_value = 0
		this.attInfo.atk_mul = 0
	}
}
//使用技能前
model.prototype.before = function() {
	//自身每损失一定血量，增加一段伤害
	if(this.talents.hp_low_count)
		this.changeTotalTmp("atk_count",Math.max(0,Math.floor((1 - this.character.getTotalAtt("hp") / this.character.getTotalAtt("maxHP")) / this.talents.hp_low_count)))
	//释放技能时消耗生命值为临时伤害
	if(this.talents.hp_to_damage){
		var info = this.character.onOtherDamage(this,this.character.getTotalAtt("hp") * 0.3)
		this.changeTotalTmp("real_share_value",info.realValue)
	}
	//伤害无视护甲
	if(this.talents.ign_armor){
		this.character.changeTotalTmp("ign_armor",this.talents.ign_armor)
	}
	//技攻触发，释放技攻时友方每存活一名侠客，自身技攻伤害提升
	if(this.character.talents.skill_survival_amp)
		this.character.changeTotalTmp("amp",this.character.talents.skill_survival_amp * this.character.fighting.fightInfo[this.character.belong]["survival"])
}
//使用技能后
model.prototype.after = function() {
	this.attTmpInfo = {}
	//技能回怒
	if(this.talents.addAnger)
		this.character.addAnger(this.talents.addAnger,true)
	//攻击增加己方全体怒气
	if(this.character.talents.atk_team_anger){
		for(var i = 0;i < this.character.team.length;i++){
			if(this.character.team[i].checkAim())
				this.character.team[i].addAnger(this.character.talents.atk_team_anger,true)
		}
	}
	//攻击降低敌方全体怒气
	if(this.character.talents.atk_enemy_anger){
		var enemyTeam =  this.character.enemyTeam
		for(var i = 0;i < enemyTeam.length;i++){
			if(enemyTeam[i].checkAim())
				enemyTeam[i].lessAnger(this.character.talents.atk_enemy_anger,true)
		}
	}
	//首次攻击触发技能
	if(this.character.talents.first_atk_skill){
		var skill = this.character.talents.first_atk_skill
		delete this.character.talents.first_atk_skill
		this.character.fighting.skillManager.useSkill(this.character.useOtherSkill(skill))
	}
	//攻击触发技能
	if(this.laterSkill && this.character.fighting.randomCheck(this.laterSkill.rate,"laterSkill"))
		this.character.fighting.skillManager.useSkill(this.character.useOtherSkill(this.laterSkill))
	//攻击触发治疗自身血量
	if(this.character.talents.atk_heal_self)
		this.character.onOtherHeal(this,Math.floor(this.character.talents.atk_heal_self * this.character.getTotalAtt("atk")))
	//使用技能结束插入临时记录
	this.character.fighting.insertTmpRecord()
}
//使用攻击技能前
model.prototype.attackBefore = function(targets) {
	if(this.isAnger)
		this.attackSkillBefore(targets)
	else
		this.attackNormalBefore(targets)

	if(this.getTotalAtt("real_share_value")){
		this.changeTotalTmp("real_value",Math.floor(this.getTotalAtt("real_share_value") / targets.length / this.getTotalAtt("atk_count")))
		delete this.attTmpInfo.real_share_value
	}
	if(this.getTotalAtt("atk_share_mul")){
		this.changeTotalTmp("atk_mul",this.getTotalAtt("atk_share_mul") / Math.max(2,targets.length))
		delete this.attTmpInfo.atk_share_mul
	}
	if(this.getTotalAtt("atk_share_value")){
		this.changeTotalTmp("atk_value",Math.floor(this.getTotalAtt("atk_share_value") / Math.max(2,targets.length)))
		delete this.attTmpInfo.atk_share_value
	}
	if(this.character.buffs["jiuyang_real"])
		this.changeTotalTmp("atk",Math.floor(this.getTotalAtt("armor") * 0.2))
}
//使用技攻前
model.prototype.attackSkillBefore = function(targets) {
	//目标每减少一个伤害加成
	if(this.character.talents.aim_less_amp){
		var mulRate = this.character.talents.aim_less_amp * (this.character.fighting.locator.getTargetTypeNum(this.atk_aim) - targets.length)
		this.changeTotalTmp("atk_mul",mulRate * this.attInfo.atk_mul)
	}
	//化劲伤害
	if(this.character.talents.hit_add_store && this.character.buffs["store_damage"])
		this.changeTotalTmp("real_share_value",Math.floor(this.character.buffs["store_damage"].getBuffValue() * this.character.talents.hit_add_store))
}
//使用普攻前
model.prototype.attackNormalBefore = function(target) {

}
//使用攻击技能后
model.prototype.attackAfter = function(target) {
	if(this.character.died)
		return
	//出尘结算
	if(this.character.buffs["chuchen"]){
		var tmpDamage = this.character.buffs["chuchen"].getValue()
		this.character.buffs["chuchen"].destroy()
		this.character.onOtherDamage(this.character,tmpDamage)
	}

	if(this.isAnger)
		this.attackSkillAfter(target)
	else
		this.attackNormalAfter(target)
}
//技能结束后
model.prototype.attackSkillAfter = function(target) {
	if(this.character.talents.skill_anger)
		this.character.addAnger(this.character.talents.skill_anger,true)
}
//普攻结束后
model.prototype.attackNormalAfter = function(target) {
	var talents = this.character.talents
	if(talents.normal_phybuff_heal && target.buffs["phy_damage"])
		this.character.onOtherHeal(this.character,this.character.getTotalAtt("maxHP") * talents.normal_phybuff_heal)
	if(talents.normal_suck_anger_rate){
		var rate = talents.normal_suck_anger_rate
		if(talents.normal_suck_anger_ctr && target.checkControl())
			rate += talents.normal_suck_anger_ctr
		if(this.character.fighting.randomCheck(rate,"normal_suck_anger_rate")){
			var anger = Math.floor(target.curAnger / 2)
			target.lessAnger(anger,true)
			this.character.addAnger(anger,true)
		}
	}
	if(this.character.talents.normal_anger)
		this.character.addAnger(this.character.talents.normal_anger,true)
}
model.prototype.changeTotalTmp = function(name,value) {
	if(!this.attTmpInfo[name])
		this.attTmpInfo[name] = 0
	this.attTmpInfo[name] += Number(value) || 0
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	var value = this.attInfo[name] || 0
	value += this.attTmpInfo[name] || 0
	return value
}
//==============获取技能信息
module.exports = model