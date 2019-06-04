var buffBasic = require("./buffBasic.js")
//眩晕buff
var dizzy = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.init = function() {
		this.target.dizzy = true
		console.log("dizzy init")
		console.log(this.duration)
	}
	this.overlay = function(character,otps) {
		this.character = character
		console.log("旧持续时间",this.duration)
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
		console.log("新持续时间",this.duration)
	}
	this.clear = function() {
		this.target.dizzy = false
		console.log("dizzy clear")
	}
}
dizzy.prototype = buffBasic.prototype
module.exports = dizzy