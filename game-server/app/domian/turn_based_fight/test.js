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
var seededNum = Date.now()
var atkTeam = [{"id":"205060","ad":5,"star":10,"lv":1,"artifact":25},{"id":"305050","ad":5,"star":10,"lv":1,"artifact":25},{"id":"305100","ad":5,"star":10,"lv":1,"artifact":25},{"id":"205010","ad":5,"star":10,"lv":1,"artifact":25},{"id":"105040","ad":5,"star":10,"lv":1,"artifact":25},{"id":"105070","ad":5,"star":10,"lv":1,"artifact":25},{"power1":{"id":200500,"lv":1,"star":1,"ad":1},"power2":{"id":300500,"lv":1,"star":1,"ad":1},"beaut_604100":{"ad":1,"star":1,"att1":0,"att2":0,"att3":0,"att4":0,"opinion":0,"id":"604100"}}]
var defTeam = [{"id":"205050","ad":5,"star":10,"lv":1,"artifact":25},{"id":"305040","ad":5,"star":10,"lv":1,"artifact":25},{"id":"405100","ad":5,"star":10,"lv":1,"artifact":25},{"id":"205030","ad":5,"star":10,"lv":1,"artifact":25},{"id":"205060","ad":5,"star":10,"lv":1,"artifact":25},{"id":"205050","ad":5,"star":10,"lv":1,"artifact":25},{"power1":{"id":400300,"lv":1,"star":1,"ad":1},"power2":{"id":400900,"lv":1,"star":1,"ad":1},"beaut_603100":{"ad":1,"star":1,"att1":0,"att2":0,"att3":0,"att4":0,"opinion":0,"id":"603100"},"bcombat":"603100","beaut_604100":{"ad":1,"star":1,"att1":0,"att2":0,"att3":0,"att4":0,"opinion":0,"id":"604100"}}]
var fighting = fightContorl.beginFight(atkTeam,defTeam,{"video":false,"seededNum":seededNum})
// var fighting = fightContorl.manualFight(atkTeam,defTeam,{})
// fightRecord.explain()
// console.log(fightContorl.getTeamData(atkTeam))
// var info = {"atkTeam":[{"id":405110,"ad":0,"lv":900,"star":20},null,null,null,null,null,{"title":"0","officer":"0","gather":"0","camp_1":0,"camp_2":0,"camp_3":0,"camp_4":0,"camp_5":0,"gjy":0,"dby":0,"qby":0,"g1":0,"g2":0,"g3":0,"g4":0}],"defTeam":[0,0,0,0,{"id":105070,"lv":75,"ad":2,"star":5,"artifact":10,"tr_lv":2,"crit":0.09,"critDef":0.045,"slay":0.09,"slayDef":0.045,"hitRate":0.09,"dodgeRate":0.045,"e1":3,"s1":400010202,"et1":14,"tr_maxHP":6400,"e2":3,"s2":400020202,"et2":14,"tr_atk":1600,"e3":3,"s3":400030202,"et3":14,"tr_phyDef":400,"e4":3,"s4":400040202,"et4":14,"tr_magDef":400,"boss":true},0,{"g1":11,"g2":11,"g3":11,"g4":11,"officer":3}],"otps":{"seededNum":1664337072575,"masterSkills":[]}}
// var fighting = fightContorl.beginFight(info.atkTeam,info.defTeam,info.otps)
// // var fighting = fightContorl.manualFight(atkTeam,defTeam,{})
// fightRecord.explain()

