//buff管理器
var model = function(fighting) {
	this.fighting = fighting
	this.init()
}
//初始化BUFF
model.prototype.init = function() {
	this.buffList = {}
	this.buffList["mag_damage"] = require("./buffs/mag_damage.js")
}
//创建BUFF
model.prototype.createBuff = function(attacker,character,buff) {
	var buffId = buff.buffId
	if(this.buffList){
		if(!character.buffs[buffId])
			character.createBuff(new this.buffList[buffId](this.fighting,character,buffId))
		character.addBuff(attacker,buff)
	}
}
module.exports = model