//行动控制器
const act_skill = require("./act_skill.js")
const MOVE_TIME = 500                   //毫秒
var model = function() {
	this.pos = {x : 0,y : 0} 			//当前位置
	this.state = 0 						//当前状态  0 待机  1  移动中  2  释放技能
	this.moveSpeed = 100 				//移动速度，每秒移动距离
	this.targets = [] 					//当前目标列表
	this.target = false  				//当前主目标
	this.dirX = 1 						//X轴移动方向
	this.dirY = 1 						//Y轴移动方向
	this.moveCD = 0 					//移动冷却
	this.atkRange = 50 					//攻击距离
	this.skill = false
}
//定时器更新
model.prototype.timeUpdate = function(dt) {
	switch(this.state){
		case 0:
			//待机中

		break
		case 1:
			//移动中
			if(!this.target){
				this.state = 0
				return
			}
			this.pos.x += Math.round(this.dirX * Math.min(this.moveSpeed * dt * 0.001,Math.abs(this.target.pos.x - this.pos.x)))
			this.pos.y += Math.round(this.dirY * Math.min(this.moveSpeed * dt * 0.001,Math.abs(this.target.pos.y - this.pos.y)))
			this.moveCD -= dt
			if(this.moveCD <= 0)
				this.state = 0
		break
		case 2:
			//技能释放中
			this.skill.update(dt)
		break
	}
	if(this.state == 0){
		//选择技能
		this.skill = this.skills[0]
		if(!this.skill)
			return
		//选择最近目标
		this.targets = this.fighting.locator.getTargets(this,this.skill.targetType)
		if(!this.targets.length)
			return
		this.target = this.targets[0]
		if(Math.abs(this.pos.x-this.target.pos.x) < this.skill.resRange && Math.abs(this.pos.y-this.target.pos.y) < this.skill.resRange){
			//在释放距离内释放技能
			this.state = 2
			this.skill.resSkill(this.targets)
		}else{
			//移动至目标
			this.state = 1
			this.moveCD = MOVE_TIME
		}
	}
}
//选择目标

//移动

//停止技能
model.prototype.stopSkill = function(skill) {
	this.state = 0
	skill.stopSkill()
}
module.exports = model