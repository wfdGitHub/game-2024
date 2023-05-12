//自身血量高于50%时，攻击提升6%,自身血量低于50%时，减伤提升6%
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//获得加成属性
model.prototype.getAttInfo = function(name) {
	switch(name){
		case "amp":
			if(this.character.getHPRate() > 0.5)
				return this.list[0].buff.value
		break
		case "ampDef":
			if(this.character.getHPRate() < 0.5)
				return this.list[0].buff.value
		break
	}
	return 0
}
module.exports = model