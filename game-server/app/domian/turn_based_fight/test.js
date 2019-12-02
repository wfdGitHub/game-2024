var fightingFun = require("./fight/fighting.js")
var character = require("./entity/character.js")

var atkTeam = []
for(var i = 0;i < 6;i++){
	let info = {
		"maxHP" : Math.ceil(Math.random() * 1000),
		"atk" : Math.ceil(Math.random() * 300),
		"phyDef" : Math.ceil(Math.random() * 50),
		"magDef" : Math.ceil(Math.random() * 1000),
		"defaultSkill" : {type : "attack",name : "普攻",damageType : "phy",targetType : "enemy_normal","buffId" : "poison","buffArg" : 10,"buffRate" : 1,"duration" : 1},
		"angerSkill" : {type : "attack",name : "大招",damageType : "phy",targetType : "enemy_horizontal_back",turn_rate : 0.1,turn_tg:"team_all","thr_anger" : false}
	}
	atkTeam.push(new character(info))
}
var defTeam = []
for(var i = 0;i < 6;i++){
	let info = {
		"maxHP" : Math.ceil(Math.random() * 10000),
		"atk" : 100,//Math.ceil(Math.random() * 300),
		"phyDef" : Math.ceil(Math.random() * 50),
		"magDef" : Math.ceil(Math.random() * 1000),
		"healRate" : 2000,
		"defaultSkill" : {type : "heal",name : "普攻",damageType : "phy",targetType : "team_1",mul : 1,"anger_a" : 4},
		"angerSkill" : {type : "attack",name : "大招",damageType : "phy",targetType : "enemy_horizontal_back",turn_rate : 0.1,turn_tg:"team_all","thr_anger" : false}
	}
	defTeam.push(new character(info))
}
var fighting = new fightingFun(atkTeam,defTeam,{seededNum : 1000})
fighting.nextRound()