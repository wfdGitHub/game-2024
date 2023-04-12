//低血量攻击加成
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.attKey = "atk"
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	info.num = 0
	if(info.buff.mul)
		info.num = Number(this.character.attInfo[this.attKey] * info.buff.mul) || 0
}
//获得加成属性
model.prototype.getAttInfo = function(name) {
	if(name == this.attKey){
		if((this.character.attInfo.hp / this.character.attInfo.maxHP) < 0.3){
			var value = 0
			for(var i = 0;i < this.list.length;i++)
				value += this.list[i].num
			return value
		}
	}
	return 0
}
module.exports = model