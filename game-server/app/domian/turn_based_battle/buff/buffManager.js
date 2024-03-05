//buff管理器
const fightCfg = require("../fightCfg.js")
const buff_entity = require("./buff_entity.js")
const normal_buff = require("./buffs/normal_buff.js")
var model = function() {
	this.buffCfg = fightCfg.getCfg("buff_cfg")
	this.buffList = {}
}
//创建BUFF
model.prototype.createBuff = function(attacker,character,buff) {
	var buffId = buff.buffId
	if(!character.checkAim())
		return
	if(!this.buffList[buffId]){
		console.error("!!!!!!!!!!buffId not find "+buffId)
		this.buffList[buffId] = normal_buff
		this.buffCfg[buffId] = {}
	}
	if(!character.buffs[buffId])
		character.createBuff(new this.buffList[buffId](character.fighting,character,buff,this.buffCfg[buffId]))
	character.addBuff(attacker,buff)
}
module.exports = model