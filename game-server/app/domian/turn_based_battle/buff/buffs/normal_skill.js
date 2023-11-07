//普攻有几率触发技能
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增一层BUFF
model.prototype.buffOtps = function(attacker,info) {
	this.skill = this.character.packageSkillBySid(info.buff.otps.sid)
	this.skill.no_combo = true
}
module.exports = model