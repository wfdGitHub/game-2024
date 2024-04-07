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
//改变属性
model.prototype.changeTotalAtt = function(name,value) {
	if(this.attInfo[name] !== undefined){
		this.attInfo[name] += Number(value) || 0
		if(name == "maxHP")
			this.attInfo["hp"] += Number(value) || 0
	}
}
//获取战斗数据
model.prototype.getCombatData = function() {}
module.exports = model