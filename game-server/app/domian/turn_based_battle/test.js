var fightContorl = require("./fightContorl.js")
var buff1 = JSON.stringify({"buffId":"skill_rud","targetType":"team_all","value":0.08,"duration":2,"rate":1})
var atkTeam = [0,0,0,{"id":504030,"s1_star":5,"s1_lv":1000,"skillTalents":{}},0]
var defTeam = [{"id":104010},0,{"id":204010},0,{"id":204010}]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
// fightContorl.fighting.fightRecord.explain()