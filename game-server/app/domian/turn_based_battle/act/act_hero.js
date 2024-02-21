//行动控制器
const MOVE_TIME = 300                   //毫秒
var model = function() {
	this.pos = {x : 0,y : 0} 			//当前位置
	this.state = 0 						//当前状态  0 待机  1  移动中  2  释放技能
	this.atkSpeed = 170 				//攻击速度
	this.moveSpeed = 100 				//移动速度，每秒移动距离
	this.targets = [] 					//当前目标列表
	this.target = false  				//当前主目标
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
			this.fighting.locator.callMove(this.pos,this.target.pos,this.moveSpeed,dt)
			if(this.target.died)
				this.state = 0
			var record = {
				"type" : "move",
				"id" : this.id,
				"pos" : Object.assign({},this.pos)
			}
			this.fighting.fightRecord.push(record)
		break
		case 2:
			//技能释放中
			this.skill.update(dt)
		break
	}
	if(this.state == 0 || this.state == 1){
		//选择技能
		this.skill = this.skills[0]
		if(!this.skill)
			return
		//选择最近目标
		this.targets = this.fighting.locator.getTargets(this,this.skill.targetType)
		if(!this.targets.length)
			return
		this.target = this.targets[0]
		if(this.fighting.locator.callDist(this.pos,this.target.pos) <= this.skill.resRange){
			// console.log("释放技能")
			//在释放距离内释放技能
			this.state = 2
			this.skill.resSkill(this.targets)
		}else{
			//移动至目标
			this.state = 1
		}
	}
}
//停止技能
model.prototype.stopSkill = function(skill) {
	this.state = 0
	skill.stopSkill()
}
module.exports = model
