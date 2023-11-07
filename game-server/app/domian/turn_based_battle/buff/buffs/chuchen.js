//驱散所有异常状态并且在状态结束前免疫控制，本次溢出的伤害和后续受到的伤害在下次攻击后结算，若在[出尘]状态下击杀敌方侠客，则移除[出尘]时受到的伤害
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.value = 0
	character.dispelControl()
	character.dispelAdd()
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
module.exports = model