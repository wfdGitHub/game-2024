var FirstName = require("../../config/sysCfg/FirstName.json")
var LastName = require("../../config/sysCfg/LastName.json")
//命名组件
var namespace = function() {
	this.name = "namespace"
}
//获取随机名称
namespace.prototype.getName = function() {
	return FirstName[Math.floor(Math.random() * FirstName.length)] + " "+ LastName[Math.floor(Math.random() * LastName.length)]
}
//获取指定顺序名称
namespace.prototype.getNameByIndex = function(id) {
	var index = Math.floor(Math.sqrt(id))
	return FirstName[index] + " "+ LastName[index]
}
module.exports = {
	id : "namespace",
	func : namespace
}