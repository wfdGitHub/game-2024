var bearcat = require("bearcat")
var hero = function(otps) {
	this.heroId = otps.id			//ID
	var character = bearcat.getFunction('character');
  	character.call(this,otps);
  	//增加普攻技能
  	var skill = bearcat.getBean("attackSkill",{skillId : 0},this)
  	this.addFightSkill(skill)
  	var skill2 = bearcat.getBean("attackSkill",{skillId : 2},this)
  	this.addFightSkill(skill2)
  	console.log(this.fightSkills)
  	this.setDefaultSkill(skill.skillId)
}
module.exports = {
	id : "hero",
	func : hero,
	parent : "character",
	args : [{
		name : "otps",
		type : "Object"
	}],
	lazy : true,
	scope : "prototype"
}