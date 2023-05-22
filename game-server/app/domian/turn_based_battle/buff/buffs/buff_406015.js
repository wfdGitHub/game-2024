//人鬼殊途、降低受疗
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.key = "healAdd"
	this.value = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增一层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(!buff)
		return
	if(buff.value < this.value)
		this.value = buff.value
	this.list.push({attacker:attacker,buff : buff,duration : buff.duration})
	this.addRecord({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
}
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(name == this.key)
		return this.value
	return 0
}
module.exports = model