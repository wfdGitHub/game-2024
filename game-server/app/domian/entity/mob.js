var bearcat = require("bearcat")
var mob = function(otps) {
	this.mobId = otps.id			//ID
	var character = bearcat.getFunction('character');
  	character.call(this,opts);
  	//增加普攻技能
  	var skill = bearcat.getBean("attackSkill",{skillId : 1001,mul : 1,fixed : fixed,skillCD : this.atkSpeed,targetType : 1},this)
  	this.addFightSkill(skill)
}
module.exports = {
	id : "mob",
	func : mob,
	parent : "character",
	args : [{
		name : "otps",
		type : "Object"
	}],
	lazy : true,
	scope : "prototype"
}