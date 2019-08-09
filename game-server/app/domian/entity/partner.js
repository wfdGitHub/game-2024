var characterFun = require("./character.js")
var advanceCfg = require("../../../config/gameCfg/advance.json")
//伙伴
var partner = function(otps) {
    console.log("new partner")
    if(otps.advance){
    	if(advanceCfg[otps.advance] && advanceCfg[otps.advance]["partner_"+otps.characterId]){
    		otps.skills = advanceCfg[otps.advance]["partner_"+otps.characterId]
    		console.log("otps.skills",otps.skills)
    	}
    }
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
    characterFun.call(this,otps)
}
partner.prototype = characterFun.prototype
module.exports = partner