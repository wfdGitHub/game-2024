//主动技能
const power_ad = require("../../../../config/gameCfg/power_ad.json")
const power_aptitude = require("../../../../config/gameCfg/power_aptitude.json")
const power_base = require("../../../../config/gameCfg/power_base.json")
const power_lv = require("../../../../config/gameCfg/power_lv.json")
const power_star = require("../../../../config/gameCfg/power_star.json")
var model = function() {}
//获取无双技属性 {"id":501000,"lv":1,"star":1,"ad":1}
model.prototype.getPowerInfo = function(powerInfo){
	var atts = {}
	if(powerInfo.lv && power_lv[powerInfo.lv]){
		var powerAptitude = power_base[powerInfo.id]["aptitude"]
		if(powerInfo.ad && power_ad[powerInfo.ad])
			powerAptitude += power_ad[powerInfo.ad]["aptitude"]
		var growth = power_aptitude[powerAptitude].growth
		if(power_aptitude[power_base[powerInfo.id]["aptitude"]] && power_aptitude[power_base[powerInfo.id]["aptitude"]]["extra"])
			growth += power_aptitude[power_base[powerInfo.id]["aptitude"]]["extra"]
		for(var att in atts)
			atts[att] = Math.floor(power_lv[powerInfo.lv][att] * growth + power_aptitude[power_base[powerInfo.id]["aptitude"]][att])
		atts["basic"] = Math.floor(power_lv[powerInfo.lv]["basic"] * growth)
	}
	return atts
}
//获取无双技战力
model.prototype.getPowerCE = function(powerInfo) {
	var ce = 20000
	ce += power_lv[powerInfo["lv"]]["ce"] || 0
	ce += power_ad[powerInfo["ad"]]["ce"] || 0
	ce += power_star[powerInfo["star"]]["ce"] || 0
	ce = Math.floor(ce * power_aptitude[power_base[powerInfo["id"]]["aptitude"]]["ceRate"])
	return ce
}
module.exports = new model()

// var test = new model()
// console.log(test.getPowerCE({"id":501000,"lv":600,"star":7,"ad":15}))
