var formula = require("./formula.js")
var skills = require("../../../config/fight/skills.json")
var buffs = require("../../../config/fight/buffs.json")
var attackSkill = function(otps,character) {
    this.character = character                //所属角色
    this.skillId = otps.skillId             //技能ID
    this.type = "skill"
    var skillInfo = skills[this.skillId]
    this.buffId = skillInfo.buffId
    this.buffArg = skillInfo.buffArg
    this.duration = skillInfo.duration
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
attackSkill.prototype.updateCD = function() {
	this.coolDownTime = this.skillCD * 1000
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
		targets.forEach(function(target) {
			//判断命中率
			var missRate = target.dodgeRate / (self.character.hitRate + 100)
            if(self.character.fighting.seeded.random() < missRate){
				var damageInfo = {damage: 0,miss : true};
				target.event.emit("hit",self.character,damageInfo,self)
			}else{
				var damageInfo = formula.calDamage(self.character, target, self);
				target.hit(self.character,damageInfo,self);
			}
            //施加BUFF
            if(typeof(self.buffId) === "number"){
                var buffotps = buffs[self.buffId]
                buffotps.buffId = self.buffId
                buffotps.buffArg = self.buffArg
                buffotps.duration = self.duration
                target.addBuff(self.character,buffotps)
            }
		})
	}
}
module.exports = attackSkill