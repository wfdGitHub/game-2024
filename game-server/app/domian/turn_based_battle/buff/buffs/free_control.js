//团队免控BUFF
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	if(this.extra_buff)
		this.extra_buff = this.fighting.buffManager.getBuffByData(this.extra_buff)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法

//我方成员被控制
model.prototype.teamBeControl = function(target,buffId) {
	if(this.list[0]){
		if(this.fighting.randomCheck(this.list[0].buff.value,"free_control")){
			this.fighting.nextRecord.push({type:"tag",id:target.id,tag:"free_control"})
			target.buffs[buffId].destroy()
			if(this.extra_buff)
				this.fighting.buffManager.createBuff(this.character,target,this.extra_buff)
			this.delBuff()
		}
	}
}
module.exports = model