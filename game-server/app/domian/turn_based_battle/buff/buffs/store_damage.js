//化劲
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//BUFF每回合更新
model.prototype.update = function() {
	this.domain()
	var num = this.list.length
	for(var i = 0;i < this.list.length;i++){
		this.list[i].duration--
		if(this.list[i].duration <= 0){
			//受到真实伤害
			this.character.onOtherDamage(this.list[i].attacker,this.list[i].buff.value)
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
module.exports = model