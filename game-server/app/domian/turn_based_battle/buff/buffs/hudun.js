//护盾
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.anger = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	info.hp = 0
	if(info.buff.mul)
		info.hp += Math.floor(this.character.getTotalAtt("atk") * info.buff.mul) || 0
	if(info.buff.otps.maxHP_mul)
		info.hp +=  Math.floor(this.character.getTotalAtt("maxHP") * info.buff.otps.maxHP_mul) || 0
	//info.buff.turn 治疗转盾
	if(this.character.buffs["hunyuan"] && !info.buff.turn)
		info.hp += Math.floor(info.hp * this.character.buffs["hunyuan"].getBuffMul())
	if(info.buff.otps.anger)
		this.anger = info.buff.otps.anger
}
//抵扣伤害
model.prototype.offsetDamage = function(info) {
	info.hudun = 0
	for(var i = 0;i < this.list.length;i++){
		if(this.list[i].hp > info.value){
			this.list[i].hp -= info.value
			info.hudun += info.value
			info.value = 0
			break
		}
		info.value -= this.list[i].hp
		info.hudun += this.list[i].hp
		this.list[i].hp = 0
	}
	this.removeZero()
	return info
}
//移除护盾为0的BUFF
model.prototype.removeZero = function() {
	var num = this.list.length
	for(var i = 0;i < this.list.length;i++){
		if(this.list[i].hp <= 0){
			this.list.splice(i,1)
			i--
		}
	}
	if(this.list.length <= 0){
		this.destroy()
	}else if(num != this.list.length){
		this.addRecord({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
	}
}
//buff结算后
model.prototype.bufflLater = function() {
	if(this.anger && this.character.checkAim())
		this.character.addAnger(this.anger,true,true)
}
module.exports = model