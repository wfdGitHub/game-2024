//战斗角色基类
var model = function(otps) {
	this.attTmpInfo = {}
}
//重置临时属性
model.prototype.clearTmpInfo = function() {
	this.attTmpInfo = {}
}
//改变临时属性
model.prototype.changeTotalTmp = function(name,value) {
	if(!this.attTmpInfo[name])
		this.attTmpInfo[name] = 0
	this.attTmpInfo[name] += Number(value) || 0
}
//获取战斗数据
model.prototype.getCombatData = function() {}
module.exports = model