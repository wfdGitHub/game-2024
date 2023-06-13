const fightCfg = require("./fightCfg.js")
var model = function() {
	this.clear()
	this.buffs = fightCfg.getCfg("buffs")
	this.heros = fightCfg.getCfg("heros")
	this.skills = fightCfg.getCfg("skills")
	this.skill_targets = fightCfg.getCfg("skill_targets")
	this.hero_talents = fightCfg.getCfg("hero_talents")
}
model.prototype.clear = function() {
	this.list = []
	this.textList = []
	this.heroMap = {}
}
model.prototype.push = function(info) {
	this.list.push(info)
	// this.explain()
}
model.prototype.getList = function() {
	return this.list.concat([])
}
model.prototype.translate = function(info) {
	switch(info.type){
		case "fightBegin":
			for(var i = 0;i < info.allHero.length;i++)
				this.heroMap[info.allHero[i]["id"]] = this.heros[info.allHero[i]["heroId"]]["name"]+info.allHero[i]["id"]
		break
		case "nextRound":
			//回合标识
			this.saveText("\n第"+info.round+"回合开始\n")
		break
		case "skill":
			//使用技能(怒气隐式更新)
			this.saveText("\033[36m["+this.heroMap[info.id]+"]使用["+info.sid+"]\033[0m    怒气 "+info.changeAnger+"("+info.curAnger+")")
			if(info.attack){
				for(var i = 0;i < info.attack.length;i++){
					this.attackInfo(info.attack[i],"  \033[31m对["+this.heroMap[info.attack[i]["id"]]+"]\t\033[0m 造成 ")
				}
			}
			if(info.heal){
				for(var i = 0;i < info.heal.length;i++){
					this.saveText("\033[32m["+this.heroMap[info.heal[i]["id"]]+"] 恢复 "+info.heal[i].realValue+"血量("+info.heal[i].hp+"/"+info.heal[i].maxHP+")\033[0m\n")
				}
			}
		break
		case "revive":
			this.saveText("\033[32m["+this.heroMap[info["id"]]+"] 复活 (血量"+info.hp+"/"+info.maxHP+")\033[0m\n")
		break
		case "other_damage":
			this.attackInfo(info,"\033[31m["+this.heroMap[info["id"]]+"] 受到 ")
		break
		case "other_heal":
			var str = ""
			str += "\033[32m["+this.heroMap[info["id"]]+"] 恢复 "+info.realValue+"血量("+info.hp+"/"+info.maxHP+")\033[0m\n"
			this.saveText(str)
		break
		case "changeAnger":
			//怒气改变（显式更新）
			this.saveText("\033[36m["+this.heroMap[info.id]+"]\033[0m 怒气 "+info.changeAnger+"("+info.curAnger+")")
		break
		case "buffDamage":
			//buff伤害
			this.attackInfo(info,"\033[31m["+this.heroMap[info["id"]]+"]\033[0m 受到 ")
		break
		case "buffAdd":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += "\033[36m["+this.heroMap[info["id"]]+"]\033[0m "+buffName+ " "+info.num+"层"
			this.saveText(str)
		break
		case "buffNum":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += "\033[36m["+this.heroMap[info["id"]]+"]\033[0m "+buffName+ " "+info.num+"层"
			this.saveText(str)
		break
		case "buffDel":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += "\033[36m["+this.heroMap[info["id"]]+"]\033[0m "+buffName+" 消失"
			this.saveText(str)
		break
		case "fightOver":
			this.saveText("\n战斗结束 ")
			switch(info.win_team){
				case "atk":
					this.saveText("攻方获胜")
				break
				case "def":
					this.saveText("守方获胜")
				break
				case "planish":
					this.saveText("平局")
				break
			}
			for(var i = 0;i < info.allHero.length;i++){
				this.saveText("["+info.allHero[i].id+"] 总伤害 "+info.allHero[i].totalDamage + " 总治疗 "+info.allHero[i].totalHeal)
			}
		break
		default : 
			this.saveText(info)
	}
}
//获取文字数据
model.prototype.getTextList = function() {
	if(!this.list.length)
		return
	for(var i = 0;i < this.list.length;i++)
		this.translate(this.list[i])
	var textList = this.textList
	this.clear()
	return textList
}
//翻译文字
model.prototype.explain = function() {
	if(!this.list.length)
		return
	for(var i = 0;i < this.list.length;i++)
		this.translate(this.list[i])
	for(var i = 0;i < this.textList.length;i++)
		console.log(this.textList[i])
	this.clear()
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
	this.saveText(str)
	if(info.splashs){
		for(var i = 0;i < info.splashs.length;i++){
			this.attackInfo(info.splashs[i],"  \033[31m溅射["+info.splashs[i]["id"]+"]\033[0m ")
		}
	}
}
//保存进文字列表
model.prototype.saveText = function(text) {
	this.textList.push(text)
}
//获取技能数据
model.prototype.getHeroData = function(heroInfo) {
	var id = heroInfo.id
	var heroData = {}
	if(!this.heros[id]){
		return "英雄不存在"
	}
	var heroCfg = this.heros[id]
	heroData.name = heroCfg["name"]
	//主属性
	heroData["s0"] = {}
	heroData["s0"].name = "普攻"
	heroData["s0"].texts = [this.getSkillText(heroCfg["defult"],heroInfo["s0_lv"])]
	heroData["s1"] = {}
	heroData["s1"].name = heroCfg["s1_name"]
	heroData["s1"].texts = {}
	for(var j = 1;j <= 5;j++)
		heroData["s1"].texts[j] = this.getSkillText(heroCfg["s1"]+j,heroInfo["s1_lv"])
	for(var i = 2;i <= 5;i++){
		var key = "s"+i
		heroData[key] = {}
		heroData[key].name = heroCfg["s"+i+"_name"]
		heroData[key].texts = {}
		for(var j = 1;j <= 5;j++){
			if(this.hero_talents[heroCfg["s"+i]+j])
				heroData[key].texts[j] = this.hero_talents[heroCfg["s"+i]+j]["des"]
		}
	}
	return heroData
}
//获取技能描述
model.prototype.getSkillText = function(sid,lv) {
		if(!this.skills[sid])
			return ""
		lv = lv || 0
		var text = this.skills[sid]["des"] || ""
		if(text){
			if(this.skills[sid]["atk_aim"] && this.skill_targets[this.skills[sid]["atk_aim"]])
				text = text.replace(/atk_aim/g,this.skill_targets[this.skills[sid]["atk_aim"]]["name"])
			text = text.replace(/atk_mul/g,Math.ceil(this.skills[sid]["atk_mul"]*100)+"%")
			text = text.replace(/atk_value/g,Math.ceil(this.skills[sid]["atk_basic"]*lv))
			text = text.replace(/d_type/g,this.skills[sid]["d_type"]=="phy"?"外功":"内功")
			if(this.skills[sid]["heal_aim"] && this.skill_targets[this.skills[sid]["heal_aim"]])
				text = text.replace(/heal_aim/g,this.skill_targets[this.skills[sid]["heal_aim"]]["name"])
			text = text.replace(/heal_mul/g,Math.ceil(this.skills[sid]["heal_mul"]*100)+"%")
			text = text.replace(/heal_value/g,Math.ceil(this.skills[sid]["heal_basic"]*lv))
		}
		return text
}
module.exports = new model()