'use strict';
var fightContorl = require("./fightContorl.js")
var buff1 = JSON.stringify({"buffId":"petrify","targetType":"skill_targets","duration":2,"rate":1})
var atkTeam = [{"id":104010,"s1_lv":100,"s1_star":5,"s2_star":5,"s3_star":5,"s4_star":5,"s5_star":5,"skillTalents":{},"heroTalents":{"speed":10}},0,0,0,0]
var defTeam = [{"id":306020,"s1_lv":0},0,0,{"id":405040,"s1_lv":0},{"id":405040,"s1_lv":0}]
console.log(fightContorl.beginFight(atkTeam,defTeam,{"seededNum":300}))
// fightContorl.fighting.fightRecord.explain()