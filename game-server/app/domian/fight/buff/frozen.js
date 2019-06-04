var buffBasic = require("./buffBasic.js")
//冰冻buff
var frozen = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.init = function() {
		this.target.frozen = true
		console.log("frozen init")
		console.log(this.duration)
	}
	this.overlay = function(character,otps) {
		this.character = character
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
	}
	this.clear = function() {
		this.target.frozen = false
		console.log("frozen clear")
	}
}
frozen.prototype = buffBasic.prototype
module.exports = frozen