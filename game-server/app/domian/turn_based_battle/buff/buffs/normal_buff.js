//常规BUFF
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
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
	if(info.buff.cd){
		this.NEED_CD = info.buff.cd
		this.CUR_CD = 0
	}
}
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(this.attKeys[name] !== undefined){
		var value = 0
		for(var i = 0;i < this.list.length;i++){
			value += this.attKeys[name]
			value += this.list[i].num
		}
		if(this.buffCfg.once)
			this.destroy()
		return value
	}
	return 0
}
//BUFF功能实现
model.prototype.domain = function() {
	if(this.NEED_CD){
		this.CUR_CD--
		if(this.CUR_CD < 0)
			this.CUR_CD = 0
	}
}
module.exports = model