const star_base = require("../../../../config/gameCfg/star_base.json")
const standard_ce_cfg = require("../../../../config/gameCfg/standard_ce.json")
const standard_dl = require("../../../../config/gameCfg/standard_dl.json")
const stone_lv = require("../../../../config/gameCfg/stone_lv.json")
const hero_tr = require("../../../../config/gameCfg/hero_tr.json")
const heros = require("../../../../config/gameCfg/heros.json")
const standard_ce = {}
const standard_team_ce = {}
for(var i in standard_ce_cfg){
	standard_ce[i] = {
		"lv" : standard_ce_cfg[i]["lv"],
		"ad" : standard_ce_cfg[i]["ad"],
		"star" : standard_ce_cfg[i]["star"]
	}
	if(standard_ce_cfg[i]["artifact"])
		standard_ce[i]["artifact"] = standard_ce_cfg[i]["artifact"]
	standard_team_ce[i] = {}
	for(var j = 1;j <= 4;j++){
		standard_ce[i]["e"+j] = standard_ce_cfg[i]["equip"]
		standard_ce[i]["s"+j] = stone_lv[standard_ce_cfg[i]["stone_lv"]]["s"+j]
		standard_team_ce[i]["g"+j] = standard_ce_cfg[i]["guild"]
		standard_ce[i]["et"+j] = standard_ce_cfg[i]["et_lv"]
	}
	if(standard_ce_cfg[i]["tr_lv"] && hero_tr[standard_ce_cfg[i]["tr_lv"] - 1]){
		standard_ce[i]["tr_maxHP"] = hero_tr[standard_ce_cfg[i]["tr_lv"] - 1]["maxHP"]
		standard_ce[i]["tr_atk"] = hero_tr[standard_ce_cfg[i]["tr_lv"] - 1]["atk"]
		standard_ce[i]["tr_phyDef"] = hero_tr[standard_ce_cfg[i]["tr_lv"] - 1]["phyDef"]
		standard_ce[i]["tr_magDef"] = hero_tr[standard_ce_cfg[i]["tr_lv"] - 1]["magDef"]
	}
	standard_team_ce[i]["officer"] = standard_ce_cfg[i]["officer"]
}
var model = function() {
	//获得升星材料
	this.getUpStarList = function(star) {
		var list = []
		if(star_base[star]){
			for(var i = 1;i <= 3;i++)
				if(star_base[star]["pc_type_"+i] && star_base[star]["pc_star_"+i])
					for(var count = 0;count < star_base[star]["pc_value_"+i];count++)
						list.push([star_base[star]["pc_type_"+i],star_base[star]["pc_star_"+i]])
		}
		return list
	}
	//获取基准战力阵容
	this.standardTeam = function(list,dl,lv) {
		dl = dl || "main"
		lv = lv || 1
		var team = JSON.parse(JSON.stringify(list))
		var standardInfo = standard_ce[lv]
		var dlInfo = standard_dl[dl]
		var info = Object.assign({},standardInfo)
		if(dlInfo.lv){
			info.lv += dlInfo.lv
			info.lv = Math.min(Math.max(info.lv,1),300)
			delete dlInfo.lv
		}
		info = Object.assign(info,dlInfo)
		for(var i = 0;i < team.length;i++){
			if(team[i]){
				team[i] = Object.assign({id : team[i]},info)
				if(team[i].star < heros[team[i]["id"]]["min_star"])
					team[i].star = heros[team[i]["id"]]["min_star"]
			}
		}
		team[6] = Object.assign({},standard_team_ce[lv])
		return team
	}
}
module.exports = model