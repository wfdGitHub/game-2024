//技能基类 伤害  治疗  BUFF
var model = function(character,otps,talentList) {
	otps = otps || {}
	this.character = character
	//伤害参数
	this.atk_mul = otps["atk_mul"] || 0
	this.atk_value = otps["atk_value"] || 0
	this.atk_aim = otps["atk_aim"] || 0
	//治疗参数
	this.heal_mul = otps["heal_mul"] || 0
	this.heal_value = otps["heal_value"] || 0
	this.heal_aim = otps["heal_aim"] || 0
	this.buffs = []
}
//技能初始化
model.prototype.init = function() {}
//使用技能
model.prototype.useSkill = function() {
	this.before()
}
//使用技能前
model.prototype.before = function() {
	this.action()
}
//技能效果
model.prototype.action = function() {
	if(this.atk_mul){
		
	}
	this.after()
}
//使用技能后
model.prototype.after = function() {

}


//伤害技能
model.prototype.skillAttack = function() {
	
}
//治疗技能
model.prototype.skillheal = function() {

}
//BUFF判断
model.prototype.skillBuff = function() {

}
module.exports = model