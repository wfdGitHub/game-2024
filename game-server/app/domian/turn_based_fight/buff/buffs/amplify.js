//伤害BUFF
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.name = "伤害加成"
	console.log("角色"+buff.character.id+"增加伤害加成BUFF")
	var id = 0
	var list = {}
	list[id++] = {duration : otps.duration,value : otps.buffArg}
	buff.clear = function() {
		console.log("伤害加成BUFF消失")
	}
	buff.refresh = function() {
		for(var i in list){
			list[i].duration--
			if(list[i].duration <= 0){
				delete list[i]
			}
		}
	}
	buff.overlay = function(releaser,otps) {
		this.releaser = releaser
		this.duration = otps.duration
		list[id++] = {duration : otps.duration,value : otps.buffArg}
		console.log("list")
	}
	buff.getValue = function() {
		console.log("getValue",list)
		var value = 0
		for(var i in list){
			value += list[i].value
		}
		return value
	}
	return buff
}
module.exports = model