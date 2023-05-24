//减伤、每被攻击一次效果降低,不可叠加
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.key = "ampDef"
	this.attBuff = true
	this.value = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
model.prototype.buffOtps = function(attacker,info) {
	this.value = info.buff.value
}
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(name == this.key){
		var value = this.value * 0.05
		this.value -= 1
		if(this.value <= 0)
			this.destroy()
		return this.value * 0.05
	}
	return 0
}
module.exports = model