//攻击有几率触发,驱散自己和友方侠客的N个【中毒】和【内伤】状态。
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//触发驱散
model.prototype.trigger = function(skill) {
	if(this.character.died || !skill.origin)
		return
	if(this.character.fighting.randomCheck(this.list[0].buff.mul)){
		var list = []
		list.push(this.character)
		if(this.list[0].buff.otps.player > 1)
			list = list.concat(this.character.fighting.locator.getTargets(this.character,"team_friend_"+this.list[0].buff.otps.player))
		for(var i = 0;i < list.length;i++){
			this.fighting.nextRecord.push({type:"tag",id:list[i].id,tag:"dispelLess"})
			for(var j = 0;j < this.list[0].buff.value;j++){
				if(list[i].buffs["poison"])
					list[i].buffs["poison"].delBuff()
				if(list[i].buffs["mag_damage"])
					list[i].buffs["mag_damage"].delBuff()
			}
		}
	}
}
module.exports = model