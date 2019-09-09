var characterFun = require("./character.js")
var advanceCfg = require("../../../config/gameCfg/advance.json")
var partner_star = require("../../../config/gameCfg/partner_star.json")
//伙伴
var partner = function(otps) {
    //转生被动技能列表
    var passives = []
    if(otps.passives){
    	passives = JSON.parse(otps.passives) || []
    }
    var samsara = Math.floor(((otps.level - 1) / 100))
    for(var i = 1;i <= samsara;i++){
    	if(otps["ps_"+i]){
    		passives.push(otps["ps_"+i])
    	}
    }
    otps.passives = JSON.stringify(passives)
    //伙伴升星
    if(otps.star){
        characterFun.prototype.formula(otps,partner_star[otps.star]["pa"])
        if(partner_star[otps.star] && partner_star[otps.star]["partner_"+otps.characterId]){
            otps.skills = partner_star[otps.star]["partner_"+otps.characterId]
        }
    }
    characterFun.call(this,otps)
}
partner.prototype = characterFun.prototype
module.exports = partner