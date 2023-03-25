var fightContorl = require("./fightContorl.js")
// var buff1 = JSON.stringify({"buffId":"mag_damage","targetType":"skill_targets","mul":0.3,"duration":2,"rate":1})
var atkTeam = [{"id":105050,"s1_star":5},0,0,0,0]
var defTeam = [{"id":104010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
fightContorl.fighting.fightRecord.explain()