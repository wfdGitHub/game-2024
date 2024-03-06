//技能基类 伤害  治疗  BUFF
const act_skill = require("../act/act_skill.js")
const fightCfg = require("../fightCfg.js")
const skills = fightCfg.getCfg("skills")
var model = function(character,sid) {
	this.otps = skills[sid]
	this.character = character
	act_skill.call(this,this.otps,character)
	this.id = sid || 0 		//技能ID
	//属性
	this.isAnger = false
	this.attInfo = {}
	this.attTmpInfo = {}
	this.talents = {}
	this.init()
}
model.prototype = Object.create(act_skill.prototype) //继承父类方法
//技能初始化
model.prototype.init = function() {}
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