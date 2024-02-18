//工具类
const fightCfg = require("../fightCfg.js")
const guild_skill = fightCfg.getCfg("guild_skill")
const officer = fightCfg.getCfg("officer")
const lv_cfg = fightCfg.getCfg("lv_cfg")
const ace_pack = fightCfg.getCfg("ace_pack")
const hufu_quality = fightCfg.getCfg("hufu_quality")
const zhanfa = fightCfg.getCfg("zhanfa")
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
			//主动技能
			for(var i = 1;i <= 4;i++)
				if(teamCfg["power"+i])
					allCE += this.powerEntity.getPowerCE(teamCfg["power"+i])
		}
		return allCE
	}
}
module.exports = model