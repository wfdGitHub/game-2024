//敌方侠客攻击时，有概率进行反击，对出手侠客进行一次普攻 (可触发普攻效果，不受控制效果影响，但是无法回怒)
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
	//监听敌方技能
	fighting.fightInfo[character.rival]["skillMonitor"].push(this.skillMonitor.bind(this))
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增BUFF后参数处理 伤害系数 mul  附加伤害value 受增减伤影响
model.prototype.buffOtps = function(attacker,info) {
	if(info.buff.num){
		this.MAX_NUM = info.buff.num
		this.CUR_NUM = 0
	}
}
//监听技能
model.prototype.skillMonitor = function(skill) {
	if( this.character.died)
		return
	if(this.fighting.randomCheck(this.list[0].buff.mul,"buff_305050") && this.enoughCount()){
		var skillInfo = this.character.useOtherSkillFree(this.character.defaultSkill)
		skillInfo.targets = [skill.character]
		skillInfo.mul = 1
		this.fighting.skillManager.useSkill(skillInfo)
	}
}
module.exports = model