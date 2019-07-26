var characterFun = require("./character.js")
var equip_base = require("../../../config/gameCfg/equip_base.json")
var equip_quality = require("../../../config/gameCfg/equip_quality.json")
var equip_level = require("../../../config/gameCfg/equip_level.json")
var equip_intensify = require("../../../config/gameCfg/equip_intensify.json")
var equip_intensify_master = require("../../../config/gameCfg/equip_intensify_master.json")
//主角
var hero = function(otps) {
    console.log("new hero",otps)
    //计算装备加成
	for(var i = 1;i <= 10;i++){
		if(otps["d_e"+i]){
			var eInfo = JSON.parse(otps["d_e"+i])
			//装备基本加成
			var str = equip_base[eInfo.eId]["attribute"]
			var rate = equip_level[eInfo.samsara]["aRate"] * equip_quality[eInfo.quality]["aRate"]
			console.log("装备基本加成",str,rate)
			characterFun.prototype.formula(otps,str,rate)
			//装备洗练加成
			if(eInfo.wash){
				var washArr = JSON.parse(eInfo.wash)
				if(Array.isArray(washArr)){
					for(var j = 0;j < washArr.length;j++){
						var str = washArr[j]["pa"]
						console.log("装备洗练加成",str)
						characterFun.prototype.formula(otps,str)
					}
				}
			}
		}
	}
	var minIl = false
    //装备强化加成
    for(var i = 1;i <= 10;i++){
    	if(otps["i_e"+i]){
    		if(minIl === false || otps["i_e"+i] < minIl){
    			minIl = otps["i_e"+i]
    		}
    		var curIL = otps["i_e"+i]
    		var il = Math.floor(curIL % 10)
    		var isamsara = Math.round(curIL/10)
    		var str = equip_intensify[il]["e"+i]
    		var rate = equip_level[isamsara]["ipa"]
			console.log("装备强化加成",str,rate)
			characterFun.prototype.formula(otps,str,rate)
    	}else{
    		minIl = 0
    	}
    }
    //强化大师加成
    console.log("minIl : ",minIl)
    for(var i in equip_intensify_master){
    	if(minIl >= Number(i)){
    		var str = equip_intensify_master[i]["pc"]
			console.log("强化大师加成",str)
			characterFun.prototype.formula(otps,str)
    	}else{
    		break
    	}
    }
    characterFun.call(this,otps)
    console.log(this.getInfo())
}
hero.prototype = characterFun.prototype
module.exports = hero