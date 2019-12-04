var buffIds = ["disarm","dizzy","forbidden","silence","burn","poison","amplify","reduction"]
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
		//当回合对自身释放的BUFF回合数+1
		if(releaser == character){
			otps.duration += 1
		}
		var buff
		if(character.buffs[buffId]){
			buff = character.buffs[buffId]
			buff.overlay(releaser,otps)
		}else{
			buff = new buffList[buffId](releaser,character,otps)
		}
		fightRecord.push({type : "createBuff",releaser : releaser.id,character : character.id,buffId : buffId,name : buff.name})
		character.addBuff(releaser,buff)
	}else{
		return false
	}
}
module.exports = buffFactory