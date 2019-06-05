var skills = require("../../../config/fight/skills.json")
var buffs = require("../../../config/fight/buffs.json")
var attackSkill = function(otps,character) {
	this.character = character				//所属角色
	this.skillId = otps.skillId 			//技能ID
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
	this.targetType = skillInfo.targetType || 1  //选取目标类型 1 默认目标 2 血量最少 3 血量最多
	this.coolDownTime = 0						 //剩余冷却时间
	this.state = false 							 //可用状态
	this.updateCD()
}
//更新技能CD
attackSkill.prototype.updateCD = function() {
	this.coolDownTime = this.skillCD * 1000
	this.state = false
}
attackSkill.prototype.updateTime = function(dt) {
	if(!this.state){
		this.coolDownTime -= dt
		if(this.coolDownTime <= 0){
			this.coolDownTime = 0
			this.state = true
			if(!this.defaultSkill){
				this.use()
			}
		}
	}
}
//获取冷却时间
attackSkill.prototype.getCoolDownTime = function() {
	return this.coolDownTime
}
//检查技能可用
attackSkill.prototype.checkCondition = function() {
	return this.state
}
//使用技能
attackSkill.prototype.use = function() {
	//技能未达成或处于眩晕状态不能使用
	if(!this.state || this.character.banUse()){
		return
	}
	this.state = false
	this.character.fighting.skillList.push(this)
}
attackSkill.prototype.useSkill = function() {
	var targets = this.formula.getAttackTarget(this.character,this.character.enemyTeam,this)
	if(!targets){
		console.log("targets error")
		return {state: false,targets : targets};
	}else{
		this.updateCD()
		var self = this
		targets.forEach(function(target) {
			//技能伤害
			//判断命中率
			var missRate = target.dodgeRate / (self.character.hitRate + 100)
			if(Math.random() < missRate){
				return {state: "miss", damage: 0,miss : true};
			}
			var damageInfo = self.formula.calDamage(self.character, target, self);
            target.hit(self.character, damageInfo,self);
			//施加BUFF
			// console.log(self.buffId,typeof(self.buffId))
			if(typeof(self.buffId) === "number"){
				var buffotps = buffs[self.buffId]
				buffotps.buffId = self.buffId
				buffotps.buffArg = self.buffArg
				buffotps.duration = self.duration
				target.addBuff(self.character,buffotps)
			}
		})
		return {state: true,targets : targets};
	}
}
module.exports = {
	id : "attackSkill",
	func : attackSkill,
	args : [{
		name : "otps",
		type : "Object"
	},{
		name : "character",
		type : "Object"
	}],
	props : [{
		name : "formula",
		ref : "formula"
	}],
	scope : "prototype"
}