var buffBasic = require("./buffBasic.js")
//混乱buff
var immune = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.count = 0
	this.init = function() {
		this.count = Number(otps.buffArg) || 1
		// console.log("immune init")
	}
	this.overlay = function(character,otps) {
		this.character = character
		this.count = Number(otps.buffArg) || 1
		this.duration = otps.duration * 1000
	}
	//消耗次数
	this.consume = function() {
		this.count--
		if(this.count <= 0){
			this.destroy()
		}
	}
	this.clear = function() {
		// console.log("immune clear")
	}
}
immune.prototype = buffBasic.prototype
module.exports = immune