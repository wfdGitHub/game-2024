//血量越少，攻击越高
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.attKey = "atk"
	this.attBuff = true
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//获得加成属性
model.prototype.getAttInfo = function(name) {
	if(name == this.attKey)
		return this.character.getHPRate() * this.getBuffValue()
	return 0
}
module.exports = model