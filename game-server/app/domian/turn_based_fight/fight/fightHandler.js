const standard_ce_cfg = require("../../../../config/gameCfg/standard_ce.json")
const standard_dl = require("../../../../config/gameCfg/standard_dl.json")
const stone_lv = require("../../../../config/gameCfg/stone_lv.json")
const baseStone = {"1" : 4110,"2" : 4210,"3" : 4310,"4" : 4410}
const extra_list = ["M_HP","M_ATK","M_DEF","M_STK","M_SEF","M_SPE"]

var standard_ce = {}
var standard_team_ce = {}
var trMap = [0,"maxHP","atk","phyDef","magDef"]
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
const handlers = ["util","equip","hero"]
var model = function() {
	for(var i = 0; i < handlers.length;i++)
		require("../handler/"+handlers[i]+".js").call(this,this)
	//获取基准战力阵容
	this.standardTeam = function(list,dl,lv) {
        dl = dl || "lv_1"
        lv = lv || 1
		var heroList = JSON.parse(JSON.stringify(list))
		var team = []
		var standardInfo = standard_ce[lv]
		var dlInfo = standard_dl[dl]
		var info = Object.assign({},standardInfo)
		if(dlInfo.lv)
			info.lv += dlInfo.lv
		
		info = Object.assign(info,dlInfo)
		for(var i = 0;i < team.length;i++){
			if(team[i]){
				team[i] = Object.assign({id : team[i]},info)
				if(team[i].star < heros[team[i]["id"]]["min_star"])
					team[i].star = heros[team[i]["id"]]["min_star"]
			}
		}
		team.unshift(JSON.parse(JSON.stringify(standard_team_ce[lv])))
		return team
	}
}
module.exports = model