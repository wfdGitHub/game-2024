var characterFun = require("./character.js")
//伙伴
var partner = function(otps) {
    console.log("new partner")
    characterFun.call(this,otps)
}
partner.prototype = characterFun.prototype
module.exports = partner