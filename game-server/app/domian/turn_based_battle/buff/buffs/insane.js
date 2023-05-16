//[疯癫]状态，免疫[冰冻]和[石化]，并为随机敌方侠客标记[追杀]，使自身所有攻击均优先攻击[追杀] 目标
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.target = this.fighting.locator.getTargets(this.character,"enemy_1")[0]
	this.fighting.buffManager.createBuff(this.character,this.character,{"buffId":"petrifyDef","mul":1,"duration":99})
	this.fighting.buffManager.createBuff(this.character,this.character,{"buffId":"frozenDef","mul":1,"duration":99})
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
module.exports = model