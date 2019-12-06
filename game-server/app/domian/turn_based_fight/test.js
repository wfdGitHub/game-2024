var fightContorl = require("./fight/fightContorl.js")
var atkTeam = [405040,405040,405040,405040,405040,405040]
var defTeam = [405040,405040,405040,405040,405040,405040]
for(var i = 0;i < 6;i++){
	atkTeam[i] = fightContorl.getCharacterInfo(atkTeam[i])
	// atkTeam[i].angerSkill.buff_tg = "team_all"
	// atkTeam[i].angerSkill.buffArg = 0.5
	// atkTeam[i].angerSkill.duration = 1
	// atkTeam[i].angerSkill.buffRate = 1
	defTeam[i] = fightContorl.getCharacterInfo(defTeam[i])
	// defTeam[i].angerSkill.kill_amp = 2
}
var list = fightContorl.beginFight(atkTeam,defTeam,{})
