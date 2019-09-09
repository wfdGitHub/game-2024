var buffBasic = require("./buffBasic.js")
//眩晕buff
var dizzy = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.init = function() {
		this.target.dizzy = true
	}
	this.overlay = function(character,otps) {
		this.character = character
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
	}
	this.clear = function() {
		this.target.dizzy = false
	}
}
dizzy.prototype = buffBasic.prototype
module.exports = dizzy