var model = function() {
	this.list = []
	this.init = function() {
		this.list = []
	}
	this.push = function(info) {
		this.list.push(info)
	}
	this.getList = function() {
		return this.list.concat([])
	}
	this.explain = function() {
		var recordList = this.getList()
		var beginInfo = recordList.shift()
		console.log("战斗开始\n攻方阵容",JSON.stringify(beginInfo.atkTeam),"\n守方阵容",JSON.stringify(beginInfo.defTeam))
		while(recordList.length){
			let info = recordList.shift()
			switch(info.type){
				case "nextRound":
					console.log("\033[35m第"+info.round+"轮开始\033[0m")
				break
				case "characterAction":
					console.log("\033[36m角色"+info.id+"开始行动"+"\033[0m")
				break
				case "addAnger":
					// console.log("角色"+info.id+"增加"+info.realValue+"点怒气("+info.curAnger+"/"+info.needAnger+")")
				break
				case "lessAnger":
					// console.log("角色"+info.id+"减少"+info.realValue+"点怒气("+info.curAnger+"/"+info.needAnger+")")
				break
				case "burnDamage":
					//燃烧伤害
					var str = "角色"+info.id+"受到燃烧伤害"+info.realValue
					str += "\t剩余"+info.curValue+"/"+info.maxHP
					if(info.kill){
						str += "\t角色已死亡"
					}
					console.log(str)
				break
				case "poisonDamage":
					//中毒伤害
					var str = "角色"+info.id+"受到中毒伤害"+info.realValue
					str += "\t剩余"+info.curValue+"/"+info.maxHP
					if(info.kill){
						str += "\t角色已死亡"
					}
					console.log(str)
				break
				case "attack":
					var str = "\033[36m角色"+info.id+"使用"+info.name+"\033[0m"
					for(var i = 0;i < info.targets.length;i++){
						str += "\n  \033[31m攻击角色"+info.targets[i].id+"\t"
						if(info.targets[i].miss){
							str += "被闪避"
						}else{
							str += "造成"+ info.targets[i].realValue+"点伤害"
							if(info.targets[i].crit){
								str +="(暴击)"
							}
							str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP
							if(info.targets[i].kill){
								str += "\t击杀目标!"
							}
							str += "\033[0m"
					
						}
					}
					console.log(str)
				break
				case "heal":
					var str = "\033[36m角色"+info.id+"使用"+info.name+"\033[0m"
					for(var i = 0;i < info.targets.length;i++){
						str += "\n  \033[32m恢复角色"+info.targets[i].id+" "+info.targets[i].realValue+" 点血量"
						if(info.targets[i].crit){
							str +="(暴击)"
						}
						str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP+"\033[0m"
						str += "\033[0m"
					}
					console.log(str)
				break
				case "createBuff":
					console.log("角色"+info.releaser+"对角色"+info.character+"施放 "+info.name)
				break
				case "destroyBuff":
					console.log("角色"+info.character+"的 "+info.name+"已消失")
				break
				case "fightOver":
					console.log("战斗结束")
				break
				default:
					console.error("类型未定义 : ",info.type)
			}
		}
	}
}
module.exports = new model()