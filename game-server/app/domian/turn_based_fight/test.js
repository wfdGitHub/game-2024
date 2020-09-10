var fightContorl = require("./fight/fightContorl.js")
var fightRecord = require("./fight/fightRecord.js")
var mysterious_realm = require("../../../config/gameCfg/mysterious_realm.json")
var area_challenge = require("../../../config/gameCfg/area_challenge.json")
var checkpoints = require("../../../config/gameCfg/checkpoints.json")
// var list = fightContorl.beginFight(atkTeam,defTeam,{})
// fightRecord.explain()
// console.log(fightContorl.getFightRecord())
// console.log(fightContorl.getTeamShowData(atkTeam)[0].getSimpleInfo())
// console.log(fightContorl.getTeamShowData([{id:105050,"equip_1" : 1,"team_atk_add" : 0.1}])[0].getSimpleInfo())
// var ce
// for(var i in area_challenge){
// 	ce = fightContorl.getTeamCE(JSON.parse(area_challenge[i]["team1"]))
// 	console.log(ce)
// 	ce = fightContorl.getTeamCE(JSON.parse(area_challenge[i]["team2"]))
// 	console.log(ce)
// 	ce = fightContorl.getTeamCE(JSON.parse(area_challenge[i]["team3"]))
// 	console.log(ce)
// }
// var atkTeam = [{id:105010,star:10,artifact:25},{id:105010,star:9,artifact:25},{id:105010,star:9,artifact:25}]
// var defTeam = [{id:105010,star:10,artifact:25},{id:105010,star:10,artifact:25},{id:105010,star:10,artifact:25},{id:105010,star:10,artifact:25}]
// var winFlag = fightContorl.beginFight(atkTeam,defTeam,{})
// fightRecord.explain()
// console.log("winFlag",winFlag)