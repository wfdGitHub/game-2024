const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const hero_quality = require("../../../../config/gameCfg/hero_quality.json")
var model = function() {
	//获取进化概率
	this.getHeroEvoRate = function(heroInfo,herolist) {
		var need = evolve_lv[heroInfo["evo"]]["need"] * exalt_lv[heroInfo["exalt"]]["rate"]
		var cur = 0
		for(var i in herolist){
			var qaRate = 1
			if(heroInfo.id == herolist[i].id)
				qaRate *= 1.5
			qaRate *= hero_quality[herolist[i].qa]["rete"]
			cur += exalt_lv[herolist[i]["exalt"]]["basic"] * qaRate
		}
		var rate = cur/need
		if(heroInfo.evoRate)
			rate += Number(heroInfo.evoRate) || 0
		return Math.min(Number(rate.toFixed(2)),1)
	}
}
module.exports = model