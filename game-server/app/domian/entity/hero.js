var characterFun = require("./character.js")
var attackSkill = require("../fight/attackSkill.js")
var hero = function(otps) {
    characterFun.call(this,otps)
    this.characterType = "hero"
    // var character = new characterFun(otps,sprite,direction);
    //增加普攻技能
    var skill =  new attackSkill({skillId : 0},this)
    this.setDefaultSkill(skill)
    if(otps.specialSkills){
      var self = this
      otps.specialSkills.forEach(function(skillId) {
        var specialSkill =  new attackSkill({skillId : skillId},self)
        self.addFightSkill(specialSkill)
      })
    }
}
hero.prototype = characterFun.prototype
module.exports = hero