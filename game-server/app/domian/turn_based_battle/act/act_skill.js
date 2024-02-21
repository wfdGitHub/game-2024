//技能控制器
var model = function(otps,hero) {
	this.hero = hero
	this.id = otps.id
	this.name = otps.name
	this.NEEDCD = otps.cd 					 //技能CD
	this.type = otps.type || "normal"        //技能类型  normal 普通 bullet 子弹  range  范围技能
	//弹道属性
	this.bu_spe = otps.bu_spe || 1000      	 //弹道速度
	//范围技能属性
	this.rangeType = otps.rangeType || "enemy" //enemy 敌方  team 友方
	this.rangeRadius = otps.rangeRadius || 100 //半径

	this.skillDur = otps.skillDur || 100     //技能持续时间
	this.resRange = otps.resRange ||  100    //释放距离
	this.times = otps.times || [0] 			 //结算时间列表
	this.muls = otps.muls || [1]  		  	 //技能系数列表
	this.value = otps.value || 10  		 	 //技能附加伤害
	this.d_type = otps.d_type || "phy" 	 	 //phy  物伤  mag  法伤   real  真伤  heal 治疗
	//状态参数
	this.cd = 0 							 //当前技能CD
	this.state = 0 							 //0 未释放   1  释放中
	this.curDur = 0 						 //当前持续时间
	this.timeIndex = 0 						 //当前结算时间ID
	this.targets = [] 						 //当前目标列表
	this.target = false 					 //当前目标
	this.resPos = {x:0,y:0} 				 //技能释放坐标
	switch(this.type){
		case "bullet":
			this.update = this.bulletUpdate
		break
		case "range":
			this.update = this.rangeUpdate
		break
		default:
			this.update = this.normalUpdate
	}
	if(this.d_type == "heal")
		this.settle = this.healSettle
	else
		this.settle = this.atkSettle
}
//普通刷新
model.prototype.normalUpdate = function(dt) {
	if(this.state != 1)
		return
	this.curDur += dt
	if(this.times[this.timeIndex] !== undefined && this.curDur >= this.times[this.timeIndex]){
		this.settle(this.muls[this.timeIndex],this.value)
		this.timeIndex++
	}
	if(this.curDur >= this.skillDur)
		this.hero.stopSkill(this)
}
//子弹刷新
model.prototype.bulletUpdate = function(dt) {
	if(this.state != 1)
		return
	this.curDur += dt
	if(this.times[this.timeIndex] !== undefined && this.curDur >= this.times[this.timeIndex]){
		for(var i = 0;i < this.targets.length;i++)
			this.hero.fighting.bulletManager.addBullet(this.hero,this.targets[i],this,this.muls[this.timeIndex],value)
		this.timeIndex++
	}
	if(this.curDur >= this.skillDur)
		this.hero.stopSkill(this)
}
//范围刷新
model.prototype.rangeUpdate = function(dt) {
	if(this.state != 1)
		return
	this.curDur += dt
	if(this.times[this.timeIndex] !== undefined && this.curDur >= this.times[this.timeIndex]){
		if(this.rangeType == "team"){
			//友方
			this.targets = this.hero.fighting.locator.getTeamRange(this.hero,this.resPos,this.rangeRadius)
		}else{
			//敌方
			this.targets = this.hero.fighting.locator.getEnemyRange(this.hero,this.resPos,this.rangeRadius)
		}
		this.settle(this.muls[this.timeIndex],this.value)
		this.timeIndex++
	}
	if(this.curDur >= this.skillDur)
		this.hero.stopSkill(this)
}
//攻击结算
model.prototype.atkSettle = function(mul,value) {
	var record = {
		"type" : "damage",
		"id" : this.character.id,
		"sid" : this.sid,
		"list" : []
	}
	var targets = this.targets
	for(var i = 0;i < targets.length;i++){
		var info = this.character.fighting.formula.calDamage(this.character, targets[i],this,mul,value)
		info.value += this.getTotalAtt("real_value")
		info = targets[i].onHit(this.character,info,true)
		record.list.push(info)
	}
	this.character.fighting.fightRecord.push(record)
}
//治疗结算
model.prototype.healSettle = function(mul,value) {
	var record = {
		"type" : "heal",
		"id" : this.character.id,
		"sid" : this.sid,
		"list" : []
	}
	var targets = this.targets
	for(var i = 0;i < targets.length;i++){
		var info = this.character.fighting.formula.calHeal(this.character, targets[i],this,mul,value)
		info = targets[i].onHeal(this.character,info,true)
		record.list.push(info)
	}
	this.character.fighting.fightRecord.push(record)
}
//开始释放技能
model.prototype.resSkill = function(targets) {
	if(this.state == 1)
		console.error("技能已释放"+this.id)
	this.state = 1
	this.curDur = 0
	this.timeIndex = 0
	this.targets = targets
	this.target = targets[0]
	if(this.target)
		Object.assign(this.resPos,this.target.pos)
	else
		Object.assign(this.resPos,this.hero.pos)
	var record = {
		"type" : "skill",
		"id" : this.character.id,
		"sid" : this.sid
	}
	this.character.fighting.fightRecord.push(record)
}
//技能释放结束
model.prototype.stopSkill = function() {
	this.state = 0
}
module.exports = model