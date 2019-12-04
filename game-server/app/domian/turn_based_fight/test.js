var fightContorl = require("./fight/fightContorl.js")
var atkTeam = [404030,404030,404030,404030,404030,404030]
var defTeam = [404030,404030,404030,404030,404030,404030]
for(var i = 0;i < 6;i++){
	atkTeam[i] = fightContorl.getCharacterInfo(atkTeam[i])
	// atkTeam[i].angerSkill.kill_amp = 2
	defTeam[i] = fightContorl.getCharacterInfo(defTeam[i])
	// defTeam[i].angerSkill.kill_amp = 2
}
var list = fightContorl.beginFight(atkTeam,defTeam,{})
