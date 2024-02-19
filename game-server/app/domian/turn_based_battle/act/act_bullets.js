//弹道管理器
var model = function(fighting) {
	this.fighting = fighting
    this.bullets = {}  			//子弹列表
	this.id = 1 				//子弹ID 			
}
//弹道刷新
model.prototype.timeUpdate = function(dt) {
	for(var i in this.bullets){
		var record = {
			"type" : "b_move",
			"id" : i,
			"sid" : this.bullets[i].skill.sid,
			"ori" : Object.assign({},this.bullets[i].pos)
		}
		this.fighting.locator.callMove(this.bullets[i],this.bullets[i].target,this.bullets[i].skill.bu_spe,dt)
		record.pos = Object.assign({},this.bullets[i].pos)
		this.fighting.fightRecord.push(record)
		if(this.fighting.locator.callDist(this.bullets[i],this.bullets[i].target) < 10){
			//结算子弹
			if(!this.bullets[i].target.died)
				this.bullets[i].skill.settle(this.bullets[i].value)
			delete this.bullets[i]
		}
	}
}
//添加弹道   release target skill
model.prototype.addBullet = function(release,target,skill,value) {
	var bulletInfo = {}
	bulletInfo.release = release
	bulletInfo.target = target
	bulletInfo.skill = skill
	bulletInfo.value = value
	bulletInfo.pos = Object.assign({},release.pos)
	this.bullets[this.id++] = bulletInfo
}
//弹道结算
model.prototype.settle = function(value) {
	var record = {
		"type" : "damage",
		"id" : this.character.id,
		"sid" : this.sid,
		"attack" : []
	}
	var targets = this.targets
	this.attackBefore(targets)
	for(var i = 0;i < targets.length;i++){
		targets[i].onHitBefore(this.character,this)
		var info = this.character.fighting.formula.calDamage(this.character, targets[i],this)
		info.value = Math.floor(info.value * value)
		info.value += this.getTotalAtt("real_value")
		info = targets[i].onHit(this.character,info,true,this.isAnger)
		targets[i].onHiting(this.character,this,info)
		record.attack.push(info)
	}
	this.character.attackAfter(this)
	this.character.fighting.fightRecord.push(record)
}

module.exports = model