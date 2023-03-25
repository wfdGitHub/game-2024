//buff管理器
const fightCfg = require("../fightCfg.js")
const buff_entity = require("./buff_entity.js")
const normal_buff = require("./buffs/normal_buff.js")
var model = function() {
	this.buffCfg = fightCfg.getCfg("buffs")
	this.buffList = {}
	for(var buffId in this.buffCfg){
		if(this.buffCfg[buffId].normal)
			this.buffList[buffId] = normal_buff
		else
			this.buffList[buffId] = require("./buffs/"+buffId+".js")
	}
}
//创建BUFF
model.prototype.createBuff = function(attacker,character,buff) {
	var buffId = buff.buffId
	if(this.buffList[buffId]){
		if(!character.buffs[buffId])
			character.createBuff(new this.buffList[buffId](character.fighting,character,buffId,this.buffCfg[buffId]["attKey"],this.buffCfg[buffId]["max_count"]))
		character.addBuff(attacker,buff)
	}
}
module.exports = model