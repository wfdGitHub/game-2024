//被动技能
var model = function(character,otps,arg) {
	this.character = character
	this.id = otps.id
	if(arg)
		this.arg = arg
	else
		this.arg = otps.arg
	this.rate = otps.rate
	this.needCD = otps.cd
	this.curCD = 0
}
//更新
model.prototype.roundUpdate = function() {
	if(this.curCD > 0)
		this.curCD--
}
//判断可用性
model.prototype.isUseable = function() {
	if(this.curCD <= 0 && !(this.rate && this.character.fighting.seeded.random("被动") > this.rate)){
		this.curCD = this.needCD
		return true
	}
	return false
}
module.exports = model