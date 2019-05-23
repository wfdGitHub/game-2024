var skills = require("../../../config/fight/skills.json")
var attackSkill = function(opts,character) {
	this.character = character				//所属角色
	this.skillId = opts.skillId 			//技能ID
	var skillInfo = skills[this.skillId]
	if(!skillInfo){
		console.log(new Error("skillInfo not found "+opts.skillId))
	}
	this.name = skillInfo.name					//技能名称
	this.mul = skillInfo.mul || 1				//技能系数
	this.fixed = skillInfo.fixed	|| 0		//固定伤害
	this.skillCD = skillInfo.skillCD			//技能CD
	if(skillInfo.skillCD){
		this.skillCD = skillInfo.skillCD		//技能CD为0时设为攻速			
	}else{
		this.skillCD = this.character.atkSpeed
	}
	this.targetType = skillInfo.targetType || 1  //选取目标类型 1 默认目标 2 血量最少 3 血量最多
	this.coolDownTime = 0					//可以使用时间
	this.updateCD(0)
}
//更新技能CD
attackSkill.prototype.updateCD = function(curTime) {
	this.coolDownTime = curTime + this.skillCD * 1000
}
//获取冷却时间
attackSkill.prototype.getCoolDownTime = function() {
	return this.coolDownTime
}
//检查技能可用
attackSkill.prototype.checkCondition = function(curTime) {
	if(curTime >= this.coolDownTime){
		return true
	}else{
		return false
	}
}
//使用技能
attackSkill.prototype.use = function(curTime) {
	var target = this.formula.getAttackTarget(this.character,this.character.enemyTeam,this)
	if(!target){
		console.log("target error")
		return {result: "target error", damage: 0,target : target};
	}
	this.updateCD(curTime)
	//判断命中率
	var missRate = target.dodgeRate / (this.character.hitRate + 100)
	if(Math.random() < missRate){
		return {result: "miss", damage: 0};
	}
	var damageInfo = this.formula.calDamage(this.character, target, this);
	target.hit(this.character, damageInfo);
	if (target.died) {
		return {result: "kill", damageInfo: damageInfo,target : target};
	} else{
		return {result: "success", damageInfo: damageInfo,target : target};
	}
}
module.exports = {
	id : "attackSkill",
	func : attackSkill,
	args : [{
		name : "opts",
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