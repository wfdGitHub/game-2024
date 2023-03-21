//内功伤害
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	info.basic = this.fighting.formula.calIndirectDamage(attacker,this.character,info.buff.mul,info.buff.value,"mag")
}
//BUFF功能实现
model.prototype.domain = function(){
	var record = {type : "buffDamage",id:this.character.id,value:0,realValue:0,d_type:"mag",bId : this.buffId}
	for(var i = 0;i < this.list.length;i++){
		var info = this.character.onHit(this.list[i].attacker,{value : this.list[i].basic})
		record.value += info.value
		record.realValue += info.realValue
		record.hp = info.hp
		record.maxHP = info.maxHP
		if(info.died)
			record.died = info.died
	}
	this.fighting.fightRecord.push(record)
}
module.exports = model