var fightContorlFun = require("./app/domian/fight/fightContorl.js")
var mobFun = require("./app/domian/entity/mob.js")
var heroFun = require("./app/domian/entity/hero.js")
var characters = require("./config/gameCfg/characters.json")
var atkTeamInfo = [{characterId : 10001}]
var defTeamInfo = [{characterId : 11001}]
fightContorl = fightContorlFun()
var result = fightContorl.fighting(atkTeamInfo,defTeamInfo)
console.log(result)