var characterFun = require("./character.js")
var attackSkill = require("../fight/attackSkill.js")
var partner_advance = require("../../../config/gameCfg/partner_advance.json")
//伙伴
var partner = function(otps) {
    console.log("new partner")
    //进阶加成
    if(otps.advance && partner_advance[otps.advance]){
      var advanceStr = partner_advance[otps.advance]["pa"+otps.id]
      if(advanceStr){
        var strList = advanceStr.split("&")
        strList.forEach(function(m_str) {
          var m_list = m_str.split(":")
          var name = m_list[0]
          var value = Number(m_list[1])
          if(!otps[name]){
            otps[name] = 0
          }
          otps[name] += value
        })
      }
    }
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