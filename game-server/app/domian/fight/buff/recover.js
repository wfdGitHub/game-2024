var buffBasic = require("./buffBasic.js")
//恢复buff
var recover = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.interval = 500
	this.recoverList = {}
	this.count = 0
	this.all = 0
	this.init = function() {
		this.recoverList[this.count++] = {character : this.character,buffArg : this.buffArg,duration : this.duration}
	}
	this.overlay = function(character,otps) {
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
		this.recoverList[this.count++] = {character : character,buffArg : otps.buffArg,duration : otps.duration * 1000}
	}
	this.updateLate = function(dt) {
		if(this.duration % this.interval == 0){
			var maxValue = 0
			var character = false
			for(var i in this.recoverList){
				if(this.recoverList[i].buffArg > maxValue){
					maxValue = this.recoverList[i].buffArg
					character = this.recoverList[i].character
				}
			}
			if(maxValue){
				var value = Math.floor(maxValue / (1000 / this.interval))
				this.all += value
				this.target.recoverHp(value)
			}
		}
		for(var i in this.recoverList){
			this.recoverList[i].duration -= dt
			if(this.recoverList[i].duration <= 0){
				delete this.recoverList[i]
			}
		}
	}
	this.clear = function() {
	}
}
recover.prototype = buffBasic.prototype
module.exports = recover