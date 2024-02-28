var fightContorl = require("./fight/fightContorl.js")
var fightRecord = require("./fight/fightRecord.js")


//战斗测试
var atkTeam = [{},{id : "501030","refrain_huyou":0.2,"self_atk_add":0}]
var defTeam = [{},{id : "501030","normal_buffs":[JSON.stringify({"buffId":"wushu","buff_tg":"skill_targets","duration":2,"buffRate":0.18})]}]
var list = fightContorl.beginFight(atkTeam,defTeam,{})
fightRecord.explain()

//回放战斗
// var info = {"atkTeam":[{"title":0,"officer":2,"manors":{"ATT_1":"0","ATT_2":"0","ATT_3":"0","ATT_4":"0","ATT_5":"0","ATT_6":"0"},"g1":0,"g2":0,"g3":0,"g4":0,"power1":{"id":"200400","lv":1,"ad":1,"star":7},"power2":{"id":"200300","lv":1,"ad":1,"star":7},"comeonNum":3,"manualModel":0},{"id":500130,"evo":20,"exalt":2,"qa":5,"wash":0,"lv":232,"MR1":1,"MR2":1,"MR3":1,"MR4":1,"MR5":1,"MR6":1,"PS0":4211,"PS1":4312,"PS2":4319,"PS3":4421,"PS4":4204,"hId":"285","combat":1},{"id":500140,"evo":20,"exalt":1,"qa":5,"wash":0,"lv":232,"MR1":1,"MR2":1,"MR3":1,"MR4":1,"MR5":1,"MR6":1,"PS0":4314,"PS1":4315,"PS2":4228,"PS3":4118,"PS4":4204,"hId":"288","combat":1},{"id":500120,"evo":20,"exalt":3,"qa":5,"wash":0,"lv":232,"MR1":1,"MR2":1,"MR3":1,"MR4":1,"MR5":1,"MR6":1,"PS0":4213,"PS1":4318,"PS2":4330,"PS3":4411,"PS4":4204,"hId":"286","combat":1},{"id":501060,"evo":16,"exalt":1,"qa":5,"wash":0,"lv":232,"MR1":0.7234523170094489,"MR2":0.8429108694823475,"MR3":0.8369795204575351,"MR4":0.7370466917087282,"MR5":0.8906502333170204,"MR6":0.8986350082355826,"PS0":4202,"PS1":4218,"PS2":4411,"hId":"197","evoRate":0},{"id":500110,"evo":20,"exalt":1,"qa":5,"wash":0,"lv":232,"MR1":1,"MR2":1,"MR3":1,"MR4":1,"MR5":1,"MR6":1,"PS0":4327,"PS1":4326,"PS2":4320,"PS3":4215,"hId":"284"}],"defTeam":[{"title":0,"officer":0,"manors":{},"g1":0,"g2":0,"g3":0,"g4":0,"comeonNum":3},{"id":501090,"evo":1,"exalt":1,"qa":5,"wash":0,"lv":61,"MR1":1.0222836486587878,"MR2":0.8021386021071425,"MR3":0.6671765540838295,"MR4":0.6856595446808228,"MR5":0.8860263136464316,"MR6":0.8302617277678406,"PS0":4118,"PS1":4311,"PS2":4422,"hId":"231e5490-b8d1-11ee-a59a-3b129114bccf","combat":1},{"id":501100,"evo":1,"exalt":1,"qa":5,"wash":0,"lv":61,"MR1":0.8112889769491988,"MR2":0.9998604339709122,"MR3":0.740575003720492,"MR4":0.9703893381598233,"MR5":0.9930767119381277,"MR6":0.9828495246305567,"PS0":4312,"PS1":4115,"PS2":4415,"hId":"231e5491-b8d1-11ee-a59a-3b129114bccf","combat":1},{"id":501110,"evo":1,"exalt":1,"qa":5,"wash":0,"lv":61,"MR1":0.929541850876351,"MR2":0.9901060800834117,"MR3":0.673176665132994,"MR4":1.0186524656734341,"MR5":0.7495965202646525,"MR6":0.739612050491583,"PS0":4221,"PS1":4215,"PS2":4409,"hId":"231e5492-b8d1-11ee-a59a-3b129114bccf","combat":1}],"fightOtps":{"seededNum":1710126014282,"manual":true}}
// var list = fightContorl.beginFight(info.atkTeam,info.defTeam,info.otps)
// fightRecord.explain()


//定制英雄
// var info = fightContorl.gainDIYHero(901010,{"DIY_N":[0,1],"D1":[0,0],"PS1":[0,1]})
// console.log(info)

// var info = {"atkTeam":[{"manualModel":0},{"id":"500230","lv":1,"evo":1,"exalt":1,"qa":5,"wash":0,"MR1":1,"MR2":1,"MR3":1,"MR4":1,"MR5":1,"MR6":1,"PS0":4305,"PS1":4315,"PS2":4228,"PS3":4301,"m_ps":1}],"defTeam":[{"manualModel":0},{"id":"500130","lv":232,"evo":20,"exalt":1,"qa":5,"wash":0,"MR1":1,"MR2":1,"MR3":1,"MR4":1,"MR5":1,"MR6":1,"PS0":4213,"PS1":4318,"PS2":4330,"PS3":4411,"PS4":4204}],"fightOtps":{"seededNum":1703556647751,"manual":true}}
// var atkTeam = info.atkTeam
// var defTeam = info.defTeam
// var list = fightContorl.beginFight(atkTeam,defTeam,{})
// fightRecord.explain()