var fightContorl = require("./fightContorl.js")
var buff1 = JSON.stringify({"buffId":"skill_rud","targetType":"team_all","value":0.08,"duration":2,"rate":1})
var atkTeam = [{"id":304030,"s1_star":5,"skillTalents":{}},0,0,0,0]
var defTeam = [{"id":105010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{"seededNum":3}))
// fightContorl.fighting.fightRecord.explain()