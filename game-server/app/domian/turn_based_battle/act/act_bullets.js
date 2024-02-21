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
		this.fighting.locator.callMove(this.bullets[i].pos,this.bullets[i].target.pos,this.bullets[i].skill.bu_spe,dt)
		record.pos = Object.assign({},this.bullets[i].pos)
		this.fighting.fightRecord.push(record)
		if(this.fighting.locator.callDist(this.bullets[i].pos,this.bullets[i].target.pos) < 10){
			//结算子弹
			if(!this.bullets[i].target.died)
				this.bullets[i].skill.settle(bulletInfo.mul,this.bullets[i].value)
			delete this.bullets[i]
		}
	}
}
//添加弹道   release target skill
model.prototype.addBullet = function(release,target,skill,mul,value) {
	var bulletInfo = {}
	bulletInfo.release = release
	bulletInfo.target = target
	bulletInfo.skill = skill
	bulletInfo.mul = mul
	bulletInfo.value = value
	bulletInfo.pos = Object.assign({},release.pos)
	this.bullets[this.id++] = bulletInfo
}
module.exports = model