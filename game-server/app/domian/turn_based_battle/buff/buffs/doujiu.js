//普攻优先选择斗酒目标
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.target = this.fighting.locator.getTargets("enemy_maxAtk_1")[0]
	this.skillMul = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理
model.prototype.buffOtps = function(attacker,info) {
	this.skillMul = info.buff.skillMul || 0
}
module.exports = model