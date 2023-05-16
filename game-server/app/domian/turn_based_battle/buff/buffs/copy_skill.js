//敌方侠客释放技攻时，有概率复制对方技能（仅复制1个，无法复制使自身无法行动的技能），回合结束时，消耗最多50点怒气释放此次技能，且不受控制状态影响
var buff_entity = require("../buff_entity.js")
var skill_base = require("../../skill/skill_base.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	this.copySkill = false
	//监听敌方技能
	character.fighting["fightInfo"][character.rival]["skillMonitor"].push(this.skillMonitor.bind(this))
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//监听技能
model.prototype.skillMonitor = function(skill) {
	if(!skill.isAnger || this.character.died)
		return
	if(skill.sid == 40506010 || skill.sid == 30504010)
		return
	if(!this.copySkill && this.fighting.randomCheck(this.list[0].buff.mul,"copySkill")){
		this.copySkill = new skill_base(this.character,skill.otps,skill.talents)
		this.fighting.nextRecord.push({type:"tag",id:this.character.id,tag:"copySkill"})
	}
}
//释放储存的技能
model.prototype.repetSkill = function() {
	if(this.copySkill){
		var skillInfo = this.character.usePointSkill(this.copySkill,this.list[0].buff.value)
		skillInfo.mul = Math.max(0.05,-skillInfo.changeAnger / 100)
		this.fighting.skillManager.useSkill(skillInfo)
		this.copySkill = false
	}
}
module.exports = model