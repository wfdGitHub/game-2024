//无敌吸血盾BUFF  可清除
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.refreshType = "before_2"
	buff.name = "无敌吸血盾"
	buff.overlay = function(releaser,otps) {
		buff.releaser = releaser
		buff.duration = otps.duration
	}
	return buff
}
module.exports = model