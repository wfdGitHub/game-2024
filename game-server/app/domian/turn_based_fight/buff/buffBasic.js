//buff基础
var fightRecord = require("../fight/fightRecord.js")
var buffBasic = function(releaser,character,otps) {
	this.buffId = otps.buffId
	this.type = "buff"
	this.name = otps.name
	this.buffArg = otps.buffArg
	this.duration = otps.duration
	this.releaser = releaser
	this.character = character
	this.otps = otps
}
//clear
buffBasic.prototype.clear = function() {
	console.log("buff清除"+this.name)
}
buffBasic.prototype.refresh = function() {
}
buffBasic.prototype.destroy = function() {
	fightRecord.push({type : "destroyBuff",character : this.character.id,buffId : this.buffId,name : this.name})
	this.character.removeBuff(this.buffId)
	this.clear()
}
//update
buffBasic.prototype.update = function(dt) {
	this.refresh()
	this.duration -= 1
	if(this.duration <= 0){
		this.destroy()
	}
}
module.exports = buffBasic