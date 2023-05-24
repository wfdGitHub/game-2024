//其他侠客攻击时为自己添加BUFF
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	//监听敌方技能
	fighting.heroAtionMonitor.push(this.heroAtionMonitor.bind(this))
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//监听技能
model.prototype.heroAtionMonitor = function(attacker,skill,targets) {
	if( this.character.died)
		return
	if(attacker != this.character)
		this.character.fighting.buffManager.createBuffByData(this.character,this.character,this.list[0].buff.otps.extra_buff)
}
module.exports = model