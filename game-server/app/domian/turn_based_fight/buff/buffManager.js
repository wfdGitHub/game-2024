let buffIds = ["disarm","dizzy","forbidden","silence","burn","poison","amplify","reduction","recover","invincibleSuper","invincible"]
let controlBuff = {
	"disarm" : true,
	"dizzy" : true,
	"silence" : true
}
var buffList = {}
var fightRecord = require("../fight/fightRecord.js")
for(var i = 0;i < buffIds.length;i++){
	buffList[buffIds[i]] = require("./buffs/"+buffIds[i]+".js")
}
var buffFactory = function() {}
buffFactory.init = function(seeded) {
	this.seeded = seeded
}
//创建BUFF
buffFactory.createBuff = function(releaser,character,otps) {
	var buffId = otps.buffId
	//判断控制buff抗性
	if(controlBuff[buffId] && character.control_buff_lowrate && this.seeded.random("判断控制buff抗性") < character.control_buff_lowrate){
		console.log("控制buff概率降低生效")
		return
	}
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
		console.error("buffId 不存在",buffId)
		return false
	}
}
module.exports = buffFactory