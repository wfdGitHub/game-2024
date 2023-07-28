var herosCfg = require("../../../../config/gameCfg/heros.json")
var model = function() {
	this.list = []
	this.stageIndex = 0
	this.init = function() {
		this.list = []
		this.stageIndex = 0
	}
	this.push = function(info) {
		this.list.push(info)
	}
	this.getList = function() {
		return this.list.concat([])
	}
	this.isWin = function() {
		return this.list[this.list.length - 1]["winFlag"]
	}
	this.sampleResult = function() {
		var recordList = this.getList()
		var beginInfo = recordList.shift()
		console.log("战斗开始\n\n攻方阵容",JSON.stringify(beginInfo.atkTeam),"\n守方阵容",JSON.stringify(beginInfo.defTeam))
		var endInfo = recordList.pop()
		console.log("\n回合数:"+endInfo.round+"   攻方胜利:" + (endInfo.winFlag?"是":"否"))
	}
	this.getStageList = function() {
		var arr = this.list.slice(this.stageIndex)
		this.stageIndex = this.list.length
		return arr
	}
	this.explain = function() {
		var recordList = this.getList()
		while(recordList.length){
			let info = recordList.shift()
			switch(info && info.type){
				case "fightBegin":
					var heroNames = {}
					for(var i in info.atkTeam)
						if(info.atkTeam[i]["heroId"])
							heroNames[info.atkTeam[i]["id"]] = herosCfg[info.atkTeam[i]["heroId"]]["name"]+info.atkTeam[i]["id"]
					for(var i in info.defTeam)
						if(info.defTeam[i]["heroId"])
							heroNames[info.defTeam[i]["id"]] = herosCfg[info.defTeam[i]["heroId"]]["name"]+info.defTeam[i]["id"]
					// console.log("战斗开始\n攻方阵容",JSON.stringify(info.atkTeam),"\n守方阵容",JSON.stringify(info.defTeam))
						console.log("\033[34m战斗开始  初始英雄\033[0m")
					for(var i = 0;i < info.comeonHero.length;i++)
						console.log("\033[34m"+heroNames[info.comeonHero[i].id]+"   位置"+info.comeonHero[i].index+"\033[0m")
				break
				case "hero_comeon":
					var str = "\033[32m英雄"+heroNames[info.id]+"出场   位置"+info.index+"\033[0m"
					console.log(str)
				break
				case "nextRound":
					console.log("\n\033[35m第"+info.round+"轮开始\033[0m\n")
				break
				case "book":
					var str = "\033[36m天书"+info.bookId+"开始行动\033[0m"
					for(var i = 0;i < info.targets.length;i++){
						str += "\n  \033[31m攻击"+heroNames[info.targets[i].id]+"\t"
						if(info.targets[i].miss){
							str += "被闪避"
						}else if(info.targets[i].invincible){
							str += "免疫"
						}else{
							str += "造成"+ info.targets[i].value+"点伤害"
							if(info.targets[i].crit){
								str +="(暴击)"
							}
							str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP
							if(info.targets[i].kill){
								str += "\t击杀目标!"
							}
							if(info.targets[i].seckill){
								str += "\t秒杀!"
							}
							if(info.targets[i].oneblood)
								str += "\033[32m  绝处逢生\033[0m"
							str += "\033[0m"
					
						}
					}
					console.log(str)
				break
				case "master":
					var str = ""
					if(info.belong == "atk")
						str = "\033[32m我方主角开始行动\033[0m"
					else
						str = "\033[32m敌方主角开始行动\033[0m"
					if(info.skill == "heal"){
						for(var i = 0;i < info.targets.length;i++){
							if(info.targets[i].rescue){
								str += "\n  \033[32m复活"+heroNames[info.targets[i].id]
								str += "\033[0m"
							}else if(info.targets[i].turn_ghost){
								str += "\n  \033[32m亡魂"+heroNames[info.targets[i].id]
								str += "\033[0m"
							}else{
								str += "\n  \033[32m恢复"+heroNames[info.targets[i].id]+" "+info.targets[i].value+" 点血量"
								if(info.targets[i].crit){
									str +="(暴击)"
								}
								str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP+"\033[0m"
								str += "\033[0m"
							}
						}
					}else{
						for(var i = 0;i < info.targets.length;i++){
							str += "\n  \033[31m攻击"+heroNames[info.targets[i].id]+"\t"
							if(info.targets[i].miss){
								str += "被闪避"
							}else if(info.targets[i].invincible){
								str += "免疫"
							}else{
								str += "造成"+ info.targets[i].value+"点伤害"
								if(info.targets[i].crit){
									str +="(暴击)"
								}
								str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP
								if(info.targets[i].kill){
									str += "\t击杀目标!"
								}
								if(info.targets[i].seckill){
									str += "\t秒杀!"
								}
								if(info.targets[i].oneblood)
									str += "\033[32m  绝处逢生\033[0m"
								str += "\033[0m"
						
							}
						}
					}
					console.log(str)
				break
				case "characterAction":
					console.log("\033[36m"+heroNames[info.id]+"开始行动"+"\033[0m")
				break
				case "addAnger":
					console.log(""+heroNames[info.id]+"增加"+info.realValue+"点怒气("+info.curAnger+"/"+info.needAnger+")")
				break
				case "lessAnger":
					console.log(""+heroNames[info.id]+"减少"+info.realValue+"点怒气("+info.curAnger+"/"+info.needAnger+")")
				break
				case "burnDamage":
					//燃烧伤害
					var str = ""+heroNames[info.id]+"受到燃烧伤害"
					if(info.invincible){
						str += "\t免疫"
					}else{
						str += info.value+"\t剩余"+info.curValue+"/"+info.maxHP
					}
					if(info.kill){
						str += "\t"+heroNames[info.id]+"已死亡"
					}
					if(info.oneblood)
						str += "\033[32m  绝处逢生\033[0m"
					console.log(str)
				break
				case "poisonDamage":
					//中毒伤害
					var str = ""+heroNames[info.id]+"受到中毒伤害"
					if(info.invincible){
						str += "\t免疫"
					}else{
						str += info.value+"\t剩余"+info.curValue+"/"+info.maxHP
					}
					if(info.kill){
						str += "\t"+heroNames[info.id]+"已死亡"
					}
					if(info.oneblood)
						str += "\033[32m  绝处逢生\033[0m"
					console.log(str)
				break
				case "heat_halo_damage":
					var str = "\033[36m炙热光环伤害 \033[0m"
					for(var i = 0;i < info.targets.length;i++){
						str += "\n  \033[31m对"+heroNames[info.targets[i].id]+"\t"
						str += "造成"+ info.targets[i].value+"点伤害"
					}
					console.log(str)
				break
				case "recoverHeal":
					//生命值恢复
					var str = "\033[32m"+heroNames[info.id]+"恢复"+info.value+"点生命值\033[0m"
					str += "\t剩余"+info.curValue+"/"+info.maxHP
					console.log(str)
				break
				case "none":
				case "attack":
					var str = ""
					if(info.id == "atkMaster"){
						str = "\033[34m我方主角使用技能"+info.name+"\033[0m"
					}else if(info.id == "defMaster"){
						str = "\033[34m敌方主角使用技能"+info.name+"\033[0m"
					}else{
						str = "\033[36m"+heroNames[info.id]+"使用"+info.name+"\033[0m"
					}
					for(var i = 0;i < info.targets.length;i++){
						str += "\n  \033[31m攻击"+heroNames[info.targets[i].id]+"\t"
						if(info.targets[i].miss){
							str += "被闪避"
						}else if(info.targets[i].invincible){
							str += "免疫"
						}else{
							str += "造成"+ info.targets[i].value+"点伤害"
							if(info.targets[i].crit){
								str +="(暴击)"
							}
							str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP
							if(info.targets[i].kill){
								str += "\t击杀目标!"
							}
							if(info.targets[i].seckill){
								str += "\t秒杀!"
							}
							if(info.targets[i].oneblood)
								str += "\033[32m  绝处逢生\033[0m"
							str += "\033[0m"
						}
					}
					console.log(str)
				break
				case "heal":
					var str = ""
					if(info.id == "atkMaster"){
						str = "\033[34m我方主角使用技能"+info.name+"\033[0m"
					}else if(info.id == "defMaster"){
						str = "\033[34m敌方主角使用技能"+info.name+"\033[0m"
					}else{
						str = "\033[36m"+heroNames[info.id]+"使用"+info.name+"\033[0m"
					}
					for(var i = 0;i < info.targets.length;i++){
						if(info.targets[i].rescue){
							str += "\n  \033[32m复活"+heroNames[info.targets[i].id]
							str += "\033[0m"
						}else if(info.targets[i].turn_ghost){
							str += "\n  \033[32m亡魂"+heroNames[info.targets[i].id]
							str += "\033[0m"
						}else{
							str += "\n  \033[32m恢复"+heroNames[info.targets[i].id]+" "+info.targets[i].value+" 点血量"
							if(info.targets[i].crit){
								str +="(暴击)"
							}
							str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP+"\033[0m"
							str += "\033[0m"
						}
					}
					console.log(str)
				break
				case "other_heal":
					var str = ""
					for(var i = 0;i < info.targets.length;i++){
						str += "\n  \033[32m恢复"+heroNames[info.targets[i].id]+" "+info.targets[i].value+" 点血量"
						if(info.targets[i].crit){
							str +="(暴击)"
						}
						str += "\t剩余"+info.targets[i].curValue+"/"+info.targets[i].maxHP+"\033[0m"
						str += "\033[0m"
					}
					console.log(str)
				break
				case "other_damage":
					var str = "\033[31m"+heroNames[info.id]+"受到"+info.value+"点伤害\t剩余"+info.curValue+"/"+info.maxHP+"\033[0m"
					if(info.oneblood)
						str += "\033[32m  绝处逢生\033[0m"
					console.log(str)
				break
				case "self_heal":
					//自身生命值恢复
					var str = "\033[32m"+heroNames[info.id]+"自身生命值恢复\033[0m"+info.value
					str += "\t剩余"+info.curValue+"/"+info.maxHP+"\033[0m"
					console.log(str)
				break
				case "resurgence":
					var str = "\033[32m"+heroNames[info.id]+"复活\t当前生命值"+info.curValue+"/"+info.maxHP+"\033[0m"
					console.log(str)
				break
				case "createBuff":
					console.log(heroNames[info.releaser]+"对"+heroNames[info.character]+"施放 "+info.name)
				break
				case "destroyBuff":
					console.log(heroNames[info.character]+"的 "+info.name+"已消失")
				break
				case "addAtt":
					console.log(""+heroNames[info.id]+"获得增益 "+info.name+" : "+info.value)
				break
				case "fightOver":
					console.log("战斗结束")
					// for(var i = 0;i < info.atkTeam.length;i++)
					// 	console.log(info.atkTeam[i])
					// for(var i = 0;i < info.defTeam.length;i++)
					// 	console.log(info.defTeam[i])
				break
				case "extraAtion":
					console.log(heroNames[info.id]+" 获得额外回合 ")
				break
				case "show_tag":
					console.log(heroNames[info.id]+" show_tag "+info.tag)
				break
				case "buff_num":
					console.log(heroNames[info.id]+" "+info.buffId+" 剩余"+info.num+"层")
				break
				case "bp_update":
					console.log(info.belong+"主角BP值更新 "+info.BP)
				break
				default:
					console.log("类型未定义 : ",info)
			}
		}
	}
}
module.exports = new model()