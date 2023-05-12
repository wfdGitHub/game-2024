//每回合开始时，友方每有1名侠客存活，提升友方全体属性。
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	if(this.extra_buff)
		this.extra_buff = this.fighting.buffManager.getBuffByData(this.extra_buff)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增一层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(!buff)
		return
	for(var i = 0;i < buff.otps.count;i++){
		if(this.list.length < this.max_count){
			this.list.push({attacker:attacker,buff : buff,duration : buff.duration})
		}
	}
	this.addRecord({type : "buffAdd",id : this.character.id,bId : this.buffId,num:this.list.length})
}
module.exports = model