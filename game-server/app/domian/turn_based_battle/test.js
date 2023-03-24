var fightContorl = require("./fightContorl.js")
var atkTeam = [{"id":105010,skillTalents:{"weak_damage_type":true,"phy_slay":1}},0,0,0,0]
var defTeam = [{"id":105010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
fightContorl.fighting.fightRecord.explain()