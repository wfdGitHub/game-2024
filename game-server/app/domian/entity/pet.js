var characterFun = require("./character.js")
var attackSkill = require("../fight/attackSkill.js")
//宠物
var pet = function(otps) {
    console.log("new pet")
    //资质加成
    otps.str = ((otps.str || 0) + Math.floor(otps.strAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    otps.agi = ((otps.agi || 0) + Math.floor(otps.agiAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    otps.vit = ((otps.vit || 0) + Math.floor(otps.vitAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    otps.phy = ((otps.phy || 0) + Math.floor(otps.phyAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    characterFun.call(this,otps)
    console.log(this.getInfo())
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
pet.prototype = characterFun.prototype
module.exports = pet