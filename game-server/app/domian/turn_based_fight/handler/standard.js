//基准战力
const fightCfg = require("../fight/fightCfg.js")
const standard_ce_cfg = fightCfg.getCfg("standard_ce")
const standard_dl = fightCfg.getCfg("standard_dl")
const stone_lv = fightCfg.getCfg("stone_lv")
var standard_ce = {}
var standard_team_ce = {}
for(var i in standard_ce_cfg){
	standard_ce[i] = {
		"lv" : standard_ce_cfg[i]["lv"],
		"equip" : standard_ce_cfg[i]["equip"],
		"artifact" : standard_ce_cfg[i]["artifact"]
	}
	standard_team_ce[i] = {}
	for(var j = 1;j <= 4;j++){
		if(stone_lv[standard_ce_cfg[i]["stone_lv"]])
			standard_ce[i]["s"+j] = stone_lv[standard_ce_cfg[i]["stone_lv"]]["s"+j]
		standard_team_ce[i]["g"+j] = standard_ce_cfg[i]["guild"]
	}
	standard_team_ce[i]["officer"] = standard_ce_cfg[i]["officer"]
}
var model = function() {
	//获取基准战力阵容
	this.standardTeam = function(list,dl,lv) {
		if(!dl || !standard_dl[dl])
        	dl = "lv_1"
		if(!lv || !standard_ce[lv])
        	lv = 1
		var heroList = JSON.parse(JSON.stringify(list))
		var team = [{}]
		var lvInfo = standard_ce[lv]
		var dlInfo = standard_dl[dl]
		for(var i = 0;i < heroList.length;i++){
			if(heroList[i]){
				var heroInfo = this.makeStandardHero(heroList[i],dlInfo.hero_qa,lvInfo.lv + dlInfo.lv,dlInfo.evo,dlInfo.main_rate)
				//装备
				for(var j = 1;j <= 6;j++)
					heroInfo["e"+j] = this.makeStandardEquip(lvInfo.equip,j,dlInfo.equip_qa)
				//宝石
				for(var j = 1;j <= 4;j++)
					heroInfo["s"+j] = lvInfo["s"+j]
				team.push(heroInfo)
			}
		}
		team[0] = standard_team_ce[lv]
		//团队数据
		return team
	}
}
module.exports = model