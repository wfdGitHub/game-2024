//气系复活
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.always_num = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增一层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(!buff)
		return
	this.always_num = buff.otps.num
	this.list.push({attacker:attacker,buff : buff,duration : buff.duration})
	this.addRecord({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
}
module.exports = model