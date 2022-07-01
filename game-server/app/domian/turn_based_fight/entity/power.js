//主角技能
var model = function(otps,character) {
	this.type = otps.type 								//类型  heal  attack
	this.skillId = otps.skillId							//技能ID
	this.mul = otps.mul 								//技能系数
	this.NEED_BP = 3 									//所需BP值
	this.NEED_CD = 3 									//技能所需CD
	this.CUR_CD = otps.CUR_CD || 0						//初始CD
	this.skill_buffs = {}								//技能附带BUFF
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
	this.skill_buffs[buff.buffId] = JSON.parse(buffStr)
}
//使用技能
model.prototype.masterPower = function(master) {
	if(this.CUR_CD !== 0){
		console.error("冷却中,不能使用 "+this.CUR_CD+"/"+this.NEED_CD)
		return false
	}
	this.CUR_CD = this.NEED_CD
	var target = master.locator.getTargets(master.team[0],"enemy_1")
	if(target.length){
		var recordInfo = {type : "master",belong:master.belong,targets:[]}
		var value = Math.floor((master.attInfo.atk - target[0].getTotalAtt("phyDef")) * 1)
		if(value < 1)
			value = 1
		var info = target[0].onHit(master,{value:value,d_type:"phy"})
		recordInfo.targets.push(info)
		fightRecord.push(recordInfo)
	}
	return true
}
//更新CD
model.prototype.updateCD = function() {
	if(this.CUR_CD > 0)
		this.CUR_CD--
}
module.exports = model