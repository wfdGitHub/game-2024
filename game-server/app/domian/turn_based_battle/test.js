var fightContorl = require("./fightContorl.js")
var buff1 = JSON.stringify({"buffId":"skill_rud","targetType":"team_all","value":0.08,"duration":2,"rate":1})
var atkTeam = [{"id":105010,"skillTalents":{"attack_share":true}},0,0,0,0]
var defTeam = [{"id":105010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
// fightContorl.fighting.fightRecord.explain()