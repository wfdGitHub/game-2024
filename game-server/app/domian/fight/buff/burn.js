var buffBasic = require("./buffBasic.js")
//中毒buff
var burn = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.burnList = []
	this.count = 0
	this.init = function() {
		this.burnList[this.count++] = {character : this.character,buffArg : this.buffArg,duration : this.duration}
	}
	this.overlay = function(character,otps) {
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
		this.burnList[this.count++] = {character : character,buffArg : otps.buffArg,duration : otps.duration * 1000}
	}
	this.updateLate = function(dt) {
		if(this.duration % 500 == 0){
			var maxValue = 0
			var character = false
			for(var i in this.burnList){
				if(this.burnList[i].buffArg > maxValue){
					maxValue = this.burnList[i].buffArg
					character = this.burnList[i].character
				}
			}
			if(maxValue){
				var damage = maxValue / (1000 / dt)
				console.log("燃烧伤害 : ",damage)
				this.target.hit(character,{damage : damage},this)
			}
		}
		for(var i in this.burnList){
			this.burnList[i].duration -= dt
			if(this.burnList[i].duration <= 0){
				delete this.burnList[i]
			}
		}
	}
	this.clear = function() {
		console.log("burn clear ")
	}
}
burn.prototype = buffBasic.prototype
module.exports = burn