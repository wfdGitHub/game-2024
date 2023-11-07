//受击触发，对攻击者造成友方存活侠客总攻击一定比例的真实伤害，每回合至多触发一定次数
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.value = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
model.prototype.domain = function() {
	this.value = 0
}
//反伤
model.prototype.rebound = function(attacker) {
	if(attacker.checkAim() && this.value < this.list[0].buff.value){
		this.value++
		var allAtk = 0
		var team = this.fighting.locator.getTeamAll(this.character)
		for(var i = 0;i < team.length;i++)
			allAtk += team[i].getTotalAtt("atk")
		attacker.onOtherDamage(this.character,this.list[0].buff.mul * allAtk)
	}
}
module.exports = model