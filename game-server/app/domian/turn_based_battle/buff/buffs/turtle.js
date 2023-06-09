//龟息
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.mul = 0
	this.value = 0
	this.switch = false
	this.roundValue = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理
model.prototype.buffOtps = function(attacker,buff) {
	this.mul = buff.mul
	this.value = buff.value
}
//触发龟息
model.prototype.trigger  = function() {
	this.switch = true
	this.roundValue = 0
}
//关闭龟息
model.prototype.close = function() {
	this.switch = false
	this.roundValue = 0
}
//检测复活
model.prototype.checkRev  = function() {
	if(this.switch && this.character.died && this.roundValue >= 5 || this.fighting.randomCheck(this.mul + this.roundValue * 0.05,"turtle")){
		this.character.revive(this.value * this.character.getTotalAtt("maxHP"))
	}
}
//BUFF功能实现
model.prototype.domain = function() {
	if(this.switch)
		this.roundValue++
}
module.exports = model