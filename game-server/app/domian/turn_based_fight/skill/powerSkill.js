var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
//主角技能
var model = function(otps,master) {
	this.character = master 							//主角
	this.isAnger = true
	this.name = otps.name
	this.type = otps.type								//类型  heal  attack
	this.skillId = otps.skillId							//技能ID
	this.mul = otps.mul									//技能系数
	this.damageType = otps.damageType || "phy" 			//伤害类型（目标防御选取）phy 物理伤害 mag 法术伤害
	this.targetType = otps.targetType || "enemy_normal"	//目标类型  normal
	this.NEED_BP = otps.NEED_BP || 10					//所需BP值
	this.NEED_CD = otps.NEED_CD || 10 					//技能所需CD
	this.CUR_CD = otps.CUR_CD || 0						//初始CD
	this.skill_buffs = {}								//技能附带BUFF
	this.otps = otps
	this.initArg()
}
//初始化参数
model.prototype.initArg = function() {
	for(var i = 1;i <= 5;i++){
		if(this.otps["key"+i] && this.otps["value"+i]){
			var key = this.otps["key"+i]
			var value = this.otps["value"+i]
			switch(key){
				case "buff1":
					this.addBuff(value)
				break
				case "buff2":
					this.addBuff(value)
				break
				case "buff3":
					this.addBuff(value)
				break
			}
			this[key] = value
		}
	}
}
//增加BUFF
model.prototype.addBuff = function(buffStr) {
	var buff = JSON.parse(buffStr)
	this.skill_buffs[buff.buffId] = buff
}
//更新CD
model.prototype.updateCD = function() {
	if(this.CUR_CD > 0)
		this.CUR_CD--
}
model.prototype.getInfo = function() {
	var info = {
		type : this.type,
		id : this.character.id,
		skillId : this.skillId,
		name : this.name,
		isAnger : this.isAnger
	}
	return info
}
//获取显示数据
model.prototype.getShowData = function() {
	var info = {
		NEED_BP : this.NEED_BP,
		NEED_CD : this.NEED_CD,
		CUR_CD : this.CUR_CD
	}
	return info
}
module.exports = model