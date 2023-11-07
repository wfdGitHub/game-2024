//常规BUFF
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.attKey = "atk"
	this.attBuff = true
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	info.num = 0
	if(info.buff.mul)
		info.num = Math.floor(this.character.attInfo[this.attKey] * info.buff.mul) || 0
	this.fighting.buffManager.createBuff(attacker,attacker,{"buffId":"atk_suck_add","value":-info.num,"duration":info.buff.duration})
}
//获得加成属性
model.prototype.getAttInfo = function(name) {
	if(name == this.attKey){
		var value = 0
		for(var i = 0;i < this.list.length;i++)
			value += this.list[i].num
		return value
	}
	return 0
}
module.exports = model