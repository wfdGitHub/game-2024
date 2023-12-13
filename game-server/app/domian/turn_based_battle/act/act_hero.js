//行动控制器
const act_skill = require("./act_skill.js")
const MOVE_TIME = 500                   //毫秒
var model = function() {
	this.point = {x : 0,y : 0} 			//当前位置
	this.state = 0 						//当前状态  0 待机  1  移动中  2  释放技能
	this.moveSpeed = 100 				//移动速度，每秒移动距离
	this.target = {x : 0,y : 0} 		//目标位置
	this.dirX = 1 						//X轴移动方向
	this.dirY = 1 						//Y轴移动方向
	this.moveCD = 0 					//移动冷却
	this.atkRange = 50 					//攻击距离
	this.skill = false
}
//定时器更新
model.prototype.timeUpdate = function(dt) {
	console.log(this.state,dt)
	switch(this.state){
		case 0:
			//待机中

		break
		case 1:
			//移动中
			this.point.x += Math.round(this.dirX * Math.min(this.moveSpeed * dt * 0.001,Math.abs(this.target.x - this.point.x)))
			this.point.y += Math.round(this.dirY * Math.min(this.moveSpeed * dt * 0.001,Math.abs(this.target.y - this.point.y)))
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
		//选择最近目标
		this.target = {x : 700,y : 500}
		//选择技能
		this.skill = this.skills[0]
		if(this.skill && Math.abs(this.point.x-this.target.x) < this.skill.resRange && Math.abs(this.point.y-this.target.y) < this.skill.resRange){
			//在释放距离内释放技能
			this.state = 2
			this.skill.resSkill()
		}else{
			//移动至目标
			this.state = 1
			this.moveCD = MOVE_TIME
		}
	}
}
//选择目标

//移动

//使用技能
model.prototype.resSkill = function(skill) {
	this.state = 2
	this.skill = skill
}
model.prototype.stopSkill = function(skill) {
	this.state = 0
	skill.stopSkill()
}
module.exports = model