var fightContorl = require("./fight/fightContorl.js")
var fightRecord = require("./fight/fightRecord.js")
var atkTeam = [{id:105030},{id:105030},{id:305030},{id:305030},{id:205030},{id:205030}]
var defTeam = [{id:305120,artifact:25},{id:305120,artifact:25}]
for(var i = 0;i < 6;i++){
  atkTeam[i] = fightContorl.getCharacterInfo(atkTeam[i])
  defTeam[i] = fightContorl.getCharacterInfo(defTeam[i])
}
var list = fightContorl.beginFight(atkTeam,defTeam,{})
// fightRecord.explain()
// console.log(fightContorl.getFightRecord())
// console.log(fightContorl.getTeamShowData(atkTeam)[0].getSimpleInfo())
// console.log(fightContorl.getTeamShowData([{id:105050,"equip_1" : 1,"team_atk_add" : 0.1}])[0].getSimpleInfo())