var fightContorl = require("./fightContorl.js")
var buff1 = JSON.stringify({"buffId":"skill_up","targetType":"team_self","value":0.2,"duration":99,"rate":1})
var atkTeam = [{"id":206010},0,0,0,0]
var defTeam = [{"id":204010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{"seededNum":2}))
// fightContorl.fighting.fightRecord.explain()