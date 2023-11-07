//外伤BUFF
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//
model.prototype.addBuff = function(attacker,buff) {
	if(!buff)
		return
	var changeFlag = false
	var count = buff.otps.count || 1
	for(var i = 0;i < count;i++){
		if(this.list.length < this.max_count){
			if(this.character.buffs["buff_405044"] && this.fighting.randomCheck(this.character.buffs["buff_405044"].getBuffMul()))
				continue
			changeFlag = true
			this.list.push({attacker:attacker,buff : buff,duration : buff.duration})
			if(buff.num){
				this.MAX_NUM = buff.num
				this.CUR_NUM = 0
			}
			this.buffOtps(attacker,this.list[this.list.length - 1])
		}
	}
	if(changeFlag)
		this.addRecord({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
}
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	if(info.buff.otps.sexDur && this.character.sex == 2)
		info.duration = info.buff.otps.sexDur
	info.basic = this.fighting.formula.calIndirectDamage(attacker,this.character,info.buff.mul,info.buff.value,"phy")
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
module.exports = model