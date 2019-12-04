var fightContorl = require("./fight/fightContorl.js")
var atkTeam = [105010,105010,105010,105010,105010,105010]
var defTeam = [404010,405070,404010,405070,404010,405070]
for(var i = 0;i < 6;i++){
	atkTeam[i] = fightContorl.getCharacterInfo(atkTeam[i])
	atkTeam[i].defaultSkill = 
	defTeam[i] = fightContorl.getCharacterInfo(defTeam[i])
}
var list = fightContorl.beginFight(atkTeam,defTeam,{})
