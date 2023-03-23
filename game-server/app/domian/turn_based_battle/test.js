var fightContorl = require("./fightContorl.js")
var atkTeam = [{"id":106010,skillTalents:{"weak_damage_type":true}},0,0,0,0]
var defTeam = [{"id":106010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
fightContorl.fighting.fightRecord.explain()