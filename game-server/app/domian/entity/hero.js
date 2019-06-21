var characterFun = require("./character.js")
var attackSkill = require("../fight/attackSkill.js")
//主角
var hero = function(otps) {
    console.log("new hero")
    characterFun.call(this,otps)
    // var character = new characterFun(otps,sprite,direction);
    //增加普攻技能
    var skill =  new attackSkill({skillId : 20001},this)
    this.setDefaultSkill(skill)
    if(otps.skills){
      var self = this
      var skills = JSON.parse(otps.skills)
      skills.forEach(function(skillId) {
        var specialSkill =  new attackSkill({skillId : skillId},self)
        self.addFightSkill(specialSkill)
      })
    }
}
hero.prototype = characterFun.prototype
module.exports = hero