var FirstName1 = require("../../config/sysCfg/boy.json")
//命名组件
var namespace = function() {
	this.name = "namespace"
}
//获取随机名称
namespace.prototype.getName = function() {
	return FirstName1[Math.floor(Math.random() * FirstName1.length)]
//获取指定顺序名称
namespace.prototype.getNameByIndex = function(id) {
	var index = Math.floor(Math.sqrt(id))
	return FirstName1[index]
}
module.exports = {
	id : "namespace",
	func : namespace
}