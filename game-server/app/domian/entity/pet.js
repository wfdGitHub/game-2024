var characterFun = require("./character.js")
//宠物
var pet = function(otps) {
    //资质加成
    otps.str = ((otps.str || 0) + Math.floor(otps.strAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    otps.agi = ((otps.agi || 0) + Math.floor(otps.agiAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    otps.vit = ((otps.vit || 0) + Math.floor(otps.vitAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    otps.phy = ((otps.phy || 0) + Math.floor(otps.phyAp * 0.001 * otps.level * otps.growth)) || 0    //力量
    characterFun.call(this,otps)
}
pet.prototype = characterFun.prototype
module.exports = pet