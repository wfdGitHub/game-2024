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
    characterFun.call(this,otps)
}
partner.prototype = characterFun.prototype
module.exports = partner