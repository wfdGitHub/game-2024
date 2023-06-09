//友方技攻追击
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	fighting.heroAtionMonitor.push(this.heroAtionMonitor.bind(this))
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//监听技能
model.prototype.heroAtionMonitor = function(attacker,skill) {
	if(this.character.died || attacker.belong != this.character.belong || attacker.id == this.character.id)
		return
	if(skill.isAnger && this.fighting.randomCheck(this.list[0].buff.mul,"buff_505063"))
		this.fighting.skillManager.useSkill(this.character.useOtherSkillFree(this.character.defaultSkill))
}
//BUFF功能实现
model.prototype.domain = function() {
	if(this.MAX_NUM)
		this.CUR_NUM = 0
}
module.exports = model