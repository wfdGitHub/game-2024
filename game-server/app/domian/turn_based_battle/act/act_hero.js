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
	this.actTime = 0 					//行动冷却
	this.targets = [] 					//当前目标列表
	this.target = false  				//当前主目标
	this.skill = false
	//初始化技能
	this.skills = []
	this.addNormalSkill(otps["angerSkill"])
	this.addAngerSkill(otps["angerSkill"])
}
//设置状态
model.prototype.incStatus = function(status,value) {
	if(this.status[status] == 0 && value > 0){
		switch(status){
			case "dizzy":
				this.stopSkill(this.skill)
			break
			case "silence":
				if(this.skill && this.skill.isAnger)
					this.stopSkill(this.skill)
			break
			case "disarm":
				if(this.skill && !this.skill.isAnger)
					this.stopSkill(this.skill)
		}
	}
	if(this.status[status] !== undefined)
		this.status[status] += value
}
//定时器更新
model.prototype.timeUpdate = function(dt) {
	this.buffUpdate(dt)
	for(var i = 0;i < this.skills.length;i++)
		this.skills[i].updateCD(dt)
	if(this.status["dizzy"] > 0)
		return
	switch(this.state){
		case 0:
			//待机中

		break
		case 1:
			//移动中
			if(this.status["twine"] > 0 || !this.target){
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
			//选择最近敌方目标移动
			this.target = this.fighting.locator.getEnemyNormal(this)[0]
			if(!this.target)
				return
			if(this.fighting.locator.callDist(this.pos,this.target.pos) <= this.skill.resRange){
				// console.log("释放技能")
				//在释放距离内释放技能
				this.targets = this.fighting.locator.getTargets(this,this.skill)
				this.state = 2
				this.actTime = this.getTotalAtt("actSpeed")
				console.log("actTime",this.actTime)
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
	if(!this.status["silence"] && this.curAnger >= this.needAnger){
		this.curAnger -= this.needAnger
		return this.angerSkill
	}else if(!this.status["disarm"]){
		var index = Math.floor(this.fighting.random() * this.skills.length)
		for(var i = 0;i < this.skills.length;i++){
			var sId = (i + index) % this.skills.length
			if(this.skills[sId].checkCD())
				return this.skills[sId]
		}
	}
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
//停止技能
model.prototype.stopSkill = function(skill) {
	this.state = 0
	if(skill){
		skill.stopSkill()
		var record = {
			"type" : "skillEnd",
			"id" : this.id,
			"sid" : skill.id
		}
		this.fighting.fightRecord.push(record)
	}
}
module.exports = model
