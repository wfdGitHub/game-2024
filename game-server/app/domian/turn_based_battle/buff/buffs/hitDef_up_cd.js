//每隔一段时间闪避提升
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.NEED_CD = 0
	this.CUR_CD = 0
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理
model.prototype.buffOtps = function(attacker,buff) {
	this.NEED_CD = buff.cd
}
//BUFF功能实现
model.prototype.domain = function(){
	this.CUR_CD--
	if(this.CUR_CD < 0)
		this.CUR_CD = 0
}
//获得加成属性
model.prototype.getAttInfo = function(name) {
	if(name == this.attKey && this.CUR_CD == 0){
		this.CUR_CD = this.NEED_CD
		return this.list[0].buff.value
	}
	return 0
}
module.exports = model