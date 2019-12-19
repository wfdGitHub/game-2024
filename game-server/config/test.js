var heros = require("./gameCfg/heros.json")
var heroList = {
	"star1":[],
	"star2":[],
	"star3":[],
	"star5":[],
	"star9":[],
	"star10":[],
}
for(var i in heros){
	heroList["star"+heros[i].max_star].push(Number(i))
}
console.log(heroList.star10)