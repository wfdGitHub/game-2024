var buffBasic = require("./buffBasic.js")
//妖术buff
var blackArt = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.init = function() {
		this.target.blackArt = true
	}
	this.overlay = function(character,otps) {
		this.character = character
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
	}
	this.clear = function() {
		this.target.blackArt = false
	}
}
blackArt.prototype = buffBasic.prototype
module.exports = blackArt