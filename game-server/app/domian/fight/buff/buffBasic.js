var buffBasic = function(character,target,otps) {
	this.buffId = otps.buffId
	this.type = "buff"
	this.name = otps.name
	this.buffArg = otps.buffArg
	this.duration = otps.duration * 1000
	this.character = character
	this.target = target
}
//init
buffBasic.prototype.init = function() {
	console.log("buffBasic init")
}
buffBasic.prototype.initialize = function() {
	this.init()
}
//overlay
buffBasic.prototype.overlay = function(character,otps) {
	this.character = character
	this.buffArg = otps.buffArg
	this.duration = otps.duration * 1000
}
//clear
buffBasic.prototype.clear = function() {
	console.log("buffBasic clear")
}
buffBasic.prototype.destroy = function() {
	this.clear()
}
//update
buffBasic.prototype.update = function(dt) {
	this.updateLate(dt)
	this.duration -= dt
	if(this.duration <= 0){
		this.destroy()
		this.target.removeBuff(this.buffId)
	}
}
buffBasic.prototype.updateLate = function() {

}
module.exports = buffBasic