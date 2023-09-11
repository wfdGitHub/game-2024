//工具类
const fightCfg = require("../fight/fightCfg.js")
const guild_skill = fightCfg.getCfg("guild_skill")
const officer = fightCfg.getCfg("officer")
var model = function(fightContorl) {
	//根据权重概率随机  权重需提前排序
	this.getWeightedRandomBySort = function(weights) {
	    if(!weights.length)
	        return 0
	    var rand = Math.random() * weights[weights.length-1]
	    for(var i = 0;i < weights.length;i++)
	        if(rand < weights[i])
	            return i
	    return 0
	}
	//从数组获取指定数量的目标
	this.getRandomArray = function(arr, count) {
	    if(count > arr.length)
	        count = arr.length
	    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
	    while (i-- > min) {
	        index = Math.floor((i + 1) * Math.random());
	        temp = shuffled[index];
	        shuffled[index] = shuffled[i];
	        shuffled[i] = temp;
	    }
	    return shuffled.slice(min);
	}
	//计算战力差值
	this.calcCEDiff = function(name,oldValue,newValue) {
		var oldCE = 0
		var newCE = 0
		switch(name){
			case "e1":
			case "e2":
			case "e3":
			case "e4":
			case "e5":
			case "e6":
				oldCE = this.getEquipCE(oldValue)
				newCE = this.getEquipCE(newValue)
			break
			case "lv":
				oldCE = lv_cfg[oldValue || 1]["ce"] || 0
				newCE = lv_cfg[newValue || 1]["ce"] || 0
			break
			case "artifact":
				if(Number.isFinite(oldValue))
					oldCE = artifact_level[oldValue]["ce"] || 0
				if(Number.isFinite(newValue))
					newCE = artifact_level[newValue]["ce"] || 0
			break
			case "a1":
			case "a2":
			case "a3":
			case "a4":
			case "a5":
			case "a6":
			case "a7":
			case "a8":
			case "a9":
			case "a10":
				if(oldValue)
					oldCE = ace_pack[oldValue]["ce"] || 0
				if(newValue)
					newCE = ace_pack[newValue]["ce"] || 0
			break
			case "s1":
			case "s2":
			case "s3":
			case "s4":
				if(oldValue)
					oldCE = stone_base[oldValue]["ce"] || 0
				if(newValue)
					newCE = stone_base[newValue]["ce"] || 0
			break
			case "s5":
			case "s6":
			case "s7":
			case "s8":
				if(oldValue)
					oldCE = stone_skill[oldValue]["ce"] || 0
				if(newValue)
					newCE = stone_skill[newValue]["ce"] || 0
			break
			case "hfLv":
				if(oldValue)
					oldCE = hufu_quality[oldValue]["ce"] || 0
				if(newValue)
					newCE = hufu_quality[newValue]["ce"] || 0
			break 
			case "zf_1":
			case "zf_2":
			case "zf_3":
				if(oldValue && zhanfa[oldValue])
					oldCE = zhanfa[oldValue]["ce"] || 0
				if(newValue && zhanfa[newValue])
					newCE = zhanfa[newValue]["ce"] || 0
			break
		}
		return newCE - oldCE
	}
	//获取团队战力
	this.getTeamCE = function(team) {
		team = JSON.parse(JSON.stringify(team))
		var allCE = 0
		var careers = {"1":0,"2":0,"3":0,"4":0}
		var teamCfg = team.shift() || {}
		for(var i = 0;i < team.length;i++){
			if(team[i]){
				allCE += this.getHeroCE(team[i])
			}
		}
		if(teamCfg){
			for(var i = 1;i <= 4;i++)
				if(teamCfg["g"+i] && guild_skill[teamCfg["g"+i]])
					allCE += Math.ceil(guild_skill[teamCfg["g"+i]]["ce"] * careers[i])
			if(teamCfg["officer"] && officer[teamCfg["officer"]] && officer[teamCfg["officer"]]["ce"])
				allCE += officer[teamCfg["officer"]]["ce"]
			if(teamCfg["gjy"])
				allCE += 10000 * teamCfg["gjy"]
			if(teamCfg["dby"])
				allCE += 10000 * teamCfg["dby"]
			if(teamCfg["qby"])
				allCE += 10000 * teamCfg["qby"]
			//主动技能
			for(var i = 1;i <= 4;i++)
				if(teamCfg["power"+i])
					allCE += this.powerEntity.getPowerCE(teamCfg["power"+i])
		}
		return allCE
	}
}
module.exports = model