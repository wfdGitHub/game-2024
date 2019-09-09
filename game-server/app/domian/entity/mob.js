var characterFun = require("./character.js")
//怪物
var mob = function(otps) {
    characterFun.call(this,otps)
}
mob.prototype = characterFun.prototype
module.exports = mob