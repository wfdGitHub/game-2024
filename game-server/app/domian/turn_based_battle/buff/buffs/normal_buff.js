//常规BUFF
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId)
	this.attKeys = {}
	for(var i = 1;i <= 3;i++)
		if(this.fighting.buffManager.buffCfg[this.buffId]["attKey"+i])
			this.attKeys[this.fighting.buffManager.buffCfg[this.buffId]["attKey"+i]] = this.fighting.buffManager.buffCfg[this.buffId]["attValue"+i] || 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	info.num = 0
	if(info.buff.mul)
		info.num = Number(this.character.attInfo[this.attKey] * info.buff.mul) || 0
	if(info.buff.value)
		info.num += Number(info.buff.value) || 0
}
//获得加成属性
model.prototype.getAttInfo = function(name) {
	if(this.attKeys[name] !== undefined){
		var value = this.attKeys[name]
		for(var i = 0;i < this.list.length;i++)
			value += this.list[i].num
		return value
	}
	return 0
}
module.exports = model