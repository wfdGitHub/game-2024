//技能基类 伤害  治疗  BUFF
const act_skill = require("../act/act_skill.js")
var model = function(character,otps,talents) {
	act_skill.call(this,otps,character)
	otps = otps || {}
	this.character = character
	this.sid = otps.sid || 0 		//技能ID
	//属性
	this.attInfo = {}
	this.attTmpInfo = {}
	this.buffs = {} 								 //附带BUFF
	this.talents = talents || {}
	this.otps = otps
	this.init()
}
model.prototype = Object.create(act_skill.prototype) //继承父类方法
//技能初始化
model.prototype.init = function() {
	for(var i = 1;i <= 3;i++){
		if(this.talents["buff"+i]){
			var buff = this.character.fighting.buffManager.getBuffByData(this.talents["buff"+i])
			this.buffs[buff.buffId] = buff
		}
	}
}
model.prototype.changeTotalTmp = function(name,value) {
	if(!this.attTmpInfo[name])
		this.attTmpInfo[name] = 0
	this.attTmpInfo[name] += Number(value) || 0
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	var value = this.attInfo[name] || 0
	value += this.attTmpInfo[name] || 0
	return value
}
//==============获取技能信息
module.exports = model