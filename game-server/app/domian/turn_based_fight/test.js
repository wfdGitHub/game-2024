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
// // var buff = {"buffId":"ghost","buff_tg":"team_self","buffArg":5,"duration":3,"buffRate":1}
// var info = JSON.parse("{\"atkTeam\":[{\"title\":0,\"officer\":0,\"manors\":{},\"g1\":0,\"g2\":0,\"g3\":0,\"g4\":0}],\"defTeam\":[{\"g1\":0,\"g2\":0,\"g3\":0,\"g4\":0,\"officer\":1,\"comeonNum\":3},{\"id\":501030,\"evo\":1,\"exalt\":1,\"qa\":3,\"lv\":1,\"MR1\":0.33,\"MR2\":0.33,\"MR3\":0.33,\"MR4\":0.33,\"MR5\":0.33,\"MR6\":0.33,\"PS0\":4301,\"PS1\":4117,\"PS2\":4223,\"e1\":\"\",\"e2\":\"\",\"e3\":\"\",\"e4\":\"\",\"e5\":\"\",\"e6\":\"\"}],\"otps\":{\"seededNum\":1696930947632,\"masterSkills\":[]}}")
// var seededNum = 1
// var atkTeam = info.atkTeam
// var defTeam = info.defTeam
// console.log(fightContorl.videoFight(atkTeam,defTeam,info.otps))
// fightRecord.explain()
// var eInfo = {
//   lv: 6,
//   slot: 1,
//   qa: 5,
//   att: {
//     main_1: 1.2688048060781605,
//     main_2: 1.2909478501003626,
//     extra: { type: 1, M_SPE: 28, M_STK: 25 }
//   },
//   suit: '8050'
// }
// // console.log(fightContorl.makeHeroData(501010,5))
// var fabao1 = JSON.stringify({
// 	id: '10040',
// 	qa: 4,
// 	lv: 1,
// 	M1: 1.036644540879608,
// 	M2: 1.169528828473013,
// 	M3: 0.8386032290237847,
// 	M4: 1.011528704254295,
// 	slots : {1:1,2:4,3:4,4:4},
// 	spe: [ 'fabao_8110', 'fabao_7090', 'fabao_7070', 'fabao_7060']
//   })
// var heroInfo = {
//   id: 500110,
//   evo: 1,
//   exalt: 1,
//   qa: 5,
//   wash: 0,
//   lv: 1,
//   MR1: 0.6831061871242502,
//   MR2: 0.8799767815388719,
//   MR3: 0.9412484725412584,
//   MR4: 0.7064259996707376,
//   MR5: 0.692892243394845,
//   MR6: 0.7257086665568114,
//   PS0: 4101,
//   PS1: 4102,
//   PS2: 4104,
//   PS3: 4103,
//   PS4: 4110,
//   fabao1 : fabao1
// }
// // console.log(fightContorl.getFabaoData(fabao1))
// console.log(fightContorl.getFabaoCE(fabao1))