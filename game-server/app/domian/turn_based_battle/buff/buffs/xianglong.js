//普攻优先选择斗酒目标
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理
model.prototype.buffOtps = function(attacker,info) {
	if(info.buff.otps.maxHP){
		var target = this.fighting.locator.getEnemyMaxHP(this.character)[0]
		if(target && target.checkAim()){
			var tmpValue = Math.floor(target.getTotalAtt("maxHP") * info.buff.otps.maxHP)
			this.character.changeTotalAtt("maxHP",tmpValue)
			target.changeTotalAtt("maxHP",-tmpValue)
			this.fighting.nextRecord.push({type:"tag",id:target.id,tag:"suck_maxHP"})
		}
	}
	if(info.buff.otps.atk){
		var target = this.fighting.locator.getEnemyMaxAtk(this.character)[0]
		if(target && target.checkAim()){
			var tmpValue = Math.floor(target.getTotalAtt("atk") * info.buff.otps.atk)
			this.character.changeTotalAtt("atk",tmpValue)
			target.changeTotalAtt("atk",-tmpValue)
			this.fighting.nextRecord.push({type:"tag",id:target.id,tag:"suck_atk"})
		}
	}
	if(info.buff.otps.armor){
		var target = this.fighting.locator.getEnemyMaxArmor(this.character)[0]
		if(target && target.checkAim()){
			var tmpValue = Math.floor(target.getTotalAtt("armor") * info.buff.otps.armor)
			this.character.changeTotalAtt("armor",tmpValue)
			target.changeTotalAtt("armor",-tmpValue)
			this.fighting.nextRecord.push({type:"tag",id:target.id,tag:"suck_armor"})
		}
	}
}
module.exports = model