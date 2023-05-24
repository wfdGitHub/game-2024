//中毒伤害
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	info.basic = Math.ceil(attacker.getTotalAtt("atk") * info.buff.mul)
}
//BUFF功能实现
model.prototype.domain = function(){
	var value = 0
	for(var i = 0;i < this.list.length;i++)
		value += this.list[i].basic
	this.character.onOtherHeal(this.character,value)
}
module.exports = model