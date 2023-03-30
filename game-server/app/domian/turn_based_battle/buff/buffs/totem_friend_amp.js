//弹奏百鸟朝风。弹奏期间，自身无法行动，增加友方除自己外全体侠客伤害增加，同时自身免疫控制 (眩晕、石化、冰冻、魅惑、沉默、束缚)，但无法恢复怒气，受到的普攻伤害翻倍
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//为友方添加增伤BUFF
model.prototype.buffOtps = function(attacker,info) {
	var targets = this.fighting.locator.getTargets(this.character,"team_friend")
	for(var i = 0;i < targets.length;i++)
		this.fighting.buffManager.createBuff(attacker,targets[i],{"buffId":"totem_amp","value":info.buff.value,"duration":info.buff.duration})
}
//死亡后取消友方BUFF
model.prototype.bufflLater = function() {
	var targets = this.fighting.locator.getTargets(this.character,"team_friend")
	for(var i = 0;i < targets.length;i++)
		if(targets[i].buffs["totem_amp"])
			targets[i].buffs["totem_amp"].destroy()
}
module.exports = model