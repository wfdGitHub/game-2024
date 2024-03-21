//工具类
const fightCfg = require("../fight/fightCfg.js")
const tour_quality = fightCfg.getCfg("tour_quality")
var model = function(fightContorl) {
	//获取游历成功概率
	this.getTourRate = function(heroList,qa) {
		var need = tour_quality[qa]["score"]
		var score = 0
		for(var i = 0; i < heroList.length;i++)
			score += this.getHeroScore(heroList[i])
		return Math.min(score / need,1)
	}
}
module.exports = model