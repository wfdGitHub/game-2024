var fightRecord = require("../fight/fightRecord.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
var buffList = {}
for(var buffId in buff_cfg){
	if(buff_cfg[buffId]["tool"]){
		if(buff_cfg[buffId]["toolKey"] == "round_buffs")
			buff_cfg[buffId]["toolValue"] = JSON.parse(buff_cfg[buffId]["toolValue"])
		continue
	}
	if(buff_cfg[buffId]["default"])
		buffList[buffId] = require("./defaultBuff.js")
	else
		buffList[buffId] = require("./buffs/"+buffId+".js")
}
var buffFactory = function() {}
buffFactory.init = function(seeded,fighting) {
	this.atkListenList = {}
	this.defListenList = {}
	this.seeded = seeded
	this.fighting = fighting
	this.listenId = 1
	this.listenMap = {}
}
//创建BUFF根据字符串
buffFactory.createBuffByData = function(releaser,character,str) {
	buffFactory.createBuff(releaser,character,JSON.parse(str))
}
//创建BUFF
buffFactory.createBuff = function(releaser,character,otps) {
	otps = Object.assign({},otps)
	var buffId = otps.buffId
	if(character.characterType == "master")
		return
	if(!buff_cfg[buffId]){
		console.error("buff 不存在 ",buffId)
		return
	}
	if(buff_cfg[buffId]["toolKey"])
		this.toolBuff(releaser,character,buff_cfg[buffId])
	if(buff_cfg[buffId]["tool"])
		return
	if(releaser.buffs["sneak"])
		return
	if(!otps.duration)
		otps.duration = buff_cfg[buffId]["duration"] || 1
	//亡魂不状态不可释放BUFF
	if(buffId != "ghost" && character.ghost)
		return
	//判断控制buff抗性
	if(buff_cfg[buffId].control){
		if(character.control_buff_lowrate && this.seeded.random("控制buff抗性") < character.control_buff_lowrate)
			return
		if(character.buffs["invincibleSuper"])
			return
		if(character.buffs["immune"])
			return
		if(character.always_immune)
			return
		if(character.buffs["kb_boss3"])
			return
		var defcontrol = character.defcontrol
		if(character.buffs["juexing"])
			defcontrol += 0.1
		if(this.seeded.random("免控饰品") < defcontrol)
			return
	}
	//判断灼烧、中毒buff抗性
	if(character.otps["immune_"+buffId])
		return
	if((buffId == "invincible" || buffId == "invincibleSuck") && character.buffs["burn"] && character.buffs["burn"].releaser.burn_not_invincible)
		return
	if(buff_cfg[buffId].debuff && character.loss_hp_debuff && buffId != "banish"){
		if((character.attInfo.hp / character.attInfo.maxHP) > character.loss_hp_debuff){
			fightRecord.push({type:"show_tag",id:character.id,tag:"loss_hp_debuff"})
			var info = {type : "other_damage",value : Math.floor(character.attInfo.maxHP *  character.loss_hp_debuff),id : character.id,d_type:"phy"}
			info = character.onHit(character,info)
			fightRecord.push(info)
			return
		}
	}
	//免疫巫术
	if(buffId == "wushu" && character.otps.refrain_wushu)
		return
	//判断伤害buff伤害降低
	if(buff_cfg[buffId].hurt && character.damage_buff_lowArg){
		otps.buffArg = otps.buffArg * (1 - character.damage_buff_lowArg)
	}
	if(buffList[buffId]){
		//狂暴状态不可重复触发
		if(buff_cfg[buffId].fury){
			if(character.fury)
				return
			character.fury = true
		}
		var buff
		if(character.buffs[buffId]){
			buff = character.buffs[buffId]
			buff.overlay(releaser,otps)
		}else{
			buff = new buffList[buffId](releaser,character,otps,this.fighting)
			buff.name = buff_cfg[buffId].name
			character.addBuff(releaser,buff)
		}
		if(buff)
			fightRecord.push({type : "createBuff",releaser : releaser.id,character : character.id,buffId : buffId,name : buff_cfg[buffId].name})
		if(buffId == "poison"){
			if(releaser.poison_add_forbidden){
				this.createBuff(releaser,character,{"buffId" : "forbidden","duration":1})
			}
			if(releaser.poison_settle && this.seeded.random("中毒结算") < releaser.poison_settle){
				buff.settle()
			}
		}
		if(buffId == "banAnger" && releaser.banAnger_add_forbidden){
			this.createBuff(releaser,character,{"buffId" : "forbidden","duration":1})
		}
		if(buffId == "dizzy" && releaser.dizzy_clear_anger){
			fightRecord.push({type:"show_tag",id:character.id,tag:"dizzy_clear_anger"})
			character.lessAnger(character.curAnger)
		}
		this.checkListen(buffId,character)
	}else{
		console.error("buffId 不存在",buffId)
		return false
	}
}
//设置监听回调
buffFactory.addListenerCB = function(buffId,cb) {
	var id = this.listenId++
	if(!this.listenMap[buffId])
		this.listenMap[buffId] = {}
	this.listenMap[buffId][id] = cb
	return id
}
//移除监听回调
buffFactory.delListenerCB = function(buffId,id) {
	if(this.listenMap[buffId])
		delete this.listenMap[buffId][id]
}
//设置BUFF监听
buffFactory.addListener = function(character) {
	var belong = character.belong
	var rival = this.fighting.getRival(belong)
	if(character.listen_addBuff){
		if(character.listen_enemyBuff){
			if(!this[belong+"ListenList"][character.listen_enemyBuff])
				this[belong+"ListenList"][character.listen_enemyBuff] = []
			this[belong+"ListenList"][character.listen_enemyBuff].push(character)
		}
		if(character.listen_teamBuff){
			if(!this[rival+"ListenList"][character.listen_teamBuff])
				this[rival+"ListenList"][character.listen_teamBuff] = []
			this[rival+"ListenList"][character.listen_teamBuff].push(character)
		}
	}
}
//检测BUFF监听
buffFactory.checkListen = function(buffId,character) {
	if(character.belong == "atk"){
		if(this.defListenList[buffId]){
			for(var i in this.defListenList[buffId]){
				var character = this.defListenList[buffId][i]
				if(!character["died"] && character["listen_addBuff"]){
					var rate = character["listen_addBuff"]["buffRate"]
					if(this.seeded.random("listen_addBuff") < rate)
						this.createBuff(character,character,character["listen_addBuff"])
				}
			}
		}
	}else if(character.belong == "def"){
		if(this.atkListenList[buffId]){
			for(var i in this.atkListenList[buffId]){
				var character = this.atkListenList[buffId][i]
				if(!character["died"] && character["listen_addBuff"]){
					var rate = character["listen_addBuff"]["buffRate"]
					if(this.seeded.random("listen_addBuff") < rate)
						this.createBuff(character,character,character["listen_addBuff"])
				}
			}
		}
	}
	for(var id in this.listenMap[buffId]){
		this.listenMap[buffId][id](buffId,character)
	}
}
//工具BUFF
buffFactory.toolBuff = function(releaser,character,buffInfo) {
	switch(buffInfo.toolKey){
		case "addAnger":
			character.addAnger(buffInfo.toolValue)
		break
		case "lessAnger":
			character.lessAnger(buffInfo.toolValue)
		break
		case "addHP":
			var recordInfo =  character.onHeal(releaser,{type : "heal",maxRate : buffInfo.toolValue})
			recordInfo.type = "self_heal"
			fightRecord.push(recordInfo)
		break
		case "lessHP":
			var tmpRecord = {type : "other_damage",value : character.attInfo.maxHP * buffInfo.toolValue,d_type:"mag"}
			tmpRecord = character.onHit(releaser,tmpRecord)
			fightRecord.push(tmpRecord)
		break
		case "extraAtion":
			//额外行动
			this.fighting.next_character.push(character)
		break
		case "round_buffs":
			//随机BUFF
			var rand = Math.floor(this.seeded.random() * buffInfo.toolValue.length)
			var buffInfo = buffInfo.toolValue[rand]
			this.createBuff(releaser,character,buffInfo)
		break
	}
}
module.exports = buffFactory