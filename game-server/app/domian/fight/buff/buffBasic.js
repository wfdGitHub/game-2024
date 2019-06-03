var buffBasic = function(target,otps) {
	this.buffId = otps.buffId
	this.name = otps.name
	this.buffArg = otps.buffArg
	this.duration = otps.duration * 1000
	this.target = target
}
//init
buffBasic.prototype.init = function() {
	console.log("buffBasic init")
}
//overlay
buffBasic.prototype.overlay = function(otps) {
	var buffArg = otps.buffArg
	var duration = otps.duration
}
//clear
buffBasic.prototype.clear = function() {
	console.log("buffBasic clear")
}
//update
buffBasic.prototype.update = function(dt) {
	this.duration -= dt
	if(this.duration <= 0){
		this.clear()
		this.target.removeBuff(this.buffId)
	}
}

module.exports = buffBasic