'use strict';
var fightContorl = require("./fightContorl.js")
var fightRecord = require("./fightRecord.js")
var buff1 = JSON.stringify({"buffId":"poison","targetType":"skill_targets","duration":3,"rate":1,"mul":1})
var atkTeam = [{},{"id":106010}]
var defTeam = [{},{"id":206010}]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
fightContorl.fighting.fightRecord.explain()
// console.log(fightContorl.fighting.fightRecord.getTextList())