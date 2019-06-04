var buffBasic = require("./buffBasic.js")
//中毒buff
var poison = function(target,otps) {
	buffBasic.call(this,target,otps)
	this.poison
	this.init = function() {
		console.log("poison init")
		console.log(this.duration)
	}
	this.overlay = function(otps) {
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
	}
	this.clear = function() {
		console.log("poison clear")
	}
}
poison.prototype = buffBasic.prototype
module.exports = poison