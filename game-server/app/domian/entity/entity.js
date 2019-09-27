var charactersCfg = require("../../../config/gameCfg/characters.json")
var heroFun = require("./hero.js")
var mobFun = require("./mob.js")
var partnerFun = require("./partner.js")
var petFun = require("./pet.js")
module.exports = function(otps) {
	var info = Object.assign({},otps)
	var characterId = info.characterId
	if(!charactersCfg[info.characterId]){
		return false
	}
	for(var i in charactersCfg[characterId]){
		info[i] = charactersCfg[characterId][i]
	}
	var entity
	switch(info.characterType){
		case "hero":
			entity = new heroFun(info)
		break
		case "partner":
			entity = new partnerFun(info)
		break
		case "mob":
			entity = new mobFun(info)
		break
		case "pet":
			entity = new petFun(info)
		break
		default:
			entity = mobFun(info)
	}
	entity.baseOtps = otps
	return entity
}