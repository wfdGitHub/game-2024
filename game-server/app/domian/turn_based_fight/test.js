var fightContorl = require("./fight/fightContorl.js")
var atkTeam = [205010,205020,205030,205080,205070,205050]
var defTeam = [305050,305080,305040,305010,305030,305070]
for(var i = 0;i < 6;i++){
	atkTeam[i] = fightContorl.getCharacterInfo(atkTeam[i])
	defTeam[i] = fightContorl.getCharacterInfo(defTeam[i])
}
var list = fightContorl.beginFight(atkTeam,defTeam,{})
