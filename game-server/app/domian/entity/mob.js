var characterFun = require("./character.js")
//怪物
var mob = function(otps) {
	if(otps["attStr"]){
		characterFun.prototype.formula(otps,otps["attStr"],1)
	}
    characterFun.call(this,otps)
}
mob.prototype = characterFun.prototype
module.exports = mob