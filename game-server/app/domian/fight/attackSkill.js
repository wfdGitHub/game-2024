var formula = require("./formula.js")
var skills = require("../../../config/gameCfg/skills.json")
var buffs = require("../../../config/gameCfg/buffs.json")
var attackSkill = function(otps,character) {
    this.character = character                //所属角色
    this.skillId = otps.skillId             //技能ID
    this.type = "skill"
    var skillInfo = skills[this.skillId]
    this.buffId = skillInfo.buffId
    this.buffArg = skillInfo.buffArg
    this.duration = skillInfo.duration
    this.buffRate = skillInfo.buffRate
    if(!skillInfo){
        console.log(new Error("skillInfo not found "+otps.skillId))
    }
	this.name = skillInfo.name					//技能名称
	this.mul = skillInfo.mul || 1				//技能系数
	this.fixed = skillInfo.fixed	|| 0		//固定伤害
	this.skillCD = skillInfo.skillCD			//技能CD
	this.defaultSkill = false					//普攻技能
	if(skillInfo.skillCD){
		this.skillCD = skillInfo.skillCD		//技能CD为0时设为攻速			
	}else{
		this.skillCD = this.character.atkSpeed
	}
	this.targetType = skillInfo.targetType || 1  //选取目标类型 1 默认目标 2 血量最少 3 血量最多 4 随机三个目标
	this.coolDownTime = 0						 //剩余冷却时间
	this.state = false 							 //可用状态
}
//更新技能CD
attackSkill.prototype.updateCD = function(time) {
    this.coolDownTime = time || this.skillCD * 1000
	this.state = false
	this.character.event.emit("updateCD",this)
}
attackSkill.prototype.updateTime = function(dt) {
	if(!this.state){
		this.coolDownTime -= dt
		if(this.coolDownTime <= 0){
			this.coolDownTime = 0
			this.state = true
			this.character.event.emit("skillReady",this)
			if(!this.defaultSkill && this.character.characterType == "mob"){
				console.log("技能准备好",this.character.characterType)
				this.use()
			}
		}
		this.character.event.emit("skillUpdate",this)
	}
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
	this.state = false
	this.character.fighting.skillList.push(this)
	return true
}
attackSkill.prototype.useSkill = function() {
	var result = {state: false}
	var targets = formula.getAttackTarget(this.character,this.character.enemyTeam,this)
	if(!targets){
		console.log("targets error")
		// this.character.event.emit("useSkill",this,result)
	}else{
		this.updateCD()
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
            if(typeof(self.buffId) === "number"){
            	//计算命中率
                var buffotps = buffs[self.buffId]
                buffotps.buffId = self.buffId
                buffotps.buffArg = self.buffArg
                buffotps.duration = self.duration
                buffotps.buffRate = self.buffRate
                target.addBuff(self.character,buffotps)
            }else if(!damageInfo.miss && self.character.passiveBuffs.length){
            	// console.log(self.character.passiveBuffs)
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
module.exports = attackSkill