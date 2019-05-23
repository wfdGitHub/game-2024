var bearcat = require("bearcat")
var mob = function(otps) {
	this.mobId = otps.id			//ID
	var character = bearcat.getFunction('character');
  	character.call(this,otps);
  	//增加普攻技能
  	var skill = bearcat.getBean("attackSkill",{skillId : 0},this)
  	this.addFightSkill(skill)
  	this.setDefaultSkill(skill.skillId)
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