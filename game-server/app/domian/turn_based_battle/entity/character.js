//英雄
const entity_base = require("./entity_base.js")
const skill_base = require("../skill/skill_base.js")
const fightCfg = require("../fightCfg.js")
var model = function(fighting,otps) {
	//继承父类属性
	entity_base.call(this,fighting,otps)
	if(this.isNaN)
		return
	//初始化技能
	this.defaultSkill = this.packageDefaultSkill()
	this.angerSkill = this.packageAngerSkill()
	//初始化天赋
	this.talents = this.packageHeroTalents(otps)
	//回合技能
	this.roundSkills = []
}
//继承父类方法
model.prototype = Object.create(entity_base.prototype) //继承父类方法
//战斗初始化
model.prototype.init = function() {
	//主属性增益
	this.changeTotalAtt("hit",this.getTotalAtt("main_hit") * 0.005)
	this.changeTotalAtt("hitDef",this.getTotalAtt("main_hit") * 0.005)
	this.changeTotalAtt("magAmp",this.getTotalAtt("main_mag") * 0.01)
	this.changeTotalAtt("magDef",this.getTotalAtt("main_mag") * 0.01)
	this.changeTotalAtt("phyAmp",this.getTotalAtt("main_phy") * 0.01)
	this.changeTotalAtt("phyDef",this.getTotalAtt("main_phy") * 0.01)
	this.changeTotalAtt("block",this.getTotalAtt("main_slay") * 0.005)
	this.changeTotalAtt("blockDef",this.getTotalAtt("main_slay") * 0.005)
	this.changeTotalAtt("slay",(this.getTotalAtt("main_slay") - 60) * 0.006)
	this.changeTotalAtt("ampDefMain",(this.getTotalAtt("main_dr") - 60) * 0.006)
	this.changeTotalAtt("speed",this.fighting.random())
	//战斗属性
	this.hp_loss = 0 			//战斗中失去生命值比例
	//属性加成
	for(var i in this.attInfo){
		if(this.talents[i])
			this.attInfo[i] += Number(this.talents[i]) || 0
	}
	if(this.talents.self_maxHP)
		this.attInfo.maxHP += Math.floor(this.attInfo.maxHP * this.talents.self_maxHP)
	if(this.talents.self_atk)
		this.attInfo.atk += Math.floor(this.attInfo.atk * this.talents.self_atk)
	if(this.talents.self_armor)
		this.attInfo.armor += Math.floor(this.attInfo.armor * this.talents.self_armor)
	//========技能初始化
	//损失血量技能
	if(this.talents.hp_loss_skill)
		this.talents.hp_loss_skill = this.packageSkill(this.talents.hp_loss_skill,this.talents.hp_loss_star,0,false)
	//死亡触发技能
	if(this.talents.died_skill)
		this.talents.died_skill = this.packageSkillBySid(this.talents.died_skill)
	//回合技能
	if(this.talents.round_skill)
		this.packageRoundSkill(this.talents.round_skill)
	if(this.talents.kill_dps_skill)
		this.talents.kill_dps_skill = this.packageSkillBySid(this.talents.kill_dps_skill)
	//首次攻击技能
	if(this.talents.first_atk_skill)
		this.talents.first_atk_skill = this.packageSkill(this.talents.first_atk_skill,this.talents.first_atk_star,0,false)
	//攻击触发技能 30%
	if(this.talents.atk_skill){
		var atk_skill = this.packageSkill(this.talents.atk_skill,this.talents.atk_star,0,false)
		atk_skill.rate = this.talents.atk_skill_rate || 0
		this.defaultSkill.laterSkill = atk_skill
		this.angerSkill.laterSkill = atk_skill
	}
	if(this.talents.behit_skill)
		this.talents.behit_skill = this.packageSkillBySid(this.talents.behit_skill)
	//被攻击触发次数
	if(this.talents.atk_trigger_value)
		this.talents.atk_trigger_cur = 0
	//========初始BUFF
	for(var i = 1;i <= 4;i++){
		if(this.talents["begin_buff"+i]){
			var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents["begin_buff"+i])
			var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
			for(var j = 0;j < buffTargets.length;j++){
				if(this.fighting.randomCheck(tmpBuff.rate,"begin_buff"))
					this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
			}
		}
		if(this.talents["first_buff"+i])
			this.fighting.buffManager.createBuffByData(this,this,this.talents["first_buff"+i])
		if(this.talents["skill_buff"+i]){
			var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents["skill_buff"+i])
			this.angerSkill.trigger_buffs[tmpBuff.buffId] = tmpBuff
		}
		if(this.talents["normal_buff"+i]){
			var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents["normal_buff"+i])
			this.defaultSkill.trigger_buffs[tmpBuff.buffId] = tmpBuff
		}
	}
	//其他侠客攻击时为自己添加BUFF
	if(this.talents["other_hero_ation_buff"])
		this.fighting.heroAtionMonitor.push({"type":"buff","character":this,"buffData":this.talents["other_hero_ation_buff"]})
	//筋骨和内力同步为最高值
	if(this.talents.same_mag_phy){
		this.attInfo.main_mag = Math.max(this.attInfo.main_mag,this.attInfo.main_phy)
		this.attInfo.main_phy = Math.max(this.attInfo.main_mag,this.attInfo.main_phy)
	}
	//阵营增益
	if(this.talents.realm_add_atk){
		var targets = this.fighting.locator.getTargets(this,"same_realm")
		for(var i = 0;i < targets.length;i++)
			targets[i].changeTotalAtt("atk",Math.floor(targets[i].attInfo.atk * this.talents.realm_add_atk))
	}
	if(this.talents.realm_add_armor){
		var targets = this.fighting.locator.getTargets(this,"same_realm")
		for(var i = 0;i < targets.length;i++)
			targets[i].changeTotalAtt("armor",Math.floor(targets[i].attInfo.armor * this.talents.realm_add_armor))
	}
	if(this.talents.realm_add_amp){
		var targets = this.fighting.locator.getTargets(this,"same_realm")
		for(var i = 0;i < targets.length;i++)
			targets[i].changeTotalAtt("amp",this.talents.realm_add_amp)
	}
	if(this.talents.realm_add_ampDef){
		var targets = this.fighting.locator.getTargets(this,"same_realm")
		for(var i = 0;i < targets.length;i++)
			targets[i].changeTotalAtt("ampDef",this.talents.realm_add_ampDef)
	}
	if(this.talents.realm_add_buff){
		var targets = this.fighting.locator.getTargets(this,"same_realm")
		for(var i = 0;i < targets.length;i++)
			this.fighting.buffManager.createBuffByData(this,targets[i],this.talents.realm_add_buff)
	}
	if(this.talents.any_die_monitor)
		this.fighting.anyDieMonitor.push(this)
	if(this.talents.firend_die_watch_count)
		this.fighting.fightInfo[this.belong]["firend_die_watch"] = this
	//双生属性
	if(this.talents.twin_id){
		for(var i = 0;i < this.team.length;i++){
			if(this.team[i].heroId == this.talents.twin_id){
				for(var j = 1;j <= 3;j++){
					if(this.talents["twin_att"+j]){
						if(this.talents["twin_value"+j]){
							this.changeTotalAtt(this.talents["twin_att"+j],this.talents["twin_value"+j])
							this.team[i].changeTotalAtt(this.talents["twin_att"+j],this.talents["twin_value"+j])
						}
						if(this.talents["twin_mul"+j]){
							this.changeTotalAtt(this.talents["twin_att"+j],this.getTotalAtt(this.talents["twin_att"+j]) * this.talents["twin_mul"+j])
							this.team[i].changeTotalAtt(this.talents["twin_att"+j],this.getTotalAtt(this.talents["twin_att"+j]) * this.talents["twin_mul"+j])
						}
					}
					if(this.talents["twin_buff"]){
						this.fighting.buffManager.createBuffByData(this.team[i],this,this.talents["twin_buff"])
						this.fighting.buffManager.createBuffByData(this,this.team[i],this.talents["twin_buff"])
					}
				}
				break
			}
		}
	}
	if(this.talents.block_buff1){
		this.talents.block_buff1 = this.fighting.buffManager.getBuffByData(this.talents.block_buff1)
		if(this.talents.block_buff2)
			this.talents.block_buff2 = this.fighting.buffManager.getBuffByData(this.talents.block_buff2)
	}
	if(this.talents.atk_magdmg_buff)
		this.talents.atk_magdmg_buff = this.fighting.buffManager.getBuffByData(this.talents.atk_magdmg_buff)
	if(this.talents.miss_buff)
		this.talents.miss_buff = this.fighting.buffManager.getBuffByData(this.talents.miss_buff)
	if(this.talents.enemy_die_buff)
		this.talents.enemy_die_buff = this.fighting.buffManager.getBuffByData(this.talents.enemy_die_buff)
	if(this.talents.survive_team_buff)
		this.talents.survive_team_buff = this.fighting.buffManager.getBuffByData(this.talents.survive_team_buff)
	if(this.talents.round_buff)
		this.talents.round_buff = this.fighting.buffManager.getBuffByData(this.talents.round_buff)
	this.attInfo.hp = this.attInfo.maxHP
	this.attInfo.speed += this.attInfo.main_hit
}
model.prototype.begin = function() {
	if(this.talents.beigin_skill){
		var skill = this.useOtherSkill(this.packageSkillBySid(this.talents.beigin_skill))
		this.fighting.skillManager.useSkill(skill)
	}
}
//===================生命周期
//个人回合开始
model.prototype.before = function() {
	this.isAction = true
	this.onAction = true
	if(this.died)
		return
	//回合技能
	for(var i = 0;i < this.roundSkills.length;i++){
		if(this.roundSkills[i].CUR_CD <= 0){
			var skill = this.useOtherSkill(this.roundSkills[i])
			if(skill){
				this.roundSkills[i].CUR_CD = this.roundSkills[i].NEED_CD
				this.fighting.skillManager.useSkill(skill)
			}
		}else{
			this.roundSkills[i].CUR_CD--
		}
	}
	if(this.talents.revive_friend_once){
		var team = this.team
		for(var i = 0;i < team.length;i++){
			if(!team[i].isNaN && team[i].died){
				team[i].revive(Math.floor(team[i].getTotalAtt("maxHP") * this.talents.revive_friend_once))
				delete this.talents.revive_friend_once
			}
		}
	}
	if(this.talents.round_buff){
		var tmpBuff = this.talents.survive_team_buff
		var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
		for(var j = 0;j < buffTargets.length;j++)
			this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
	}
}
//个人回合结束
model.prototype.after = function() {
	this.onAction = false
	if(this.died)
		return
	if(this.buffs["totem_friend_amp"])
		this.buffs["totem_friend_amp"].onAtion()
}
//整体回合开始
model.prototype.roundBegin = function() {
	this.isAction = false
	if(this.died)
		return
	if(this.talents.survive_team_buff){
		var tmpBuff = this.talents.survive_team_buff
		tmpBuff.count = this.fighting.fightInfo[this.belong]["survival"]
		var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
		for(var j = 0;j < buffTargets.length;j++)
				this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
	}
	if(this.buffs["extra_ation"] && this.buffs["extra_ation"].enoughCD()){
		var skillInfo = this.chooseSkill()
		if(skillInfo)
			this.fighting.skillManager.useSkill(skillInfo)
	}
	if(this.buffs["together"] && this.buffs["together"].attacker.died){
		this.buffs["together"].attacker.revive(0.3 * this.buffs["together"].attacker.getTotalAtt("maxHP"))
		this.buffs["together"].attacker.addAnger(25,true)
	}
}
//整体回合结束
model.prototype.roundEnd = function() {
	for(var i in this.buffs){
		if(this.buffs[i])
			this.buffs[i].update()
	}
	if(this.died)
		return
	if(this.talents.round_healbyatk)
		this.onOtherHeal(this,this.talents.round_healbyatk * this.getTotalAtt("atk"))
	if(this.talents.totem_hit_heal_rate && this.buffs["totem_hit_heal"])
		this.onOtherHeal(this,this.talents.totem_hit_heal_rate * this.getTotalAtt("maxHP"))
	if(this.buffs["copy_skill"])
		this.buffs["copy_skill"].repetSkill()
}
//获得怒气
model.prototype.addAnger = function(value,show) {
	if(this.died || this.buffs["totem_friend_amp"] || this.buffs["ban_anger"])
		value = 0
	this.curAnger += Math.floor(value) || 0
	this.curAnger = Math.min(this.curAnger,this.maxAnger)
	if(show)
		this.fighting.fightRecord.push({type : "changeAnger",id : this.id,changeAnger : value,curAnger : this.curAnger})
	return value
}
//减少怒气
model.prototype.lessAnger = function(value,show) {
	value = Math.min(this.curAnger,value)
	this.curAnger -= value
	if(show)
		this.fighting.fightRecord.push({type : "changeAnger",id : this.id,changeAnger : -value,curAnger : this.curAnger})
	return value
}
//选择技能
model.prototype.chooseSkill = function() {
	if(this.died || this.checkForceControl() || this.checkTotem())
		return false
	if(!this.fighting.locator.existsTarget(this))
		return false
	var skillInfo = false
	if(this.curAnger >= this.needAnger)
		skillInfo = this.useAngerSkill()
	if(!skillInfo)
		skillInfo = this.useNormalSkill()
	if(skillInfo){
		//干扰
		if(skillInfo.skill.isAnger && this.buffs["disturb"] && this.fighting.randomCheck(this.buffs["disturb"].getBuffMul(),"disturb")){
			this.fighting.fightRecord.push({type:"tag",id:this.id,tag:"disturb"})
			return false
		}
		if(this.buffs["insane"] && this.buffs["insane"].target.checkAim())
			skillInfo.targets = [this.buffs["insane"].target]
	}
	return skillInfo
}
//使用怒气技能消耗怒气
model.prototype.useAngerSkill = function() {
	if(this.checkUseSkill())
		return false
	var needAnger = this.needAnger
	var needValue = 0
	var info = {}
	info.skill = false
	//怒气足够
	if(this.curAnger >= this.needAnger){
		info.skill = this.angerSkill
		needValue = this.needAnger
	}
	if(info.skill){
		if(needValue)
			info.changeAnger = -this.lessAnger(needValue)
		info.curAnger = this.curAnger
	}
	info.mul = 1
	return info
}
//消耗怒气释放指定
model.prototype.usePointSkill = function(skill,maxAnger) {
	if(this.died)
		return false
	var needAnger = Math.min(maxAnger,this.needAnger)
	var info = {}
	info.skill = skill
	if(info.skill.talents.kill_repet)
		info.mul += Math.floor(info.curAnger * info.skill.talents.kill_repet)
	info.changeAnger = -this.lessAnger(needAnger)
	info.curAnger = this.curAnger
	info.no_combo = true  			//不可连击
	return info
}
//使用普攻技能获得怒气
model.prototype.useNormalSkill = function() {
	if(this.checkUseNormal())
		return false
	var info = {}
	info.skill = this.defaultSkill
	info.changeAnger = this.addAnger(this.getTotalAtt("roundAnger"))
	info.curAnger = this.curAnger
	info.mul = 1
	if(this.buffs["doujiu"] && this.buffs["doujiu"].target && this.buffs["doujiu"].target.checkAim()){
		info.targets = [this.buffs["doujiu"].target]
		info.mul += this.buffs["doujiu"].skillMul
	}
	return info
}
//选择其他技能
model.prototype.useOtherSkill = function(skill) {
	if(this.checkForceControl())
		return false
	var info = {}
	info.skill = skill
	info.changeAnger = 0
	info.curAnger = this.curAnger
	info.mul = 1
	return info
}
//无视免控释放技能
model.prototype.useOtherSkillFree = function(skill) {
	var info = {}
	info.skill = skill
	info.changeAnger = 0
	info.curAnger = this.curAnger
	info.mul = 1
	return info
}
//检查可行动
model.prototype.checkAction = function() {
	if(this.died || this.isAction)
		return false
	else
		return true
}
//检查可使用技能
model.prototype.checkUseSkill = function() {
	if(this.died || this.buffs["silence"] || this.checkForceControl())
		return true
	return false
}
//检查可使用普攻
model.prototype.checkUseNormal = function() {
	if(this.died || this.buffs["disarm"] || this.checkForceControl())
		return true
	else
		return false
}
//检查硬控
model.prototype.checkForceControl = function() {
	if(this.buffs["petrify"] || this.buffs["frozen"] || this.buffs["dizzy"])
		return true
	else
		return false
}
//检查被控制
model.prototype.checkControl = function() {
	if(this.checkForceControl() || this.buffs["disarm"] || this.buffs["silence"] || this.buffs["chaofeng"])
		return true
	else
		return false
}
//检查图腾状态
model.prototype.checkTotem = function(argument) {
	if(this.buffs["totem_hit_heal"] || this.buffs["totem_friend_amp"])
		return true
	else
		return false
}
//检查可被选中
model.prototype.checkAim = function() {
	if(this.isNaN || this.died)
		return false
	else
		return true
}
//获取战斗数据
model.prototype.getCombatData = function() {
	var info = {
		"id" : this.id,
		"curAnger" : this.curAnger,
		"maxAnger" : this.maxAnger,
		"needAnger" : this.needAnger
	}
	return info
}
//受到其他伤害
model.prototype.onOtherDamage = function(attacker,value) {
	var info = {"type":"other_damage","value":value}
	this.onHit(attacker,info,false)
	if(info.realValue)
		this.fighting.fightRecord.push(info)
	return info
}
//受到其他治疗
model.prototype.onOtherHeal = function(attacker,value) {
	var info = {"type":"other_heal","value":value}
	this.onHeal(attacker,info)
	if(info.realValue)
		this.fighting.fightRecord.push(info)
	return info
}
//受到攻击
model.prototype.onHit = function(attacker,info,hitFlag) {
	//受到攻击
	if(this.buffs["hudun"])
		this.buffs["hudun"].offsetDamage(info)
	//伤害挪移
	if(this.buffs["nuoyi_share"]){
		var targets = this.fighting.locator.getTargets(this,"team_friend")
		if(targets.length){
			var splashDamage = Math.floor(info.value * this.buffs["nuoyi_share"].getBuffMul() / targets.length)
			info.value = Math.floor(info.value * (1 - this.buffs["nuoyi_share"].getBuffMul()))
			info.splashs = info.splashs ? info.splashs : []
			for(var i = 0;i < targets.length;i++)
				info.splashs.push(targets[i].onHit(attacker,{value:splashDamage}))
		}
	}
	//受击转化劲
	if(this.talents.behit_turn_store){
		var storeDamage = Math.floor(info.value * this.talents.behit_turn_store)
		info.value -= storeDamage
		this.fighting.buffManager.createBuff(attacker,this,{"buffId":"store_damage","value":storeDamage,"duration":3})
	}
	if(this.buffs["wuxiang"] && info.d_type == "phy")
		info.value = 0
	this.lessHP(info,hitFlag)
	//秒杀判断
	if(hitFlag && attacker.talents.hp_seckill && this.getHPRate() < attacker.talents.hp_seckill)
		this.onSeckill(info)
	attacker.totalDamage += info.realValue
	return info
}
//受到攻击前
model.prototype.onHitBefore = function(attacker,skill) {
	if(this.buffs["mag_hitDef"] && attacker.buffs["mag_damage"])
		this.changeTotalTmp("hitDef",this.buffs["mag_hitDef"].getBuffMul())
	if(this.buffs["jiuyang_real"])
		this.changeTotalTmp("armor",Math.floor(this.getTotalAtt("atk") * 0.1))
	if(attacker.talents.atk_dps_amp && (this.realm == 2 || this.realm == 4))
		attacker.changeTotalTmp("atk",Math.floor(attacker.attInfo.atk * attacker.talents.atk_dps_amp))
	if(skill.isAnger){
		//男性伤害加成
		if(this.sex == 1 && attacker.talents.anger_man_amp)
			attacker.changeTotalTmp("amp",attacker.talents.anger_man_amp)
	}
}
//受到攻击时
model.prototype.onHiting = function(attacker,skill,info) {
	if(info.realValue){
		//相邻溅射
		if(skill.talents.splash_nearby){
			var splashDamage = Math.floor(skill.talents.splash_nearby * info.realValue)
			var targets = this.fighting.locator.getNearby(this)
			info.splashs = info.splashs ? info.splashs : []
			for(var i = 0;i < targets.length;i++)
				info.splashs.push(targets[i].onHit(attacker,{value:splashDamage}))
		}
		//内伤溅射
		if(this.buffs["splash_mag"]){
			info.splashs = info.splashs ? info.splashs : []
			var targets = this.fighting.locator.getEnemyHasBuff(this,"mag_damage")
			var splashDamage = Math.floor(this.buffs["splash_mag"].getBuffMul() * info.realValue / targets.length)
			for(var i = 0;i < targets.length;i++)
				info.splashs.push(targets[i].onHit(this,{value:splashDamage}))
		}
	}
}
//受到攻击结束后
model.prototype.onHitAfter = function(skill,attacker,info) {
	//反伤
	if(this.buffs["nuoyi_back"])
		attacker.onOtherDamage(this,this.buffs["nuoyi_back"].getBuffMul() * info.realValue)
	if(this.buffs["jiuyang_real"] && info.d_type == "phy" && this.buffs["jiuyang_real"].getCount() >= 2)
		attacker.onOtherDamage(this,0.2 * info.realValue)
	if(this.buffs["damage_rebound"])
		attacker.onOtherDamage(this,this.buffs["damage_rebound"].getBuffValue() * info.realValue)
	if(this.buffs["behit_rebound_allAtk"])
		this.buffs["behit_rebound_allAtk"].rebound(attacker)
	if(this.buffs["hunyuan"]){
		var tmpValue = this.buffs["hunyuan"].getBuffMul() * info.realValue
		if(tmpValue)
			attacker.onOtherDamage(this,tmpValue)
	}
	//回血
	if(this.buffs["totem_hit_heal"])
		this.onOtherHeal(this,this.buffs["totem_hit_heal"].getBuffMul() * info.realValue)
	//减怒
	if(skill.talents.loss_anger_rate && this.fighting.randomCheck(skill.talents.loss_anger_rate,"loss_anger_rate"))
		this.lessAnger(skill.talents.loss_anger_value,true)
	//触发类
	if(this.buffs["vital_point"])
		return
	//血量损失触发
	this.triggerLossHP()
	//血量低于50%回血
	if(this.buffs["hit_heal"] && (this.getTotalAtt("hp") / this.getTotalAtt("maxHP")) < 0.5)
		this.onOtherHeal(this,this.buffs["hit_heal"].getBuffMul() * this.getTotalAtt("maxHP"))
	if(this.talents.behit_healRate && this.fighting.randomCheck(this.talents.behit_healRate,"behit_healRate")){
		this.onOtherHeal(this,this.talents.behit_healMul * this.getTotalAtt("atk"))
		if(this.talents.behit_hpanger)
			this.addAnger(Math.floor(this.getTotalAtt("hp") / this.getTotalAtt("maxHP") * this.talents.behit_hpanger),true)
	}
	//被攻击触发，中毒回血
	if(this.talents.behit_poison_heal && attacker.buffs["poison"]){
		this.onOtherHeal(this,this.talents.behit_poison_heal * this.getTotalAtt("atk"))
	}
	//被攻击对攻击者释放BUFF
	if(this.talents.behit_buff)
		this.fighting.buffManager.createBuffByData(this,attacker,this.talents.behit_buff)
	//被攻击触发技能概率
	if(this.talents.behit_skill  && this.fighting.randomCheck(this.talents.behit_skill_rate,"behit_skill_rate"))
		this.fighting.skillManager.useSkill(this.useOtherSkill(this.talents.behit_skill))
	//被攻击触发次数
	if(this.talents.atk_trigger_value){
		this.talents.atk_trigger_cur++
		if(this.talents.atk_trigger_cur >= this.talents.atk_trigger_value){
			this.talents.atk_trigger_cur = 0
			if(this.talents.atk_trigger_buff){
				var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents.atk_trigger_buff)
				var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
				for(var j = 0;j < buffTargets.length;j++)
					if(this.fighting.randomCheck(tmpBuff.rate,"atk_trigger_buff"))
						this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
			}
		}
	}
	if(skill.isAnger){
		if(this.buffs["jiuyang_305030"]){
			attacker.onOtherDamage(this,Math.min(this.buffs["jiuyang_305030"].getBuffMul() * this.attInfo.maxHP,info.realValue))
			this.buffs["jiuyang_305030"].destroy()
		}
	}
}
//受到治疗
model.prototype.onHeal = function(attacker,info) {
	//受到治疗预处理
	this.addHP(info)
	attacker.totalHeal += info.realValue
	return info
}
//受到治疗结束后
model.prototype.onHealAfter = function(attacker,info) {}
//角色死亡
model.prototype.onDie = function(info) {
	if(this.died)
		return
	if(this.onWillDie(info))
		return
	info.value += this.attInfo.hp
	info.realValue += this.attInfo.hp
	this.attInfo.hp = 0
	this.hp_loss = 0
	this.curAnger = 0
	this.died = true
	info.curAnger = this.curAnger
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	info.died = true
	//印记状态
	if(this.buffs["sign_unheal"] && this.buffs["sign_unheal"]["not_revived"])
		this.fighting.buffManager.createBuff(this,this,{"buffId":"not_revived","duration":2})
	//清空BUFF
	for(var i in this.buffs)
		if(!this.buffs[i].buffCfg.save)
			this.buffs[i].destroy()
	this.fighting.fightInfo[this.belong]["survival"]--
}
//任意角色阵亡
model.prototype.anyDie = function(target) {
	if(!this.checkAim())
		return
	if(this.talents.any_die_buff){
		var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents.any_die_buff)
		var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
		for(var j = 0;j < buffTargets.length;j++)
			this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
	}
	//敌对目标
	if(target.belong != this.belong){
		if(this.talents.enemy_die_buff){
			var tmpBuff = this.talents.enemy_die_buff
			var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
			for(var j = 0;j < buffTargets.length;j++)
				this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
		}
	}else{
		if(this.talents.friend_die_anger){
			this.addAnger(this.talents.friend_die_anger,true)
		}
	}
}
//濒死触发
model.prototype.onWillDie = function(info) {
	if(this.buffs["vital_point"])
		return false
	if(this.talents.willdie_ime_count && this.fighting.randomCheck(this.talents.willdie_ime_rate,"willdie_ime_rate")){
		this.talents.willdie_ime_count--
		this.saveLife(info)
		if(this.talents.willdie_ime_buff)
			this.fighting.buffManager.createBuffByData(this,this,this.talents.willdie_ime_buff)
		return true
	}
	if(this.fighting.fightInfo[this.belong]["firend_die_watch"]){
		var watchHero = this.fighting.fightInfo[this.belong]["firend_die_watch"]
		if(watchHero.talents.firend_die_watch_count > 0 && watchHero.getHPRate() > 0.3){
			watchHero.talents.firend_die_watch_count--
			this.saveLife(info)
			var tmpValue = Math.floor(watchHero.attInfo.maxHP * 0.15)
			if(watchHero.talents.firend_die_watch_hudun)
				this.fighting.buffManager.createBuff(watchHero,this,{"buffId":"hudun","value":tmpValue,"duration":99})
			watchHero.onOtherDamage(watchHero,tmpValue)
			return true
		}
	}
	if(this.buffs["chuchen_pre"] && this.buffs["chuchen_pre"].enoughCD()){
		var tmpValue = this.attInfo.hp
		this.saveLife(info)
		this.fighting.buffManager.createBuff(this,this,{"buffId":"chuchen","value":tmpValue,"duration":99})
		return true
	}
}
//触发保命
model.prototype.saveLife = function(info) {
	this.attInfo.hp = 1
	info.realValue = this.attInfo.hp
	this.fighting.nextRecord.push({type:"tag",id:this.id,tag:"one_hp"})
}
//角色死亡结束后
model.prototype.onDieAfter = function(attacker,info,skill) {
	//若击杀目标，则对敌方其余侠客造成本次伤害一定比例的溅射伤害
	if(skill.talents.splash_kill){
		var targets = this.fighting.locator.getTargets(this,"team_friend")
		if(targets.length){
			var splashDamage = Math.floor(info.realValue * skill.talents.splash_kill)
			for(var i = 0;i < targets.length;i++)
				targets[i].onOtherDamage(attacker,splashDamage)
		}
	}
	//死亡触发技能
	if(this.talents.died_skill)
		this.fighting.skillManager.useSkill(this.useOtherSkill(this.talents.died_skill))
	//复活
	if(this.talents.revive_rate){
		this.revive(this.talents.revive_rate * this.attInfo.maxHP)
		delete this.talents.revive_rate
	}
	if(this.talents.died_buff)
		this.fighting.buffManager.createBuffByData(this,this,this.talents.died_buff)
	if(this.talents.died_buff_once){
		var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents.died_buff_once)
		var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
		for(var j = 0;j < buffTargets.length;j++)
			this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
		delete this.talents.died_buff_once
	}
	for(var i = 0;i < this.fighting.anyDieMonitor.length;i++){
		this.fighting.anyDieMonitor[i].anyDie(this)
	}
	if(this.buffs["yinyang"]){
		this.buffs["yinyang"].destroy()
		this.revive(0.5 * this.attInfo.maxHP)
	}
	//引爆中毒
	if(this.talents.died_poison_break && this.fighting.randomCheck(this.talents.died_poison_break,"died_poison_break")){
		var targets = this.fighting.locator.getTargets(this,"enemy_all")
		for(var i = 0;i < targets.length;i++)
			if(targets[i].buffs["poison"])
				targets[i].buffs["poison"].breakOnce(this)
	}
	//死亡触发，对攻击者释放BUFF，仅触发1次
	if(this.talents.died_attack_buff_once){
		this.fighting.buffManager.createBuffByData(this,attacker,this.talents.died_attack_buff_once)
		delete this.talents.died_attack_buff_once
	}
	if(this.talents.died_attack_anger_down){
		attacker.lessAnger(this.talents.died_attack_anger_down,true)
	}
}
//恢复血量
model.prototype.addHP = function(info) {
	info.id = this.id
	info.value = Math.floor(info.value) || 0
	info.realValue = 0
	if(this.died){
		return info
	}
	if(this.attInfo.hp + info.value > this.attInfo.maxHP){
		info.realValue = this.attInfo.maxHP - this.attInfo.hp
		this.attInfo.hp = this.attInfo.maxHP
	}else{
		info.realValue = info.value
		this.attInfo.hp += info.value
	}
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	return info
}
//扣除血量
model.prototype.lessHP = function(info,hitFlag) {
	info.id = this.id
	info.value = Math.floor(info.value) || 0
	info.realValue = 0
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	info.curAnger = this.curAnger
	if(this.buffs["chuchen"]){
		this.buffs["chuchen"]["value"] += info.value
		return info
	}
	if(this.died)
		return info
	if(this.attInfo.hp < info.value){
		this.onDie(info)
		info.curAnger = this.curAnger
		info.hp = this.attInfo.hp
		info.maxHP = this.attInfo.maxHP
		return info
	}
	this.attInfo.hp -= info.value
	info.realValue = info.value
	//秒杀判断
	if(this.buffs["chaodu"])
		if(this.getHPRate() < this.buffs["chaodu"].getBuffMul())
			return this.onSeckill(info)
	//受击回怒
	if(hitFlag){
		var tmpHPRate = info.realValue / this.attInfo.maxHP
		this.hp_loss += tmpHPRate
		this.addAnger(Math.floor(tmpHPRate * 80),false)
	}
	if(this.buffs["lowhp_heal"] && this.getHPRate() < 0.3 && this.buffs["lowhp_heal"].enoughCD())
		this.onOtherHeal(this,this.buffs["lowhp_heal"].getBuffMul() * this.fighting.fightInfo[this.rival]["survival"] * this.attInfo.maxHP)
	info.curAnger = this.curAnger
	info.hp = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	return info
}
//被秒杀
model.prototype.onSeckill = function(info) {
	info.id = this.id
	this.onDie(info)
	info.seckill = true
	return info
}
//触发累计血量损失
model.prototype.triggerLossHP = function() {
	if(this.talents.hp_loss_per){
		//血量满足
		if(this.hp_loss > this.talents.hp_loss_per){
			this.hp_loss -= this.talents.hp_loss_per
			if(this.talents.hp_loss_rate && this.fighting.randomCheck(this.talents.hp_loss_rate,"hp_loss_rate")){
				if(this.talents.hp_loss_skill)
					this.fighting.skillManager.useSkill(this.useOtherSkill(this.talents.hp_loss_skill))
			}
			if(this.talents.hp_loss_buff_once){
				this.fighting.buffManager.createBuffByData(this,this,this.talents.hp_loss_buff_once)
				delete this.talents.hp_loss_buff_once
			}
		}
	}
	if(this.buffs["jiuyang"]){
		if(this.hp_loss > 0.3){
			this.hp_loss -= 0.3
			this.fighting.buffManager.createBuff(this,this,{"buffId":"jiuyang_up","value":this.buffs["jiuyang"].getBuffMul(),"duration":2})
		}
	}
	if(this.buffs["wuxiang_pre"]){
		if(this.buffs["wuxiang_pre"].list[0].buff.otps.LOWHP1 && this.getHPRate() < this.buffs["wuxiang_pre"].list[0].buff.otps.LOWHP1){
			delete this.buffs["wuxiang_pre"].list[0].buff.otps.LOWHP1
			this.fighting.buffManager.createBuff(this,this,this.buffs["wuxiang_pre"].list[0].buff.otps.buff)
		}else if(this.buffs["wuxiang_pre"].list[0].buff.otps.LOWHP2 && this.getHPRate() < this.buffs["wuxiang_pre"].list[0].buff.otps.LOWHP2){
			delete this.buffs["wuxiang_pre"].list[0].buff.otps.LOWHP2
			this.fighting.buffManager.createBuff(this,this,this.buffs["wuxiang_pre"].list[0].buff.otps.buff)
		}
	}
}
//复活
model.prototype.revive = function(value) {
	if(!this.died)
		return
	if(this.buffs["not_revived"])
		return
	this.attInfo.hp = value
	this.died = false
	this.fighting.fightInfo[this.belong]["survival"]++
	this.fighting.fightRecord.push({type : "revive",id : this.id,hp : this.attInfo.hp,maxHP:this.attInfo.maxHP})
}
//添加BUFF
model.prototype.createBuff = function(buff) {
	if(!this.buffs[buff.buffId]){
		this.buffs[buff.buffId] = buff
	}
}
//添加1层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(this.buffs[buff.buffId])
		this.buffs[buff.buffId].addBuff(attacker,buff)
}
//移除BUFF
model.prototype.removeBuff = function(buffId) {
    if(this.buffs[buffId])
        delete this.buffs[buffId]
}
//移除一层负面状态
model.prototype.dispelLessBuff = function() {
	for(var i in this.buffs){
		if(this.buffs[i].buffCfg.dispel_less)
			this.buffs[i].delBuff()
	}
}
//驱散一层增益状态
model.prototype.dispelAddBuff = function() {
	for(var i in this.buffs){
		if(this.buffs[i].buffCfg.dispel_add)
			this.buffs[i].delBuff()
	}
}
//===============攻击触发
//触发击杀
model.prototype.onKill = function(target,skill,info) {
	if(this.talents.kill_heal_self)
		this.onOtherHeal(this,this.talents.kill_heal_self * this.getTotalAtt("maxHP"))
	if(this.talents.kill_buff)
		this.fighting.buffManager.createBuffByData(this,this,this.talents.kill_buff)
	if(this.talents.kill_anger)
		this.addAnger(this.talents.kill_anger,true)
	if(this.talents.kill_dps_skill && (target.realm == 2 || target.realm == 4))
		this.fighting.skillManager.useSkill(this.useOtherSkill(this.talents.kill_dps_skill))
	if(this.buffs["chuchen"])
		this.buffs["chuchen"].destroy()
	if(this.buffs["kill_add_normal"] && this.buffs["kill_add_normal"].enoughCount())
		this.fighting.skillManager.useSkill(this.useOtherSkill(this.defaultSkill))
	if(skill.isAnger){
		//技能击杀
		if(this.talents.kill_skill_buff){
			var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents.kill_skill_buff)
			var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
			for(var j = 0;j < buffTargets.length;j++)
				this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
		}
	}else{
		//普攻击杀
		if(this.talents.kill_normal_buff){
			var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents.kill_normal_buff)
			var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
			for(var j = 0;j < buffTargets.length;j++)
				this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
		}
	}
}
//触发闪避
model.prototype.onMiss = function(attacker,info) {
	if(this.talents.miss_buff)
		this.fighting.buffManager.createBuff(this,attacker,this.talents.miss_buff)
}
//触发格挡
model.prototype.onBlock = function(attacker,info) {
	if(this.talents.block_buff1){
		this.fighting.buffManager.createBuff(this,this,this.talents.block_buff1)
		if(this.talents.block_buff2)
			this.fighting.buffManager.createBuff(this,this,this.talents.block_buff2)
	}
}
//触发暴击
model.prototype.onCrit = function(attacker,info) {
	if(attacker.talents.crit_anger)
		attacker.addAnger(attacker.talents.crit_anger,true)
	if(this.talents.crit_buff)
		this.fighting.buffManager.createBuffByData(this,this,this.talents.crit_buff)
}
//===============获取信息
//简单信息
model.prototype.getSimpleInfo = function() {
	var info = {
		id : this.id,
		belong : this.belong,
		index : this.index,
		lv : this.lv,
		maxHP : this.attInfo.maxHP,
		hp : this.attInfo.hp
	}
	return info
}
//详细信息
model.prototype.getFullInfo = function() {
	var info = this.getSimpleInfo()
	info.attInfo = JSON.parse(JSON.stringify(this.attInfo))
	return info
}
//结算信息
model.prototype.getOverData = function() {
	var info = {
		id : this.id,
		maxHP : this.attInfo.maxHP,
		hp : this.attInfo.hp,
		totalDamage : this.totalDamage,
		totalHeal : this.totalHeal
	}
	return info
}
//组装普攻技能
model.prototype.packageDefaultSkill = function() {
	var sid = fightCfg.getCfg("heros")[this.heroId]["defult"]
	var skill = this.packageSkill(sid,0,0,false)
	skill.origin
	return skill
}
//组装怒气技能
model.prototype.packageAngerSkill = function() {
	var sid = fightCfg.getCfg("heros")[this.heroId]["s1"]
	var star = Math.floor(this.otps.s1_star) || 1
	var lv = Math.floor(this.otps.s1_lv) || 0
	if(star > 5)
		star = 5
	var skill = this.packageSkill(sid,star,lv,true,this.otps.skillTalents)
	return skill
}
//回合技能
model.prototype.packageRoundSkill = function(skillId) {
	var skillInfo = fightCfg.getCfg("skills")[skillId]
	var roundSkill = this.packageSkillBySid(skillId)
	roundSkill.NEED_CD = skillInfo.CD || 99
	roundSkill.CUR_CD = 0
	this.roundSkills.push(roundSkill)
}
//组装技能根据ID
model.prototype.packageSkillBySid = function(sid) {
	sid = Number(sid)
	var baseSid = Math.floor(sid/10)*10
	var star = sid % 10
	return this.packageSkill(baseSid,star,0,false)
}
//组装技能
model.prototype.packageSkill = function(baseSid,star,lv,isAnger,talents) {
	var sid = baseSid + star
	var skillCfg = fightCfg.getCfg("skills")[sid]
	if(!skillCfg){
		console.log("技能ID错误 "+baseSid+" "+sid+" star "+star)
		return
	}
	var otps = {sid : baseSid,isAnger : isAnger}
	Object.assign(otps,skillCfg)
	if(otps.atk_basic)
		otps.atk_value = otps.atk_basic * lv
	if(otps.heal_basic)
		otps.heal_value = otps.heal_basic * lv
	talents = talents || {}
	for(var i = 1;i <= star;i++){
		baseSid++
		skillCfg = fightCfg.getCfg("skills")[baseSid]
		if(skillCfg["talentId"]){
			var talentInfo = fightCfg.getCfg("skill_talents")[skillCfg["talentId"]]
			if(talentInfo){
				for(var j = 1;j <= 4;j++){
					var key = talentInfo["key"+j]
					if(key){
						if(talents[key] && Number.isFinite(talents[key]))
							talents[key] += talentInfo["value"+j]
						else
							talents[key] = talentInfo["value"+j]
					}
				}
			}
		}
	}
	return new skill_base(this,otps,talents)
}
//组装自身天赋
model.prototype.packageHeroTalents = function(opts) {
	var talents = opts.heroTalents || {}
	for(var index = 2;index <= 5;index++){
		var talentId = fightCfg.getCfg("heros")[this.heroId]["s"+index]
		for(var i = 1;i <= opts["s"+index+"_star"];i++){
			talentId++
			var talentInfo = fightCfg.getCfg("hero_talents")[talentId]
			if(talentInfo){
				for(var j = 1;j <= 4;j++){
					var key = talentInfo["key"+j]
					if(key){
						if(talents[key] && Number.isFinite(talents[key]))
							talents[key] += talentInfo["value"+j]
						else
							talents[key] = talentInfo["value"+j]
					}
				}
			}
		}
	}
	return talents
}
module.exports = model