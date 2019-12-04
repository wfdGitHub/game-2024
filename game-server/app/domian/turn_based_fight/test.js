var fightContorl = require("./fight/fightContorl.js")
var atkTeam = [405080,405080,405080,405080,405080,405080]
var defTeam = [105080,405070,105080,405070,105080,405070]
for(var i = 0;i < 6;i++){
	atkTeam[i] = fightContorl.getCharacterInfo(atkTeam[i])
	defTeam[i] = fightContorl.getCharacterInfo(defTeam[i])
}
var list = fightContorl.beginFight(atkTeam,defTeam,{})
