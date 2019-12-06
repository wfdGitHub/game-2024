var skillManager = require("../skill/skillManager.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	//=========身份===========//
	this.name = otps.name		//角色名称
	this.id = otps.id 			//角色ID
	this.realm = 0				//国家
	this.career = 0				//角色职业   healer 治疗者
	this.index = 0				//所在位置
	this.camp = ""				//攻方或守方
	this.team = []				//所在阵容
	this.enemy = []				//敌对阵容
	//=========基础属性=======//
	this.level = otps["level"] || 0				//等级
	this.maxHP = otps["maxHP"] || 0				//最大生命值
	this.hp = this.maxHP						//当前生命值
	this.atk = otps["atk"] || 0					//攻击力
	this.phyDef = otps["phyDef"] || 0			//物理防御力
	this.magDef = otps["magDef"] || 0			//法术防御力
	this.crit = otps["crit"] || 0				//暴击几率
	this.critDef = otps["critDef"] || 0			//抗暴几率
	this.slay = otps["slay"] || 0				//爆伤加成
	this.slayDef = otps["slayDef"] || 0			//爆伤减免
	this.hitRate = otps["hitRate"] || 0			//命中率
	this.dodgeRate = otps["dodgeRate"] || 0		//闪避率
	this.amplify = otps["amplify"] || 0			//伤害加深
	this.reduction = otps["reduction"] || 0		//伤害减免
	this.healRate = otps["healRate"] || 0		//治疗暴击几率
	this.healAdd = otps["healAdd"] || 0			//被治疗加成
	this.needAnger = 4							//技能所需怒气值
	this.curAnger = otps["curAnger"] || 0		//当前怒气值
	//=========属性加成=======//
	this.self_adds = {}							//自身百分比加成属性
	this.team_adds = {}							//全队百分比加成属性
	//=========特殊属性=======//
	this.buffRate								//buff概率   若技能存在buff  以此代替buff本身概率
	this.buffArg								//buff参数   若技能存在buff  以此代替buff本身参数
	this.buffDuration							//buff持续时间   若技能存在buff  以此代替buff本身持续时间


	this.kill_anger = 0							//直接伤害击杀目标回复怒气
	this.kill_amp = 0							//直接伤害每击杀一个目标提升伤害
	this.kill_crit = 0							//直接伤害每击杀一个目标提升暴击
	this.kill_add_d_s = false					//直接伤害击杀目标后追加普通攻击
	this.kill_heal = 0							//直接伤害击杀目标后，恢复自身生命值上限
	this.kill_must_crit = false					//直接伤害击杀目标后，下回合攻击必定暴击

	this.anger_attack_amp = 0					//技能伤害加成
	this.anger_heal_amp = 0						//治疗量加成
	this.free_anger = 0							//释放技能不消耗怒气值概率
	this.attack_turn_rate = 0					//技能伤害转化成生命值百分比
	this.attack_turn_tg = 0						//技能伤害转化的生命值作用目标
	this.hit_turn_rate = 0						//受到直接伤害转化成生命值百分比
	this.hit_turn_tg = 0						//受到直接伤害转化的生命值作用目标
	this.add_d_s = false						//释放技能后追加普通攻击
	this.add_d_s_crit = false					//追加普攻必定暴击
	this.action_anger = 0						//行动后回复自身怒气
	this.low_hp_amp = 0							//战斗中自身生命每降低10%，伤害加成比例
	this.low_hp_crit = 0						//战斗中自身生命每降低10%，暴击加成比例
	this.enemy_died_amp = 0						//敌方每阵亡一人，伤害加成比例
	this.lessAmp = 0							//目标每减少一个伤害加成比例
	this.resurgence_team = false				//复活本方第1位阵亡的武将，并恢复其50%的生命，每场战斗只可触发1次

	this.skill_later_buff = false				//释放技能后附加buff
	this.skill_anger_s = 0						//释放技能后恢复自身怒气
	this.skill_anger_a = 0						//释放技能后恢复全体队友怒气
	this.skill_later_skill = false				//释放技能后后追加技能
	this.skill_less_anger = 0					//释放技能后降低目标怒气
	this.skill_anger_back = 0					//释放技能后回复己方后排怒气
	this.skill_anger_first = 0					//释放技能后，回复当前本方阵容站位最靠前的武将怒气

	this.burn_hit_reduction = 0					//被灼烧状态敌人直接伤害减免
	this.burn_turn_heal = 0						//释放技能时，如果目标处于灼烧状态，技能直接伤害的百分比转化为生命治疗自己
	this.burn_att_change = false				//灼烧状态属性修改
	this.burn_buff_change = false				//灼烧状态附加BUFF

	this.hit_rebound = 0						//受到直接伤害反弹比例
	this.hit_buff = false						//受到伤害给攻击者附加BUFF
	this.hit_less_anger = 0						//受到普通攻击后，降低攻击自己的武将怒气

	this.first_crit = false						//首回合必定暴击
	this.first_amp = 0							//首回合伤害加成
	this.first_buff = false						//战斗附加BUFF

	this.normal_later_buff = false				//普攻后附加BUFF
	this.normal_later_sRate = 0					//普攻后追加技能概率
	this.normal_add_anger = 0					//普攻后恢复自身怒气
	this.normal_less_anger = 0					//普攻后降低目标怒气
	this.normal_attack_amp = 0					//普攻伤害加成

	this.died_use_anger = false					//死亡时释放一次技能

	//=========状态=======//
	this.died = false			//死亡状态
	if(!this.maxHP || !this.hp)
		this.died = true
	this.buffs = {}					//buff列表
	this.dizzy = false				//眩晕
	this.silence = false			//沉默
	this.disarm = false				//麻痹
	this.forbidden = false			//禁疗
	this.poison = false				//中毒
	this.burn = false				//燃烧
	//=========技能=======//
	if(otps.defaultSkill)
		this.defaultSkill = skillManager.createSkill(otps.defaultSkill,this)				//普通技能
	if(otps.angerSkill){
		this.angerSkill = skillManager.createSkill(otps.angerSkill,this)		//怒气技能
		this.angerSkill.isAnger = true
	}
}
//计算升阶天赋加成
model.prototype.calTalent = function() {

}
//行动开始前刷新
model.prototype.before = function() {
	//伤害BUFF刷新
	for(var i in this.buffs)
		if(this.buffs[i].damageType == "dot")
			this.buffs[i].update()
}
//行动结束后刷新
model.prototype.after = function() {
	//状态BUFF刷新
	for(var i in this.buffs)
		if(this.buffs[i].damageType != "dot")
			this.buffs[i].update()
}
//受到伤害
model.prototype.onHit = function(attacker,info,source) {
	info.id = this.id
	info.value = Math.floor(info.value) || 1
	if(this.died){
		console.error("不能攻击已死亡的角色",this.name)
		info.realValue = 0
		return info
	}
	if(info.miss){
		info.realValue = 0
	}else{
		info.realValue = this.lessHP(info.value)
		info.curValue = this.hp
		info.maxHP = this.maxHP
		if(this.died){
			info.kill = true
			attacker.kill(this)
		}
	}
	return info
}
//受到治疗
model.prototype.onHeal = function(attacker,info,source) {
	info.id = this.id
	info.value = Math.floor(info.value) || 1
	if(this.forbidden){
		info.value = 0
		info.realValue = 0
	}else{
		info.value = Math.floor(info.value * (1 + this.healAdd / 10000))
		info.realValue = this.addHP(info.value)
	}
	info.curValue = this.hp
	info.maxHP = this.maxHP
	return info
}
//角色死亡
model.prototype.onDie = function() {
	// console.log(this.name+"死亡")
	this.hp = 0
	this.died = true
}
//击杀目标
model.prototype.kill = function(target) {
	console.log(this.name+"击杀"+target.name)

}

//恢复血量
model.prototype.addHP = function(value) {
	var realValue = value
	if((this.hp + value) > this.maxHP){
		realValue = this.maxHP - this.hp
		this.hp = this.maxHP
	}else{
		this.hp += value
	}
	// console.log(this.name + "addHP" , value,realValue,"curHP : ",this.hp+"/"+this.maxHP)
	return realValue
}
//扣除血量
model.prototype.lessHP = function(value) {
	var realValue = value
	if((this.hp - value) <= 0){
		realValue = this.hp
		this.onDie()
	}else{
		this.hp -= value
	}
	return realValue
}
//恢复怒气
model.prototype.addAnger = function(value,skillId) {
	this.curAnger += value
	fightRecord.push({type : "addAnger",realValue : value,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id,skillId : skillId})
	return value
}
//减少怒气
model.prototype.lessAnger = function(value,skillId) {
	var realValue = value
	if((this.curAnger - value) < 0){
		realValue = this.curAnger
	}else{
		this.curAnger -= value
	}
	if(realValue)
		fightRecord.push({type : "lessAnger",realValue : realValue,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id,skillId : skillId})
	return realValue
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	var value = this[name] || 0
	if(this.buffs[name]){
		value += this.buffs[name].getValue()
	}
	return value
}
//获取信息
model.prototype.getInfo = function() {
	var info = {}
	info.id = this.id
	info.name = this.name
	info.nation = this.nation
	info.definition = this.definition
	info.index = this.index
	info.level = this.level
	info.maxHP = this.maxHP
	info.hp = this.hp
	info.atk = this.atk
	info.phyDef = this.phyDef
	info.magDef = this.magDef
	info.crit = this.crit
	info.critDef = this.critDef
	info.slay = this.slay
	info.slayDef = this.slayDef
	info.hitRate = this.hitRate
	info.dodgeRate = this.dodgeRate
	info.amplify = this.amplify
	info.reduction = this.reduction
	info.healRate = this.healRate
	info.healAdd = this.healAdd
	info.needAnger = this.needAnger
	info.curAnger = this.curAnger
	return info
}
model.prototype.getSimpleInfo = function() {
	var info = {}
	info.id = this.id
	info.name = this.name
	info.hp = this.hp
	return info
}
model.prototype.addBuff = function(releaser,buff) {
	if(this.buffs[buff.buffId]){
		this.buffs[buff.buffId].overlay(releaser,buff)
	}else{
		this.buffs[buff.buffId] = buff
	}
}
model.prototype.removeBuff = function(buffId) {
    if(this.buffs[buffId]){
        delete this.buffs[buffId]
    }
}
module.exports = model