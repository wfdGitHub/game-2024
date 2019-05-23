var bearcat = require("bearcat")
var mob = function(otps) {
	this.mobId = otps.id			//ID
	var character = bearcat.getFunction('character');
  	character.call(this,otps);
  	this.characterType = "mob"
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