var characterFun = require("./character.js")
//怪物
var mob = function(otps) {
    console.log("new mob")
    characterFun.call(this,otps)
}
mob.prototype = characterFun.prototype
module.exports = mob