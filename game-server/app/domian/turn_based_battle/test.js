var fightContorl = require("./fightContorl.js")
//"buff1":JSON.stringify({"buffId":"atk_down","targetType":"skill_targets","mul":-0.05,"duration":2,"rate":1})
var atkTeam = [{"id":105010,skillTalents:{"maxHP_damage":0.1}},0,0,0,0]
var defTeam = [{"id":105010},0,0,0,0]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
fightContorl.fighting.fightRecord.explain()