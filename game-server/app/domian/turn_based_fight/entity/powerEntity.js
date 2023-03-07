//主动技能
const power_ad = require("../../../../config/gameCfg/power_ad.json")
const power_aptitude = require("../../../../config/gameCfg/power_aptitude.json")
const power_base = require("../../../../config/gameCfg/power_base.json")
const power_lv = require("../../../../config/gameCfg/power_lv.json")
const power_star = require("../../../../config/gameCfg/power_star.json")
const beauty_ad = require("../../../../config/gameCfg/beauty_ad.json")
const beauty_base = require("../../../../config/gameCfg/beauty_base.json")
const beauty_star = require("../../../../config/gameCfg/beauty_star.json")
const beauty_cfg = require("../../../../config/gameCfg/beauty_cfg.json")
var model = function() {}
//获取无双技属性 {"id":501000,"lv":1,"star":1,"ad":1}
model.prototype.getPowerInfo = function(powerInfo){
	var atts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
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
//获取红颜技属性  {"ad":1,"star":1,"att1":0,"att2":0,"att3":0,"att4":0,"opinion":0,"id":"605300"}
model.prototype.getBeautyInfo = function(beautyInfo){
	var atts = {"maxHP":0,"atk":0,"phyDef":0,"magDef":0}
	var beautyAptitude = beauty_base[beautyInfo.id]["aptitude"]
	if(beautyInfo.ad && beauty_ad[beautyInfo.ad])
		beautyAptitude += beauty_ad[beautyInfo.ad]["aptitude"]
	var growth = power_aptitude[beautyAptitude].growth
	growth += power_aptitude[beauty_base[beautyInfo.id]["aptitude"]]["extra"]
	var basics = {}
	for(var i = 1;i <= 4;i++)
		basics["att"+i] = beautyInfo["att"+i] * growth * beauty_cfg[beauty_base[beautyInfo.id]["att"+i]]["value"]
	atts["maxHP"] = Math.floor(beauty_cfg["maxHP"]["value"] * basics["att1"])
	atts["atk"] = Math.floor(beauty_cfg["atk"]["value"] * basics["att2"])
	atts["phyDef"] = Math.floor(beauty_cfg["phyDef"]["value"] * basics["att3"])
	atts["magDef"] = Math.floor(beauty_cfg["magDef"]["value"] * basics["att4"])
	atts["basic"] = Math.floor((power_lv[1]["basic"] * growth) + (basics["att1"] + basics["att2"] + basics["att3"] + basics["att4"]) * 5)
	return atts
}
//获取红颜战力
model.prototype.getBeautyCE = function(beautyInfo) {
	var ce = 20000
	ce += beauty_ad[beautyInfo["ad"]]["ce"] || 0
	ce += beauty_star[beautyInfo["star"]]["ce"] || 0
	ce = Math.floor(ce * power_aptitude[beauty_base[beautyInfo.id]["aptitude"]]["ceRate"])
	return ce
}
module.exports = new model()

// var test = new model()
// console.log(test.getBeautyCE({"ad":15,"star":7,"att1":25980,"att2":25980,"att3":25980,"att4":25980,"opinion":0,"id":"605300"}))
// console.log(test.getPowerCE({"id":501000,"lv":600,"star":7,"ad":15}))
