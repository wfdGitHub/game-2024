var frozen = require("./buff/frozen.js")
var dizzy = require("./buff/dizzy.js")

var buffFactory = function() {

}
//获取BUFF
buffFactory.prototype.getBuff = function(target,otps) {
	var buffId = otps.buffId
	switch(buffId){
		case 0:
			return new frozen(target,otps)
		case 1:
			return new dizzy(target,otps)
		default:
			return false
	}
}


module.exports = {
	"id" : "buffFactory",
	func : buffFactory
}