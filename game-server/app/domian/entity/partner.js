var characterFun = require("./character.js")
var attackSkill = require("../fight/attackSkill.js")
//伙伴
var partner = function(otps) {
    console.log("new partner")
    characterFun.call(this,otps)
    //注册事件
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
partner.prototype = characterFun.prototype
module.exports = partner