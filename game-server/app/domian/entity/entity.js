var heroFun = require("./hero.js")
var mobFun = require("./mob.js")
var partnerFun = require("./partner.js")
var petFun = require("./pet.js")
module.exports = function(otps) {
	var info = Object.assign({},otps)
	switch(info.characterType){
		case "hero":
			return new heroFun(info)
		break
		case "partner":
			return new partnerFun(info)
		break
		case "mob":
			return new mobFun(info)
		break
		case "pet":
			return new petFun(info)
		break
		default:
			return new mobFun(info)
	}
}