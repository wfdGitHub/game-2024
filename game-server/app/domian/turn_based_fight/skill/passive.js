//被动技能
var model = function(otps) {
	this.id = otps.id
	this.arg = otps.arg
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
	if(this.curCD <= 0){
		this.curCD = this.needCD
		return true
	}else{
		return false
	}
}
module.exports = model