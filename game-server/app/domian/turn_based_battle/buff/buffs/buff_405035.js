//中毒减疗
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(name == "healAdd"){
		if(this.character.buffs["poison"])
			return this.list[0].buff.value
	}
	return 0
}
module.exports = model