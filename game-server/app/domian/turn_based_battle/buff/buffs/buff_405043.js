//敌方侠客技攻触发,立即恢复自身怒气
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	//监听敌方技能
	fighting.fightInfo[character.rival]["heroAtionMonitor"].push(this.heroAtionMonitor.bind(this))
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//监听技能
model.prototype.heroAtionMonitor = function(attacker,skill) {
	if( this.character.died)
		return
	if(skill.isAnger)
		this.character.addAnger(this.getBuffValue(),true)
}
module.exports = model