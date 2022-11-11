var FirstName1 = require("../../config/sysCfg/FirstName1.json")
var FirstName2 = require("../../config/sysCfg/FirstName2.json")
var LastName1 = require("../../config/sysCfg/LastName1.json")
var LastName2 = require("../../config/sysCfg/LastName2.json")
//命名组件
var namespace = function() {
	this.name = "namespace"
}
//获取随机名称
namespace.prototype.getName = function(sex) {
	if(!sex || sex !== 1)
		sex = 2
	if(sex == 1)
		return FirstName1[Math.floor(Math.random() * FirstName1.length)] + LastName1[Math.floor(Math.random() * LastName1.length)]
	else
		return FirstName2[Math.floor(Math.random() * FirstName2.length)] + LastName2[Math.floor(Math.random() * LastName2.length)]
}
//获取指定顺序名称
namespace.prototype.getNameByIndex = function(id) {
	var index = Math.floor(Math.sqrt(id))
	return FirstName1[index] + LastName1[index]
}
module.exports = {
	id : "namespace",
	func : namespace
}