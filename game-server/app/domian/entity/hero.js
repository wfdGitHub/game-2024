var characterFun = require("./character.js")
//主角
var hero = function(otps) {
    console.log("new hero")
    characterFun.call(this,otps)
}
hero.prototype = characterFun.prototype
module.exports = hero