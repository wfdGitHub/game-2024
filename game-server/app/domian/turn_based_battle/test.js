'use strict';
var fightContorl = require("./fightContorl.js")
var fightRecord = require("./fightRecord.js")
var atkTeam = [{},{"id":500120}]
var defTeam = [{},{"id":500120}]
console.log(fightContorl.beginFight(atkTeam,defTeam,{}))
fightContorl.fighting.fightRecord.explain()
// console.log(fightContorl.fighting.fightRecord.getTextList())