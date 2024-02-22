const fightCfg = require("./fightCfg.js")
const serverColors = {
	"end" : "\033[0m",
	"blue" : "\033[36m",
	"green" : "\033[32m",
	"red" : "\033[31m"
}
const cocosColors = {
	"end" : "</color>",
	"blue" : "<color=blue>",
	"green" : "<color=green>",
	"red" : "<color=red>"
}
var colors = serverColors
var model = function() {
	this.buffs = fightCfg.getCfg("buff_cfg")
	this.heros = fightCfg.getCfg("heros")
	this.skills = fightCfg.getCfg("skills")
	this.skill_targets = fightCfg.getCfg("skill_target")
}
model.prototype.clear = function(fighting) {
	this.list = []
	this.textList = []
	this.heroMap = {}
	this.fighting = fighting
}
model.prototype.push = function(info) {
	info.t = this.fighting.RUNTIME
	this.translate(info)
	// this.list.push(info)
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
		case "move":
			//英雄移动
			this.saveText(info.t/1000+"s "+colors["green"]+"["+this.heroMap[info.id]+"]移动至["+info.pos.x+","+info.pos.y+"]"+colors["end"])
		break
		case "b_move":
			//弹道移动
			this.saveText(info.t/1000+"s "+colors["green"]+"[弹道"+info.id+"]从["+info.ori.x+","+info.ori.y+"]移动至["+info.pos.x+","+info.pos.y+"]"+colors["end"])
		break
		case "skill":
			//使用技能(怒气隐式更新)
			this.saveText(info.t/1000+"s "+colors["blue"]+"["+this.heroMap[info.id]+"]使用["+info.sid+"]"+colors["end"])
		break
		case "damage":
			if(info.list)
				for(var i = 0;i < info.list.length;i++)
					this.attackInfo(info.list[i],colors["red"]+"(来自"+this.heroMap[info["id"]]+")"+"对["+this.heroMap[info.list[i]["id"]]+"]\t"+colors["end"]+" 造成 ")
		break
		case "heal":
			if(info.list)
				for(var i = 0;i < info.list.length;i++)
					this.healInfo(info.list[i],"  "+colors["green"]+"(来自"+this.heroMap[info["id"]]+")"+"使["+this.heroMap[info.list[i]["id"]]+"]\t"+colors["end"]+" 恢复 ")
		break
		case "revive":
			this.saveText(colors["green"]+"["+this.heroMap[info["id"]]+"] 复活 (血量"+info.hp+"/"+info.maxHP+")\033[0m\n")
		break
		case "other_damage":
			this.attackInfo(info,colors["red"]+"["+this.heroMap[info["id"]]+"] 受到 ")
		break
		case "other_heal":
			var str = ""
			str += colors["green"]+"["+this.heroMap[info["id"]]+"] 恢复 "+info.realValue+"血量("+info.hp+"/"+info.maxHP+")\033[0m\n"
			this.saveText(str)
		break
		case "changeAnger":
			//怒气改变（显式更新）
			this.saveText(colors["blue"]+"["+this.heroMap[info.id]+"]"+colors["end"]+" 怒气 "+info.changeAnger+"("+info.curAnger+")")
		break
		case "buffDamage":
			//buff伤害
			this.attackInfo(info,colors["red"]+"["+this.heroMap[info["id"]]+"]"+colors["end"]+" 受到 ")
		break
		case "buffAdd":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += colors["blue"]+"["+this.heroMap[info["id"]]+"]"+colors["end"]+" "+buffName+ " "+info.num+"层"
			this.saveText(str)
		break
		case "buffNum":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += colors["blue"]+"["+this.heroMap[info["id"]]+"]"+colors["end"]+" "+buffName+ " "+info.num+"层"
			this.saveText(str)
		break
		case "buffDel":
			var buffName = this.buffs[info["bId"]]["name"]
			var str = ""
			str += colors["blue"]+"["+this.heroMap[info["id"]]+"]"+colors["end"]+" "+buffName+" 消失"
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
//获取客户端显示文字
model.prototype.getCocosTextList = function() {
	colors = cocosColors
	var textList = this.getTextList()
	for(var i = 0;i < this.textList.length;i++){
		this.textList[i] = this.textList[i].replace(/\[\\033\[36m\[]/g,"<color=#ff0000>")
	}
	return textList
}
//获取文字数据
model.prototype.getTextList = function(type) {
	if(!this.list.length)
		return
	for(var i = 0;i < this.list.length;i++)
		this.translate(this.list[i],type)
	var textList = this.textList
	this.clear()
	return textList
}
//翻译文字
model.prototype.explain = function() {
	colors = serverColors
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
		str += "物理"
	else if(info["d_type"] == "mag")
		str += "法术"
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
			this.attackInfo(info.splashs[i],"  "+colors["red"]+"溅射["+info.splashs[i]["id"]+"]\033[0m ")
		}
	}
}
//治疗数据
model.prototype.healInfo = function(info,str) {
	str += info.value
	str += "("+info.hp+"/"+info.maxHP+")"
	this.saveText(str)
}
//保存进文字列表
model.prototype.saveText = function(text) {
	console.log(text)
	// this.textList.push(text)
}
module.exports = new model()