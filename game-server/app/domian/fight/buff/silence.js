var buffBasic = require("./buffBasic.js")
//混乱buff
var silence = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.init = function() {
		this.target.silence = true
		console.log("silence init")
		console.log(this.duration)
	}
	this.overlay = function(character,otps) {
		this.character = character
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
	}
	this.clear = function() {
		this.target.silence = false
		console.log("silence clear")
	}
}
silence.prototype = buffBasic.prototype
module.exports = silence