var buffIds = ["disarm","dizzy","forbidden","silence"]
var buffList = {}
var fightRecord = require("../fight/fightRecord.js")
for(var i = 0;i < buffIds.length;i++){
	buffList[buffIds[i]] = require("./buffs/"+buffIds[i]+".js")
}
var buffFactory = function() {}
//创建BUFF
buffFactory.createBuff = function(releaser,character,otps) {
	var buffId = otps.buffId
	if(buffList[buffId]){
		var buff = new buffList[buffId](releaser,character,otps)
		fightRecord.push({type : "createBuff",releaser : releaser.id,character : character.id,buffId : buffId,name : buff.name})
		character.addBuff(releaser,buff)
	}else{
		return false
	}
}
module.exports = buffFactory