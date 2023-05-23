//普攻有几率触发技能
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增一层BUFF
model.prototype.buffOtps = function(attacker,buff) {
	this.skill = this.character.packageSkillBySid(buff.otps.sid)
}
module.exports = model