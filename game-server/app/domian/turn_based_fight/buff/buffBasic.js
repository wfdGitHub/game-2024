//buff基础
var fightRecord = require("../fight/fightRecord.js")
var buffBasic = function(releaser,character,otps,fighting) {
	this.fightRecord = fightRecord
	this.fighting = fighting
	this.buffId = otps.buffId
	this.type = "buff"
	this.buffArg = otps.buffArg || 0
	this.duration = otps.duration || 1
	this.releaser = releaser
	this.character = character
	this.buffManager = require("./buffManager.js")
	this.otps = otps
}
//clear
buffBasic.prototype.clear = function() {
	// console.log("buff清除"+this.name)
}
buffBasic.prototype.refresh = function() {
}
buffBasic.prototype.destroy = function(reason) {
	var info = {type : "destroyBuff",character : this.character.id,buffId : this.buffId,name : this.name}
	if(reason)
		info.reason = reason
	this.fightRecord.push(info)
	this.character.removeBuff(this.buffId)
	this.clear()
}
//覆盖BUFF
buffBasic.prototype.overlay = function(releaser,otps) {
	this.releaser = releaser
	this.duration = otps.duration
	this.otps = otps
}
//update
buffBasic.prototype.update = function(dt) {
	this.refresh()
	if(this.duration != -1){
		this.duration -= 1
		if(this.duration <= 0){
			this.destroy()
		}
	}
}
module.exports = buffBasic