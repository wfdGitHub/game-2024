//buff对象
var model = function(buffStr) {
	var otps = JSON.parse(buffStr)
	this.otps = otps
	this.buffId = otps.buffId || 0  				//buffId
	this.rate = Number(otps.rate) || 0 				//buff概率
	this.mul = Number(otps.mul) || 0 				//buff系数
	this.value = Number(otps.value) || 0 			//buff额外数值
	this.targetType = otps.targetType  				//buff目标
	this.duration = otps.duration || 1 				//buff持续时间
}
module.exports = model