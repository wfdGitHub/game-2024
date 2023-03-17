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
		case "nextRound":
			console.log("\n第"+info.round+"回合开始\n")
		break
		case "skill":
			console.log("\033[36m["+info.id+"号]使用["+info.sid+"]\033[0m    怒气"+info.changeAnger+"("+info.curAnger+")")
			for(var i = 0;i < info.attack.length;i++){
				var str = ""
				str += "  \033[31m对["+info.attack[i]["id"]+"]\t\033[0m 造成 "+info.attack[i].realValue+"伤害("+info.attack[i].hp+"/"+info.attack[i].maxHP+")"
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
		break
		default : 
			console.log(info)
	}
	this.explain()
}
module.exports = model