//九阳真气每叠加1层，效果得到巨大提升，并且同时生效，第一层:受击前，将自身10%攻击转换为护甲;攻击前，将自身20%护甲转换为攻击;第二层:受到外功伤害攻击时，反弹本次遭受的外功伤害20%伤害由敌方全体平均分摊。
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//新增一层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(!buff)
		return
	var max_count = Math.max(this.max_count,buff.max)
	if(this.list.length < max_count){
		this.list.push({attacker:attacker,buff : buff,duration : buff.duration})
		this.buffOtps(attacker,this.list[this.list.length - 1])
		this.addRecord({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
	}
}
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(name == "roundAnger" && this.getCount() >= 3)
		return 20
	return 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
module.exports = model