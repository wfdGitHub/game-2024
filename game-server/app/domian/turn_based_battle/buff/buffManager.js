//buff管理器
const fightCfg = require("../fightCfg.js")
const buff_entity = require("./buff_entity.js")
const buff_base = require("./buff_base.js")
const normal_buff = require("./buffs/normal_buff.js")
var model = function() {
	this.buffCfg = fightCfg.getCfg("buff_cfg")
	this.buffList = {}
	// for(var buffId in this.buffCfg){
	// 	if(this.buffCfg[buffId].normal)
	// 		this.buffList[buffId] = normal_buff
	// 	else{
	// 		try{
	// 			this.buffList[buffId] = require("./buffs/"+buffId+".js")
	// 		}catch(err){
	// 			console.log(buffId+" not find",err)
	// 		}
	// 	}
	// }
}
//创建BUFF判断概率
model.prototype.createBuffWithRate = function(skill,character,buff) {
	buff = Object.assign({},buff)
	var rate = buff.rate
	//存在指定BUFF概率增加
	if(skill.target_buff_key && character.buffs[skill.target_buff_key])
		rate += Number(skill.target_buff_rate) || 0
	if(character.fighting.randomCheck(rate,"buffRate"))
		this.createBuff(skill.character,character,buff)
	else if(buff.otps.elseBuff){
		this.createBuff(skill.character,character,buff.otps.elseBuff)
	}
}
//创建BUFF
model.prototype.createBuff = function(attacker,character,buff) {
	var buffId = buff.buffId
	if(!character.checkAim())
		return
	if(!this.buffList[buffId]){
		console.error("!!!!!!!!!!buffId not find "+buffId)
		this.buffList[buffId] = normal_buff
		this.buffCfg[buffId] = {}
	}
	//控制BUFF在行动后回合数加1
	if(this.buffCfg[buffId].control){
		if(character.buffs["totem_friend_amp"])
			return
		//控制BUFF已行动则回合数加一
		if(character.isAction)
			buff.duration++
		//耗血免控BUFF
		if(character.buffs["uncontrol_losshp"] && character.getHPRate() > 0.15 && character.buffs["uncontrol_losshp"].enoughCD()){
			character.onOtherDamage(character,character.attInfo.maxHP * 0.09)
			character.fighting.fightRecord.push({type:"tag",id:character.id,tag:"uncontrol"})
			return
		}
		//对应抗性
		if(character.buffs[buffId+"Def"] && character.fighting.randomCheck(character.buffs[buffId+"Def"].getBuffMul(),"controlDef"))
			return
		if(character.buffs["yinyang"] && !character.buffs["yinyang"].free){
			character.buffs["yinyang"].free = true
			character.fighting.fightRecord.push({type:"tag",id:character.id,tag:"uncontrol"})
			return
		}
		if(character.buffs["uncontrol_once"]){
			character.buffs["uncontrol_once"].destroy()
			character.fighting.fightRecord.push({type:"tag",id:character.id,tag:"uncontrol"})
			return
		}
	}
	//印记状态下的目标无法获得护盾
	if(buffId == "hudun" && character.buffs["sign_unheal"])
		return
	if(!character.buffs[buffId])
		character.createBuff(new this.buffList[buffId](character.fighting,character,buff,this.buffCfg[buffId]))
	character.addBuff(attacker,buff)
	//控制BUFF通知友方
	if(this.buffCfg[buffId].control){
		var team = character.fighting["fightInfo"][character.belong].team
		for(var i = 0;i < team.length;i++){
			if(team[i].checkAim() && team[i].buffs["free_control"]){
				team[i].buffs["free_control"].teamBeControl(character,buffId)
				break
			}
		}
	}
}
//通过buff数据创建BUFF
model.prototype.createBuffByData = function(attacker,character,buffData) {
	this.createBuff(attacker,character,this.getBuffByData(buffData))
}
model.prototype.getBuffByData = function(buffData) {
	return new buff_base(buffData)
}
module.exports = model