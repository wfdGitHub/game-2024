var names_1 = require("../../config/gameCfg/names_1.json")
var names_2 = require("../../config/gameCfg/names_2.json")
var names = {"1" : [],"2" : []}
for(var i in names_1)
	names[1].push(names_1[i])
for(var i in names_2)
	names[2].push(names_2[i])
//命名组件
var namespace = function() {
	this.name = "namespace"
}
//获取随机名称
namespace.prototype.getName = function(sex) {
    if(!sex || sex !== 1)
        sex = 2
    var first = names[sex][Math.floor(Math.random() * names[sex].length)]["first_name"]
    var second = names[sex][Math.floor(Math.random() * names[sex].length)]["second_name"]
	return first + second
}
//获取指定顺序名称
namespace.prototype.getNameByIndex = function(id) {
	var index = Math.floor(id % names[1].length)
	return names[1][index]["first_name"] + names[1][index]["second_name"]
}
module.exports = {
	id : "namespace",
	func : namespace
}