//外伤BUFF
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	this.attacker = attacker
	this.attacker.aim = this.character
	this.buff = info.buff
	info.basic = this.fighting.formula.calIndirectDamage(attacker,this.character,info.buff.mul,0,"phy")
}
//BUFF功能实现
model.prototype.domain = function(){
	var record = {type : "buffDamage",id:this.character.id,value:0,realValue:0,d_type:"phy",bId : this.buffId}
	for(var i = 0;i < this.list.length;i++){
		var info = this.character.onHit(this.list[i].attacker,{value : this.list[i].basic})
		record.value += info.value
		delete info.value
		record = Object.assign(record,info)
	}
	this.fighting.nextRecord.push(record)
}
//BUFF消失后转移
model.prototype.bufflLater = function() {
	var targets = this.fighting.locator.getTargets(this.attacker,"enemy_back_rand_1")
	if(targets[0])
		this.fighting.buffManager.createBuff(this.attacker,targets[0],this.buff)
}
module.exports = model