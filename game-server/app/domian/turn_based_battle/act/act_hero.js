//行动控制器
const MOVE_TIME = 300                   //毫秒
const fightCfg = require("../fightCfg.js")
const skills = fightCfg.getCfg("skills")
const skill_base = require("../skill/skill_base.js")
var model = function(otps) {
	//============英雄参数====================//
	this.attInfo.actSpeed = otps.actSpeed || 1700 				//攻击速度
	this.attInfo.moveSpeed = otps.moveSpeed || 100 				//移动速度，每秒移动距离
	//============战斗数据====================//
	this.pos = {x : 0,y : 0} 			//当前位置
	this.state = 0 						//当前状态  0 待机  1  移动中  2  释放技能
	this.status = {dizzy:0,silence:0,twine:0,disarm:0} 	//当前状态 dizzy 眩晕 silence 沉默 twine 缠绕  disarm 缴械
	this.actTime = 0 					//行动冷却
	this.targets = [] 					//当前目标列表
	this.target = false  				//当前主目标
	this.skill = false
	//初始化技能
	this.skills = []
	this.addNormalSkill(otps["defaultSkill"])
	this.addAngerSkill(otps["angerSkill"])
}
//增加普通技能
model.prototype.addNormalSkill = function(sid) {
	if(skills[sid])
		this.skills.push(new skill_base(this,sid))
}
//增加怒气技能
model.prototype.addAngerSkill = function(sid) {
	this.angerSkill = new skill_base(this,sid)
	this.angerSkill.NEEDCD = 0
	this.angerSkill.isAnger = true
}
//定时器更新
model.prototype.timeUpdate = function(dt) {
	for(var i = 0;i < this.skills.length;i++)
		this.skills[i].updateCD(dt)
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
			this.fighting.locator.callMove(this.pos,this.target.pos,this.attInfo.moveSpeed,dt)
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
	if(this.state <= 1){
		this.actTime -= dt
		if(this.actTime <= 0){
			//选择技能
			this.skill = this.chooseSkill()
			if(!this.skill)
				return
			//选择最近目标
			this.targets = this.fighting.locator.getTargets(this,this.skill)
			if(!this.targets.length)
				return
			this.target = this.targets[0]
			if(this.fighting.locator.callDist(this.pos,this.target.pos) <= this.skill.resRange){
				// console.log("释放技能")
				//在释放距离内释放技能
				this.state = 2
				this.actTime = this.attInfo.actSpeed
				this.skill.resSkill(this.targets)
			}else{
				//移动至目标
				this.state = 1
			}
		}
	}
}
//选择普通技能
model.prototype.chooseSkill = function() {
	if(this.curAnger >= this.needAnger){
		this.curAnger -= this.needAnger
		return this.angerSkill
	}else{
		var index = Math.floor(this.fighting.random() * this.skills.length)
		for(var i = 0;i < this.skills.length;i++){
			var sId = (i + index) % this.skills.length
			if(this.skills[sId].checkCD())
				return this.skills[sId]
		}
	}
}
//停止技能
model.prototype.stopSkill = function(skill) {
	this.state = 0
	skill.stopSkill()
}
module.exports = model
