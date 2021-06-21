var fightContorl = require("./fight/fightContorl.js")
var fightRecord = require("./fight/fightRecord.js")
var mysterious_realm = require("../../../config/gameCfg/mysterious_realm.json")
var area_challenge = require("../../../config/gameCfg/area_challenge.json")
var arena_rank = require("../../../config/gameCfg/arena_rank.json")
var checkpoints = require("../../../config/gameCfg/checkpoints.json")
var ttttower_level = require("../../../config/gameCfg/ttttower_level.json")
// var list = fightContorl.beginFight(atkTeam,defTeam,{})
// fightRecord.explain()
// console.log(fightContorl.getFightRecord())
// console.log(fightContorl.getTeamShowData(atkTeam)[0].getSimpleInfo())
// console.log(fightContorl.getTeamShowData([{id:105050,"equip_1" : 1,"team_atk_add" : 0.1}])[0].getSimpleInfo())
// 封神战力
// var ce
// for(var i in area_challenge){
// 	ce = fightContorl.getTeamCE(JSON.parse(area_challenge[i]["team1"]))
// 	console.log(ce)
// 	ce = fightContorl.getTeamCE(JSON.parse(area_challenge[i]["team2"]))
// 	console.log(ce)
// 	ce = fightContorl.getTeamCE(JSON.parse(area_challenge[i]["team3"]))
// 	console.log(ce)
// }
//竞技场战力
// for(var i in arena_rank){
// 	var ce = fightContorl.getTeamCE(JSON.parse(arena_rank[i]["team"]))
// 	console.log(ce)
// }
//通天塔战力
// for(var i in ttttower_level){
// 	var ce = fightContorl.getTeamCE(JSON.parse(ttttower_level[i]["defTeam"]))
// 	console.log(ce)
// }
// var atkTeam = [{id:305010,star:10,artifact:25,kill_clear_buff:1},{id:305010,star:9,artifact:25,kill_clear_buff:1},{id:305010,star:9,artifact:25,kill_clear_buff:1}]
// var defTeam = [{id:305020,star:10,artifact:25},{id:305020,star:10,artifact:25},{id:305020,star:10,artifact:25},{id:305020,star:10,artifact:25}]
// var atkTeam = [{id:305010,star:10},{id:305010,star:10}]
// var defTeam = [{id:205020,star:5,died_buff_s:"{\"buffId\":\"invincible\",\"duration\":1,\"buffRate\":0.5,\"buff_tg\":\"friend_minHp_1\"}"},{id:205020,star:5,died_buff_s:"{\"buffId\":\"invincible\",\"duration\":1,\"buff_tg\":\"friend_minHp_1\",\"buffRate\":0.5}"}]
// var atkTeam = [{"id":"405080"},0,0,0,0,0]
// var defTeam = [{"id":"405080","first_buff":JSON.stringify({"buffId":"banish","duration":1})},0,0,0,0,0]
// var list = fightContorl.beginFight(atkTeam,defTeam,{})
// fightRecord.explain()
// var winFlag = fightContorl.beginFight(atkTeam,defTeam,{seededNum : Date.now()})
// console.log(atkTeam)
// var list = fightContorl.getFightRecord()
// var overInfo = list[list.length - 1]
// for(var i = 0;i<atkTeam.length;i++){
// 	if(atkTeam[i] && overInfo.atkTeam[i]){
// 		atkTeam[i]["surplus_health"] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
// 	}
// }
// console.log(atkTeam)
// fightContorl.beginFight(atkTeam,defTeam,{seededNum : Date.now()})
// list = fightContorl.getFightRecord()
// overInfo = list[list.length - 1]
// for(var i = 0;i<atkTeam.length;i++){
// 	if(atkTeam[i] && overInfo.atkTeam[i]){
// 		atkTeam[i]["surplus_health"] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
// 	}
// }
// console.log(atkTeam)
// fightContorl.beginFight(atkTeam,defTeam,{seededNum : Date.now()})
// list = fightContorl.getFightRecord()
// overInfo = list[list.length - 1]
// for(var i = 0;i<atkTeam.length;i++){
// 	if(atkTeam[i] && overInfo.atkTeam[i]){
// 		atkTeam[i]["surplus_health"] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
// 	}
// }
// console.log(atkTeam)

var atkTeam = [0,{"id":"305020","artifact":25,"star":15,"skill_clear_debuff":true},0,0,0,0,{}]
var defTeam = [0,{"id":"305020","artifact":25,"star":15,"buffRate":1},0,0,0,0,{}]
var list = fightContorl.beginFight(atkTeam,defTeam,{})
fightRecord.explain()
