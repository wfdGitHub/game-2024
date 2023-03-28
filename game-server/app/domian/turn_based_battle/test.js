var fightContorl = require("./fightContorl.js")
var buff1 = JSON.stringify({"buffId":"skill_up","targetType":"team_self","value":0.2,"duration":99,"rate":1})
var atkTeam = [{"id":204010},{"id":204010},{"id":204010},{"id":204010},{"id":204010}]
var defTeam = [{"id":204010},{"id":204010},{"id":204010},{"id":204010},{"id":204010}]
console.log(fightContorl.beginFight(atkTeam,defTeam,{"seededNum":2}))
// fightContorl.fighting.fightRecord.explain()
