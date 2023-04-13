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
	//回合技能
	if(this.talents.round_skill)
		this.packageRoundSkill(this.talents.round_skill)
	//首次攻击技能
	if(this.talents.first_atk_skill)
		this.talents.first_atk_skill = this.packageSkill(this.talents.first_atk_skill,this.talents.first_atk_star,0,false)
	//攻击触发技能 30%
	if(this.talents.atk_skill){
		var atk_skill = this.packageSkill(this.talents.atk_skill,this.talents.atk_star,0,false)
		atk_skill.rate = 0.3
		this.defaultSkill.laterSkill = atk_skill
		this.angerSkill.laterSkill = atk_skill
	}
	//========初始BUFF
	for(var i = 1;i <= 3;i++){
		if(this.talents["begin_buff"+i]){
			var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents["begin_buff"+i])
			var buffTargets = this.fighting.locator.getBuffTargets(this,tmpBuff.targetType,[])
			for(var j = 0;j < buffTargets.length;j++)
				this.fighting.buffManager.createBuff(this,buffTargets[j],tmpBuff)
		}
		if(this.talents["first_buff"+i])
			this.fighting.buffManager.createBuffByData(this,this,this.talents["first_buff"+i])
		if(this.talents["skill_buff"+i]){
			var tmpBuff = this.fighting.buffManager.getBuffByData(this.talents["skill_buff"+i])
			this.angerSkill.buffs[tmpBuff.buffId] = tmpBuff
		}
	}
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
	if(this.talents.realm_add_buff){
		var targets = this.fighting.locator.getTargets(this,"same_realm")
		for(var i = 0;i < targets.length;i++)
			this.fighting.buffManager.createBuffByData(this,targets[i],this.talents.realm_add_buff)
	}
	this.attInfo.hp = this.attInfo.maxHP
	this.attInfo.speed += this.attInfo.main_hit
}
//===================生命周期
//个人回合开始
model.prototype.before = function() {
	this.isAction = true
	this.onAction = true
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
}
//个人回合结束
model.prototype.after = function() {
	this.onAction = false
}
//整体回合开始
model.prototype.roundBegin = function() {
	this.isAction = false
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
	this.curAnger -= Math.floor(value) || 0
	this.curAnger = Math.max(this.curAnger,0)
	if(show)
		this.fighting.fightRecord.push({type : "changeAnger",id : this.id,changeAnger : -value,curAnger : this.curAnger})
	return value
}
//选择技能
model.prototype.chooseSkill = function() {
	if(this.died || this.checkForceControl())
		return false
	if(!this.fighting.locator.existsTarget(this))
		return false
	var skill = false
	if(this.curAnger >= this.needAnger)
		skill = this.useAngerSkill()
	if(!skill)
		skill = this.useNormalSkill()
	return skill
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
//消耗全部怒气再次使用技能，基础伤害50%
model.prototype.useAllAangerSkill = function() {
	if(this.checkUseSkill())
		return false
	var needAnger = this.needAnger
	var needValue = 0
	var info = {}
	info.skill = this.angerSkill
	info.mul = 0.5
	if(info.skill.talents.kill_repet)
		info.mul += Math.floor(info.curAnger * info.skill.talents.kill_repet)
	info.changeAnger = -this.lessAnger(this.curAnger)
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
//检查可行动
model.prototype.checkAction = function() {
	if(this.died || this.isAction || this.checkTotem())
		return false
	else
		return true
}
//检查可使用技能
model.prototype.checkUseSkill = function() {
	if(this.died || this.buffs["silence"] || this.checkForceControl())
		return true
	else
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
	if(this.buffs["petrify"] || this.buffs["frozen"])
		return true
	else
		return false
}
//检查被控制
model.prototype.checkControl = function() {
	if(this.checkForceControl() || this.buffs["disarm"] || this.buffs["silence"])
		return true
	else
		return false
}
//检查图腾状态
model.prototype.checkTotem = function(argument) {
	if(this.buffs["jianren"] || this.buffs["totem_friend_amp"])
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
	this.lessHP(info,hitFlag)
	//秒杀判断
	if(hitFlag && attacker.talents.hp_seckill && (this.attInfo.hp / this.attInfo.maxHP) < attacker.talents.hp_seckill)
		this.onSeckill(info)
	attacker.totalDamage += info.realValue
	return info
}
//受到攻击前
model.prototype.onHitBefore = function(attacker,skill) {
	if(this.buffs["mag_hitDef"] && attacker.buffs["mag_damage"])
		this.changeTotalTmp("hitDef",this.buffs["mag_hitDef"].getBuffMul())
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
	//回血
	if(this.buffs["jianren"])
		this.onOtherHeal(this,this.buffs["jianren"].getBuffMul() * info.realValue)
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
		if(i != "not_revived")
			this.buffs[i].destroy()
	this.fighting.fightInfo[this.belong]["survival"]--
}
//濒死触发
model.prototype.onWillDie = function(info) {
	if(this.buffs["vital_point"])
		return false
	if(this.talents.willdie_ime_count && this.fighting.randomCheck(this.talents.willdie_ime_rate,"willdie_ime_rate")){
		this.talents.willdie_ime_count--
		this.attInfo.hp = 1
		info.realValue = this.attInfo.hp
		this.fighting.nextRecord.push({type:"tag",id:this.id,tag:"one_hp"})
		if(this.talents.willdie_ime_buff){
			this.fighting.buffManager.createBuffByData(this,this,this.talents.willdie_ime_buff)
		}
		return true
	}
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
	if(this.died)
		return info
	if(this.attInfo.hp < info.value){
		this.onDie(info)
	}else{
		this.attInfo.hp -= info.value
		info.realValue = info.value
		//受击回怒
		if(hitFlag){
			var tmpHPRate = info.realValue / this.attInfo.maxHP
			this.hp_loss += tmpHPRate
			this.addAnger(Math.floor(tmpHPRate * 80),false)
		}
	}
	//秒杀判断
	if(this.buffs["chaodu"])
		if((this.attInfo.hp / this.attInfo.maxHP) < this.buffs["chaodu"].getBuffMul())
			return this.onSeckill(info)
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
		}
	}
	if(this.buffs["jiuyang"]){
		if(this.hp_loss > 0.3){
			this.hp_loss -= 0.3
			this.fighting.buffManager.createBuff(this,this,{"buffId":"jiuyang_up","value":this.buffs["jiuyang"].getBuffMul(),"duration":2})
		}
	}
}
//复活
model.prototype.resurgence = function(attacker,info) {
	if(!this.died)
		return
	if(this.buffs["not_revived"])
		return
	this.fighting.fightInfo[this.belong]["survival"]++
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
//===============攻击触发
//触发击杀
model.prototype.onKill = function(target,info) {
	if(this.talents.kill_heal_self)
		this.onOtherHeal(this,this.talents.kill_heal_self * this.getTotalAtt("maxHP"))
	if(this.talents.kill_buff)
		this.fighting.buffManager.createBuffByData(this,this,this.talents.kill_buff)
	if(this.talents.kill_anger)
		this.addAnger(this.talents.kill_anger,true)
	
}
//触发闪避
model.prototype.onDodge = function(attacker,info) {}
//触发格挡
model.prototype.onBlock = function(attacker,info) {}
//触发暴击
model.prototype.onCrit = function(attacker,info) {}
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
	return this.packageSkill(sid,0,0,false)
}
//组装怒气技能
model.prototype.packageAngerSkill = function() {
	var sid = fightCfg.getCfg("heros")[this.heroId]["s1"]
	var star = Math.floor(this.otps.s1_star) || 1
	var lv = Math.floor(this.otps.s1_lv) || 0
	if(star > 5)
		star = 5
	return this.packageSkill(sid,star,lv,true,this.otps.skillTalents)
}
//回合技能
model.prototype.packageRoundSkill = function(skillId) {
	var skillInfo = fightCfg.getCfg("round_skill")[skillId]
	var roundSkill = this.packageSkill(skillInfo.baseSid,skillInfo.star,0,false)
	roundSkill.NEED_CD = skillInfo.CD
	roundSkill.CUR_CD = 0
	this.roundSkills.push(roundSkill)
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