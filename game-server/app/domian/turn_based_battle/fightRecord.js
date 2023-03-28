var model = function(fighting) {
	this.fighting = fighting
	this.list = []
	this.stageIndex = 0
}
model.prototype.init = function() {
	this.list = []
	this.stageIndex = 0
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
			console.log("战斗开始")
		break
		case "nextRound":
			//回合标识
			console.log("\n第"+info.round+"回合开始\n")
		break
		case "skill":
			//使用技能(怒气隐式更新)
			console.log("\033[36m["+info.id+"号]使用["+info.sid+"]\033[0m    怒气 "+info.changeAnger+"("+info.curAnger+")")
			if(info.attack){
				for(var i = 0;i < info.attack.length;i++){
					var str = ""
					str += "  \033[31m对["+info.attack[i]["id"]+"]\t\033[0m 造成 "+info.attack[i].realValue
					if(info.attack[i]["d_type"] == "phy")
						str += "外功"
					else if(info.attack[i]["d_type"] == "mag")
						str += "内功"
					str += "伤害("+info.attack[i].hp+"/"+info.attack[i].maxHP+")"+"(怒气"+info.attack[i].curAnger+")"
					if(info.attack[i].hudun)
						str += "\t(护盾抵消"+info.attack[i].hudun+")"
					if(info.attack[i].dodge)
						str += "\t闪避"
					if(info.attack[i].block)
						str += "\t格挡"
					if(info.attack[i].crit)
						str += "\t暴击"
					if(info.attack[i].died)
						str += "\t死亡"
					console.log(str)
				}
			}
		break
		case "other_damage":
			var str = ""
			str += "\033[31m["+info["id"]+"] 受到 "+info.realValue+"伤害("+info.hp+"/"+info.maxHP+")\033[0m\n"
			console.log(str)
		break
		case "other_heal":
			var str = ""
			str += "\033[32m["+info["id"]+"] 恢复 "+info.realValue+"血量("+info.hp+"/"+info.maxHP+")\033[0m\n"
			console.log(str)
		break
		case "changeAnger":
			//怒气改变（显式更新）
			console.log("\033[36m["+info.id+"号]\033[0m 怒气 "+info.changeAnger+"("+info.curAnger+")")
		break
		case "buffDamage":
			//buff伤害
			var str = ""
			str += "\033[31m["+info["id"]+"]\033[0m 受到 "+info.bId+" "+info.realValue+"伤害("+info.hp+"/"+info.maxHP+")"
			console.log(str)
		break
		case "buffAdd":
			var str = ""
			str += "\033[36m["+info["id"]+"]\033[0m BUFF新增 "+info.bId+ "  "+info.num+"层"
			console.log(str)
		break
		case "buffNum":
			var str = ""
			str += "\033[36m["+info["id"]+"]\033[0m BUFF更新 "+info.bId+ "  "+info.num+"层"
			console.log(str)
		break
		case "buffDel":
			var str = ""
			str += "\033[36m["+info["id"]+"]\033[0m BUFF消失 "+info.bId
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
module.exports = model