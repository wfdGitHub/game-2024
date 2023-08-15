const evolve_lv = require("../../../../config/gameCfg/evolve_lv.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
var model = function() {
	//获取进化概率
	this.getHeroEvoRate = function(heroInfo,herolist) {
		var need = evolve_lv[heroInfo["evo"]]["need"] * exalt_lv[heroInfo["exalt"]]["rate"]
		var cur = 0
		for(var i in herolist){
			if(heroInfo.id == herolist[i].id)
				cur += exalt_lv[herolist[i]["exalt"]]["basic"] * 1.5
			else
				cur += exalt_lv[herolist[i]["exalt"]]["basic"]
		}
		var rate = cur/need
		if(heroInfo.evoRate)
			rate += Number(heroInfo.evoRate) || 0
		return Math.min(Number(rate.toFixed(2)),1)
	}
}
module.exports = model