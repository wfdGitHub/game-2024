const fightCfg = require("./fightCfg.js")
var model = function(fighting) {
	this.fighting = fighting
	this.list = []
	this.stageIndex = 0
	this.heroMap = {}
	this.buffs = fightCfg.getCfg("buffs")
	this.heros = fightCfg.getCfg("heros")
}
model.prototype.init = function() {
	this.list = []
	this.stageIndex = 0
	this.heroMap = {}
}
model.prototype.push = function(info) {
	this.list.push(info)
	this.explain()
}
model.prototype.getList = function() {
	return this.list.concat([])
}
model.prototype.isWin = function() {
	return this.fighting.getNormalWin()
}
model.prototype.explain = function() {
	if(!this.list.length)
		return
	var info = this.list.shift()
	switch(info.type){
		case "fightBegin":
			for(var i = 0;i < info.allHero.length;i++)
				this.heroMap[info.allHero[i]["id"]] = this.heros[info.allHero[i]["heroId"]]["name"]+info.allHero[i]["id"]
		break
		case "nextRound":
			//回合标识
			console.log("\n第"+info.round+"回合开始\n")
		break
		case "skill":
			//使用技能(怒气隐式更新)
			console.log("\033[36m["+this.heroMap[info.id]+"]使用["+info.sid+"]\033[0m    怒气 "+info.changeAnger+"("+info.curAnger+")")
			if(info.attack){
				for(var i = 0;i < info.attack.length;i++){
					this.attackInfo(info.attack[i],"  \033[31m对["+this.heroMap[info.attack[i]["id"]]+"]\t\033[0m 造成 ")
				}
			}
			if(info.heal){
				for(var i = 0;i < info.heal.length;i++){
					console.log("\033[32m["+this.heroMap[info.heal[i]["id"]]+"] 恢复 "+info.heal[i].realValue+"血量("+info.heal[i].hp+"/"+info.heal[i].maxHP+")\033[0m\n")
				}
			}
		break
		case "revive":
			console.log("\033[32m["+this.heroMap[info["id"]]+"] 复活 (血量"+info.hp+"/"+info.maxHP+")\033[0m\n")
		break
		case "other_damage":
			this.attackInfo(info,"\033[31m["+this.heroMap[info["id"]]+"] 受到 ")
		break
		case "other_heal":
			var str = ""
			str += "\033[32m["+this.heroMap[info["id"]]+"] 恢复 "+info.realValue+"血量("+info.hp+"/"+info.maxHP+")\033[0m\n"
			console.log(str)
		break
		case "changeAnger":
			//怒气改变（显式更新）
			console.log("\033[36m["+this.heroMap[info.id]+"]\033[0m 怒气 "+info.changeAnger+"("+info.curAnger+")")
		break
		case "buffDamage":
			//buff伤害
			this.attackInfo(info,"\033[31m["+this.heroMap[info["id"]]+"]\033[0m 受到 ")
		break
		case "buffAdd":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += "\033[36m["+this.heroMap[info["id"]]+"]\033[0m "+buffName+ " "+info.num+"层"
			console.log(str)
		break
		case "buffNum":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += "\033[36m["+this.heroMap[info["id"]]+"]\033[0m "+buffName+ " "+info.num+"层"
			console.log(str)
		break
		case "buffDel":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += "\033[36m["+this.heroMap[info["id"]]+"]\033[0m "+buffName+" 消失"
			console.log(str)
		break
		case "fightOver":
			console.log("\n战斗结束 ")
			switch(info.win_team){
				case "atk":
					console.log("攻方获胜")
				break
				case "def":
					console.log("守方获胜")
				break
				case "planish":
					console.log("平局")
				break
			}
			for(var i = 0;i < info.allHero.length;i++){
				console.log("["+info.allHero[i].id+"] 总伤害 "+info.allHero[i].totalDamage + " 总治疗 "+info.allHero[i].totalHeal)
			}
		break
		default : 
			console.log(info)
	}
	this.explain()
}
//伤害数据
model.prototype.attackInfo = function(info,str) {
	str += info.realValue
	if(info["d_type"] == "phy")
		str += "外功"
	else if(info["d_type"] == "mag")
		str += "内功"
	str += "伤害("+info.hp+"/"+info.maxHP+")"+"(怒气"+info.curAnger+")"
	if(info.hudun)
		str += "\t(护盾抵消"+info.hudun+")"
	if(info.dodge)
		str += "\t闪避"
	if(info.immune)
		str += "\t免疫"
	if(info.block)
		str += "\t格挡"
	if(info.crit)
		str += "\t暴击"
	if(info.seckill)
		str += "\t秒杀"
	if(info.died)
		str += "\t死亡"
	console.log(str)
	if(info.splashs){
		for(var i = 0;i < info.splashs.length;i++){
			this.attackInfo(info.splashs[i],"  \033[31m溅射["+info.splashs[i]["id"]+"]\033[0m ")
		}
	}
}
module.exports = model