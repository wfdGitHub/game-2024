//护盾
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	info.num = Number(this.character.getTotalAtt("atk") * info.buff.mul) || 0
}
//抵扣伤害
model.prototype.offsetDamage = function(info) {
	info.hudun = 0
	for(var i = 0;i < this.list.length;i++){
		if(this.list[i].num > info.value){
			this.list[i].num -= info.value
			info.hudun += info.value
			info.value = 0
			break
		}
		info.value -= this.list[i].num
		info.hudun += this.list[i].num
		this.list[i].num = 0
	}
	this.removeZero()
	return info
}
//移除护盾为0的BUFF
model.prototype.removeZero = function() {
	var num = this.list.length
	for(var i = 0;i < this.list.length;i++){
		if(this.list[i].num <= 0){
			this.list.splice(i,1)
			i--
		}
	}
	if(this.list.length <= 0){
		this.destroy()
	}else if(num != this.list.length){
		this.fighting.nextRecord.push({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
	}
}
module.exports = model