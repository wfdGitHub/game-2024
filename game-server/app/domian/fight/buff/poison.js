var buffBasic = require("./buffBasic.js")
//中毒buff
var poison = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	this.poisonList = []
	this.count = 0
	this.init = function() {
		this.poisonList[this.count++] = {character : this.character,buffArg : this.buffArg,duration : this.duration}
	}
	this.overlay = function(character,otps) {
		if(this.duration < otps.duration * 1000){
			this.duration = otps.duration * 1000
		}
		this.poisonList[this.count++] = {character : character,buffArg : otps.buffArg,duration : otps.duration * 1000}
	}
	this.updateLate = function(dt) {
		if(this.duration % 500 == 0){
			var maxValue = 0
			var character = false
			for(var i in this.poisonList){
				if(this.poisonList[i].buffArg > maxValue){
					maxValue = this.poisonList[i].buffArg
					character = this.poisonList[i].character
				}
			}
			if(maxValue){
				var damage = maxValue / (1000 / dt)
				console.log("毒伤害 : ",damage)
				this.target.hit(character,{damage : damage},this)
			}
		}
		for(var i in this.poisonList){
			this.poisonList[i].duration -= dt
			if(this.poisonList[i].duration <= 0){
				delete this.poisonList[i]
			}
		}
	}
	this.clear = function() {
		console.log("poison clear ")
	}
}
poison.prototype = buffBasic.prototype
module.exports = poison