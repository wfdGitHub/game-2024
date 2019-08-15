var characterFun = require("./character.js")
var equip_base = require("../../../config/gameCfg/equip_base.json")
var equip_quality = require("../../../config/gameCfg/equip_quality.json")
var equip_level = require("../../../config/gameCfg/equip_level.json")
var equip_intensify = require("../../../config/gameCfg/equip_intensify.json")
var equip_intensify_master = require("../../../config/gameCfg/equip_intensify_master.json")
var gem_level = require("../../../config/gameCfg/gem_level.json")
var gem_base = require("../../../config/gameCfg/gem_base.json")
var gem_master = require("../../../config/gameCfg/gem_master.json")
var gem_master_list = {}
for(var i in gem_master){
    gem_master[i].id = i
    if(!gem_master_list[gem_master[i].level]){
        gem_master_list[gem_master[i].level] = []
    }
    gem_master_list[gem_master[i].level].push(gem_master[i])
}
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
    var gemList = {}
    var maxGem = 0
    //宝石加成
    for(var eId = 1;eId <= 10;eId++){
        for(var slot = 1; slot <= 3;slot++){
            if(otps["g_e"+eId+"_"+slot]){
                var gInfo = gemAttribute(otps["g_e"+eId+"_"+slot])
                if(gInfo){
                    if(!gemList[gInfo.level])
                        gemList[gInfo.level] = 0
                    gemList[gInfo.level] += 1
                    if(maxGem < gInfo.level){
                        maxGem = gInfo.level
                    }
                    console.log("宝石加成",gInfo)
                    if(!otps[gInfo["attribute"]]){
                        otps[gInfo["attribute"]] = 0
                    }
                    otps[gInfo["attribute"]] += gInfo["value"]
                }
            }
        }
    }
    var curGemCount = 0
    //宝石大师
    for(var i = maxGem;i > 0;i--){
        if(gem_master_list[i]){
            for(var j = gem_master_list[i].length - 1;j >= 0;j--){
                if((gemList[i] + curGemCount) >= gem_master_list[i][j].count){
                    this.gemMaster = gem_master_list[i][j].id
                    characterFun.prototype.formula(otps,gem_master_list[i][j].pc,1)
                    break
                }
            }
        }
        if(gemList[i])
            curGemCount += gemList[i]
    }
    characterFun.call(this,otps)
    console.log(this.getInfo())
}
//根据宝石字符串获取宝石信息
var gemAttribute = function(str) {
    var list = str.split("-")
    var gId = list[0]
    var level = parseInt(list[1])
    if(!gem_base[gId] || !gem_level[level] || !gem_level[level][gId]){
        return false
    }
    var gInfo = {
        "attribute" : gem_base[gId]["attribute"],
        "value" : gem_level[level][gId],
        "level" : level
    }
    return gInfo
}
hero.prototype = characterFun.prototype
module.exports = hero