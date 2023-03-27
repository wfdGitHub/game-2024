var fightContorl = require("./fightContorl.js")
var buff1 = JSON.stringify({"buffId":"skill_up","targetType":"team_self","value":0.2,"duration":99,"rate":1})
var atkTeam = [{"id":104010,"skillTalents":{"loss_hp_amp":1.56}},0,0,0,0]
var defTeam = [{"id":104010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
fightContorl.fighting.fightRecord.explain()