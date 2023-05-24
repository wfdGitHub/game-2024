//友方职业与自身相同侠客受到攻击时,自身有概率对攻击者发动复仇,造成攻击一定比例的真实伤害
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	//监听敌方技能
	fighting.fightInfo[character.rival]["heroAtionMonitor"].push(this.heroAtionMonitor.bind(this))
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//监听技能
model.prototype.heroAtionMonitor = function(attacker,skill,targets) {
	if( this.character.died)
		return
	for(var i = 0;i < targets.length;i++){
		if(targets[i].realm == this.character.realm){
			if(this.character.fighting.randomCheck(this.getBuffMul(),"同系反伤")){
				this.fighting.nextRecord.push({type:"tag",id:this.character.id,tag:"revenge"})
				attacker.onOtherDamage(this.character,this.character.getTotalAtt("atk") * this.getBuffValue())
			}
			return
		}
	}
}
module.exports = model