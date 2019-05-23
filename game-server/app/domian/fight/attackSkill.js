var skills = require("../../../config/fight/skills.json")
var attackSkill = function(opts,character) {
	this.curTime = 0
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
	this.state = false 							 //可用状态
	this.updateCD()
}
//更新技能CD
attackSkill.prototype.updateCD = function() {
	this.coolDownTime = this.curTime + this.skillCD * 1000
	this.state = false 	
}
attackSkill.prototype.updateTime = function(dt) {
	this.curTime += dt
	if(!this.state && this.curTime >= this.coolDownTime){
		this.state = true
	}
}
//获取冷却时间
attackSkill.prototype.getCoolDownTime = function() {
	return this.coolDownTime
}
//检查技能可用
attackSkill.prototype.checkCondition = function(curTime) {
	return this.state
}
//使用技能
attackSkill.prototype.use = function(curTime) {
	if(!this.state){
		return
	}
	this.useSkill()
}
attackSkill.prototype.useSkill = function() {
	var target = this.formula.getAttackTarget(this.character,this.character.enemyTeam,this)
	if(!target){
		console.log("target error")
		return {state: false, damage: 0,target : target,curTime : this.curTime};
	}
	this.updateCD()
	//判断命中率
	var missRate = target.dodgeRate / (this.character.hitRate + 100)
	if(Math.random() < missRate){
		return {state: "miss", damage: 0,curTime : this.curTime,miss : true};
	}
	var damageInfo = this.formula.calDamage(this.character, target, this);
	target.hit(this.character, damageInfo);
	if (target.died) {
		return {state: "kill", damageInfo: damageInfo,target : target,curTime : this.curTime};
	} else{
		return {state: "success", damageInfo: damageInfo,target : target,curTime : this.curTime};
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