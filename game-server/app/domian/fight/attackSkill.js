var formula = require("./formula.js")
var skills = require("../../../config/gameCfg/skills.json")
var buffs = require("../../../config/gameCfg/buffs.json")
var attackSkill = function(otps,character) {
    this.character = character                //所属角色
    this.skillId = otps.skillId             //技能ID
    this.type = "skill"
    var skillInfo = skills[this.skillId]
    if(skillInfo.buffId){
    	if(buffs[skillInfo.buffId]){
		    this.buffId = skillInfo.buffId
		    this.buffArg = skillInfo.buffArg
		    this.duration = skillInfo.duration
		    this.buffRate = skillInfo.buffRate
    	}else{
    		console.error("buffId not find "+skillInfo.buffId)
    	}
    }
    if(!skillInfo){
        console.error("skillInfo not found "+otps.skillId)
    }
	this.name = skillInfo.name					//技能名称
	this.mul = skillInfo.mul || 0				//技能系数
	this.fixed = skillInfo.fixed || 0			//固定伤害
	this.skillCD = skillInfo.skillCD			//技能CD
	this.skillType = skillInfo.skillType  		//技能类型 hurt 伤害技能 recover 恢复技能
	this.defaultSkill = false					//普攻技能
	this.angerSkill = skillInfo.anger || false	//怒气技能
	if(skillInfo.skillCD){
		this.skillCD = skillInfo.skillCD		//技能CD为0时设为攻速			
	}else{
		this.skillCD = this.character.atkSpeed
	}
	this.skillCD *= 1000
	this.targetType = skillInfo.targetType || "normal"  //选取目标类型 normal 默认目标 minhp 血量最少 maxhp 血量最多 rand3 随机三个目标 all 全体 rand1 随机单体 self 自身
	this.coolDownTime = 0						 //剩余冷却时间
	this.state = false 							 //可用状态
}
//更新技能CD
attackSkill.prototype.updateCD = function(dt) {
	this.coolDownTime = this.skillCD
	if(dt){
		this.coolDownTime += parseInt(dt) || 0
	}
	this.state = false
	this.character.event.emit("updateCD",this)
}
//减少技能CD
attackSkill.prototype.lessenCD = function(dt) {
	if(!this.state){
		this.coolDownTime -= dt
		if(this.coolDownTime <= 0){
			this.coolDownTime = 0
			this.state = true
			this.character.event.emit("skillReady",this)
			if(!this.defaultSkill && (this.character.fighting.auto || this.character.characterType == "mob")){
				this.use()
			}
		}
		this.character.event.emit("skillUpdate",this)
	}
}
//时间步进器
attackSkill.prototype.updateTime = function(dt) {
	this.lessenCD(dt)
}
//获取冷却时间
attackSkill.prototype.getCoolDownTime = function() {
	return this.coolDownTime
}
//检查是否可使用
attackSkill.prototype.checkCondition = function() {
	return this.state
}
//使用技能
attackSkill.prototype.use = function() {
    if(!this.state || this.character.banUse()){
		this.character.event.emit("useSkillError",this)
		return false
	}
	if(this.angerSkill){
		this.character.resetAngerSkill()
	}
	this.state = false
	this.character.fighting.skillList.push(this)
	return true
}
attackSkill.prototype.useSkill = function() {
	if(this.angerSkill){
		this.character.resetAngerSkill()
	}else{
		this.updateCD()
	}
	if(this.skillType == "hurt"){
		this.useHurtSkill()
	}else if(this.skillType == "recover"){
		this.useRecoverSkill()
	}else{
		console.error("useSkill error  skillType "+this.skillType)
	}
}
//伤害技能
attackSkill.prototype.useHurtSkill = function() {
	var result = {state: false}
	var targets = formula.getAttackTarget(this.character,this.character.enemyTeam,this)
	if(!targets){
		// this.character.event.emit("useSkill",this,result)
	}else{
		var self = this
		result = {state: false,targets : targets};
		this.character.event.emit("useSkill",this,result)
		var doubleFlag = false
		//判断连击
		if(self.character.doubleHitRate && self.character.doubleHitRate < self.character.fighting.seeded.random()){
			doubleFlag = true
		}
		targets.forEach(function(target) {
			//判断命中率
			var damageInfo = formula.calDamage(self.character, target, self);
			if(damageInfo.miss){
				target.event.emit("hit",self.character,damageInfo,self)
			}else{
				target.hit(self.character,damageInfo,self);
				if(doubleFlag){
					damageInfo.damage = Math.round(damageInfo.damage * self.character.doubleHitPower)
					damageInfo.double = true
					target.hit(self.character,damageInfo,self);
				}
			}
            //施加BUFF
            if(self.buffId){
                var buffotps = buffs[self.buffId]
                buffotps.buffId = self.buffId
                buffotps.buffArg = self.buffArg
                buffotps.duration = self.duration
                buffotps.buffRate = self.buffRate
                target.addBuff(self.character,buffotps)
            }else if(!damageInfo.miss && self.character.passiveBuffs.length){
            	for(var i = 0;i < self.character.passiveBuffs.length;i++){
            		var buffotps = buffs[self.character.passiveBuffs[i].buffId]
	                buffotps.buffId = self.character.passiveBuffs[i].buffId
	                buffotps.duration = self.character.passiveBuffs[i].duration
	                buffotps.buffRate = self.character.passiveBuffs[i].buffRate
	                buffotps.buffArg = 0
	                if(self.character.passiveBuffs[i].power && damageInfo.damage){
	                	buffotps.buffArg = Math.round(self.character.passiveBuffs[i].power * damageInfo.damage)
	                }
	                target.addBuff(self.character,buffotps)
            	}
            }
		})
	}
}
//恢复技能
attackSkill.prototype.useRecoverSkill = function() {
	var self = this
	var targets = formula.getAttackTarget(self.character,self.character.myTeam,self)
	var result = {state: false,targets : targets};
	self.character.event.emit("useSkill",self,result)
	targets.forEach(function(target) {
		var value = Math.round(self.mul * target.maxHP + self.fixed)
		target.recoverHp(value)
		//施加BUFF
		if(self.buffId){
			var buffotps = buffs[self.buffId]
			if(buffotps){
		        buffotps.buffId = self.buffId
		        buffotps.buffArg = self.buffArg
		        buffotps.duration = self.duration
		        buffotps.buffRate = self.buffRate
		        target.addBuff(self.character,buffotps)
			}else{
				console.error("buffotps error buffId "+buffId)
			}
		}
	})
}
module.exports = attackSkill