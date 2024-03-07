//buff管理器
const fightCfg = require("../fightCfg.js")
const buff_entity = require("./buff_entity.js")
var model = function(fighting) {
	this.fighting = fighting
	this.buffCfg = fightCfg.getCfg("buff_cfg")
	this.buffList = {}
}
const standardBuffOtps = {"id":0,"rate":0,"mul":0,"value":0,"time":1000,"targetType":"self"}
//生成基准BUFF
model.prototype.buildBuffOtps = function(buffStr) {
	if(!buffStr)
		return false
	var buffOtps = JSON.parse(buffStr)
	return Object.assign({"bs":1},standardBuffOtps,buffOtps)
}
//判断BUFF概率
model.prototype.checkBuffRate = function(skill,attacker,character,buffOtps) {
	var buffTargets = this.fighting.locator.getBuffTargets(attacker,skill,buffOtps)
	for(var i = 0;i < buffTargets.length;i++)
		if(this.fighting.randomCheck(buffOtps.rate))
			this.createBuff(attacker,buffTargets[i],buffOtps)
}
//创建BUFF
model.prototype.createBuff = function(attacker,character,buffOtps) {
	if(!character.checkAim() || !buffOtps.bs)
		return
	var id = buffOtps.id
	if(!this.buffList[id])
		this.buffList[id] = buff_entity
	var buffCfg = Object.assign({},this.buffCfg[id],buffOtps)
	if(!character.buffs[id])
		character.createBuff(new this.buffList[id](this.fighting,character,buffCfg))
	character.addBuff(attacker,buffCfg)
}
module.exports = model