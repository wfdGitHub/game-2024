var fightContorl = require("./fight/fightContorl.js")
var atkTeam = [{id : 405040},{id : 405040},{id : 405040},{id : 405040},{id : 405040},{id : 405040}]
var defTeam = [{id : 105050},{id : 105050},{id : 105050},{id : 105050},{id : 105050},{id : 105050}]
for(var i = 0;i < 6;i++){
	// atkTeam[i].self_adds = {atk : 1}
	// atkTeam[i].skill_anger_first = 3
	atkTeam[i] = fightContorl.getCharacterInfo(atkTeam[i])
	// atkTeam[i].angerSkill.buffArg = 0.5
	// atkTeam[i].angerSkill.duration = 1
	// atkTeam[i].angerSkill.buffRate = 1
	// defTeam[i].self_adds = {atk : 2}
	// defTeam[i].skill_heal_amp = 1
	defTeam[i] = fightContorl.getCharacterInfo(defTeam[i])
	// defTeam[i].angerSkill.kill_amp = 2
}
var list = fightContorl.beginFight(atkTeam,defTeam,{})
