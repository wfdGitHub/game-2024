//单次技伤减免提升
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//获得加成属性
model.prototype.getAttInfo = function(name) {
	if(name == this.attKey){
		var value = 0
		for(var i = 0;i < this.list.length;i++)
			value += this.list[i].buff.value
		this.destroy()
		return value
	}
	return 0
}
module.exports = model