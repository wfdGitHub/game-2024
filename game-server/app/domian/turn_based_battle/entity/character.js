var entity_base = require("./entity_base.js")
var model = function(otps,talentList) {
	//继承父类属性
	entity_base.call(this,otps,talentList)
}
//继承父类方法
model.prototype = Object.create(entity_base.prototype) //继承父类方法
model.prototype.say = function() {
	console.log("role!!")
}

module.exports = model