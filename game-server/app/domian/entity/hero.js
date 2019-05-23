var bearcat = require("bearcat")
var hero = function(otps) {
	this.heroId = otps.id			//ID
	var character = bearcat.getFunction('character');
  	character.call(this,otps);
  	this.characterType = "hero"
  	//增加普攻技能
  	var skill = bearcat.getBean("attackSkill",{skillId : 0},this)
  	this.setDefaultSkill(skill)
    if(otps.specialSkills){
      var self = this
      otps.specialSkills.forEach(function(skillId) {
        var specialSkill =  bearcat.getBean("attackSkill",{skillId : skillId},self)
        self.addFightSkill(specialSkill)
      })
    }
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