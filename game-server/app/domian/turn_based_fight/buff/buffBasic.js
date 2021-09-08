//buff基础
var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("./buffManager.js")
var buffBasic = function(releaser,character,otps) {
	this.fightRecord = fightRecord
	this.buffManager = buffManager
	this.buffId = otps.buffId
	this.type = "buff"
	this.buffArg = otps.buffArg
	this.duration = otps.duration
	this.releaser = releaser
	this.character = character
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
	this.duration -= 1
	if(this.duration <= 0){
		this.destroy()
	}
}
module.exports = buffBasic