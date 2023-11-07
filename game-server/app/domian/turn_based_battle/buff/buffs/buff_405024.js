//概率复活，恢复怒气
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
model.prototype.trigger = function() {
	this.character.revive(0.6 * this.character.attInfo.maxHP)
	this.character.addAnger(100,true)
}
module.exports = model