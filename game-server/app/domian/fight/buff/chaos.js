var buffBasic = require("./buffBasic.js")
//混乱buff
var chaos = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.init = function() {
		this.target.chaos = true
	}
	this.overlay = function(character,otps) {
		this.character = character
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
	}
	this.clear = function() {
		this.target.chaos = false
	}
}
chaos.prototype = buffBasic.prototype
module.exports = chaos