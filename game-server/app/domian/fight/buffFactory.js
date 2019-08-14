var gainIds = {"recover" : true}
var buffIds = ["frozen","dizzy","poison","burn","chaos","blackArt","silence","recover"]
var buffList = {}
for(var i = 0;i < buffIds.length;i++){
	buffList[buffIds[i]] = require("./buff/"+buffIds[i]+".js")
}
console.log("buffList ",buffList)
var buffFactory = function() {}
//获取BUFF
buffFactory.getBuff = function(attacker,target,otps) {
	var buffId = otps.buffId
	if(buffList[buffId]){
		return new buffList[buffId](attacker,target,otps)
	}else{
		return false
	}
}
//判断BUFF命中率
buffFactory.checkBuffRate = function(attacker,target,otps) {
	var buffId = otps.buffId
	var buffRate = otps.buffRate
	var tmpRate = 0
	if(!buffList[buffId]){
		return false
	}
	if(gainIds[buffId]){
		return true
	}
	tmpRate = attacker[buffId+"Atk"] - target[buffId+"Def"]
	buffRate = buffRate * (tmpRate + 1)
	if(attacker.fighting.seeded.random() < buffRate){
		return true
	}else{
		return false
	}
}
module.exports = buffFactory