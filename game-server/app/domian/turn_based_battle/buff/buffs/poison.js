//中毒伤害
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	if(info.buff.otps.repet_amp && this.list.length > 1)
		info.buff.mul += info.buff.otps.repet_amp
	info.basic = this.fighting.formula.calPoisonDamage(attacker,this.character,info.buff.mul,info.buff.value)
}
//BUFF功能实现
model.prototype.domain = function(){
	var record = {type : "buffDamage",id:this.character.id,value:0,realValue:0,d_type:"mag",bId : this.buffId}
	for(var i = 0;i < this.list.length;i++){
		var info = this.character.onHit(this.list[i].attacker,{value : this.list[i].basic})
		record.value += info.value
		delete info.value
		record = Object.assign(record,info)
	}
	this.fighting.nextRecord.push(record)
	if(this.character.buffs["buff_405073"])
		this.character.lessAnger(this.character.buffs["buff_405073"].getBuffValue() * Math.min(this.list.length,5),true)
}
//引爆一层中毒
model.prototype.breakOnce = function(attacker) {
	var buff = this.list.pop()
	if(buff){
		var record = {type : "buffDamage",id:this.character.id,value:0,realValue:0,d_type:"mag",bId : this.buffId}
		var value = Math.floor(buff.basic * buff.duration)
		if(attacker.talents.amp_poison_break)
			value += Math.floor(value * attacker.talents.amp_poison_break)
		var info = this.character.onHit(attacker,{value : value})
		record.value += info.value
		delete info.value
		record = Object.assign(record,info)
		this.fighting.nextRecord.push(record)
	}
}
module.exports = model