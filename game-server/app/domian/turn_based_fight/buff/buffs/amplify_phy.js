//物伤加成
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.value = otps.buffArg
	return buff
}
module.exports = model