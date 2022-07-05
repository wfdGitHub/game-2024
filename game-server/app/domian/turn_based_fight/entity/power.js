var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
//主角技能
var model = function(master,otps) {
	this.master = master 								//主角
	this.type = otps.type || "attack"					//类型  heal  attack
	this.skillId = otps.skillId							//技能ID
	this.mul = otps.mul || 1 							//技能系数
	this.damageType = otps.damageType || "phy" 			//伤害类型（目标防御选取）phy 物理伤害 mag 法术伤害
	this.targetType = otps.targetType || "enemy_normal"	//目标类型  normal
	this.NEED_BP = otps.NEED_BP || 10					//所需BP值
	this.NEED_CD = otps.NEED_CD || 10 					//技能所需CD
	this.CUR_CD = otps.CUR_CD || 0						//初始CD
	this.skill_buffs = {}								//技能附带BUFF
	if(otps["buff1"])
		this.addBuff(otps["buff1"])
	if(otps["buff2"])
		this.addBuff(otps["buff2"])
	if(otps["buff3"])
		this.addBuff(otps["buff3"])
}
//增加BUFF
model.prototype.addBuff = function(buffStr) {
	var buff = JSON.parse(buffStr)
	this.skill_buffs[buff.buffId] = buff
}
//使用技能
model.prototype.masterPower = function() {
	if(this.CUR_CD !== 0){
		console.error("冷却中,不能使用 "+this.CUR_CD+"/"+this.NEED_CD)
		return false
	}
	this.CUR_CD = this.NEED_CD
	var targets = this.master.locator.getTargets(this.master.team[0],this.targetType)
	if(targets.length){
		//技能效果
		if(this.mul){
			if(this.type == "heal"){
				//治疗
				this.heal(targets)
			}else if(this.type == "attack"){
				//伤害
				this.attack(targets)
			}
		}
		//buff判定
		if(this.skill_buffs){
			for(var i in this.skill_buffs){
				var buffInfo = this.skill_buffs[i]
				for(var j = 0;j < targets.length;j++){
					if(this.master.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
						buffManager.createBuff(this.master,targets[j],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
					}
				}
			}
		}
	}
	return true
}
//伤害技能
model.prototype.attack = function(targets) {
	var recordInfo = {"type" : "master","skill":"attack","belong":this.master.belong,"targets":[]}
	for(var i = 0;i < targets.length;i++){
		var value = Math.floor((this.master.attInfo.atk - targets[i].getTotalAtt(this.damageType+"Def")) * this.mul)
		if(value < 1)
			value = 1
		var info = targets[i].onHit(this.master,{value:value,d_type:this.damageType})
		recordInfo.targets.push(info)
	}
	fightRecord.push(recordInfo)
}
//恢复技能
model.prototype.heal = function(targets) {
	var recordInfo = {"type" : "master","skill":"heal","belong":this.master.belong,"targets":[]}
	for(var i = 0;i < targets.length;i++){
		var info = targets[i].onHeal(this.master,{maxRate:this.mul})
		recordInfo.targets.push(info)
	}
	fightRecord.push(recordInfo)
}
//更新CD
model.prototype.updateCD = function() {
	if(this.CUR_CD > 0)
		this.CUR_CD--
}
module.exports = model