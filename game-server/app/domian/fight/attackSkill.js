var attackSkill = function(opts,character) {
	this.character = character				//所属角色
	this.skillId = opts.skillId 			//技能ID
	this.mul = opts.mul || 1				//技能系数
	this.fixed = opts.fixed	|| 0			//固定伤害
	this.skillCD = opts.skillCD				//技能CD
	this.coolDownTime = 0					//可以使用时间
	this.targetType = opts.targetType || 1  //选取目标类型 1 默认目标 2 血量最少 3 血量最多
}
//更新技能CD
attackSkill.prototype.updateCD = function(curTime) {
	this.coolDownTime = curTime + this.skillCD * 1000
}
//获取冷却时间
attackSkill.prototype.getCoolDownTime = function() {
	return this.coolDownTime
}
//使用技能
attackSkill.prototype.use = function() {
	var target = this.formula.getAttackTarget(this.character,this.character.enemyTeam,this)
	if(!target){
		return {result: "target error", damage: 0};
	}
	//判断命中率
	var missRate = this.character.hitRate * (1 - target.dodgeRate/100) / 100;
	if(Math.random() < missRate){
		return {result: "miss", damage: 0};
	}
	var damageInfo = this.formula.calDamage(this.character, target, this);
	target.hit(this.character, damageInfo);
	//If normal attack, use attack speed
	if (target.died) {
		return {result: "kill", damageInfo: damageInfo};
	} else{
		return {result: "success", damageInfo: damageInfo};
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