var fighting = function(atkTeam,defTeam) {
	this.curTime = 0
	this.atkTeam = atkTeam
	this.defTeam = defTeam
	console.log("atkTeam ",this.atkTeam)
	console.log("defTeam ",this.defTeam)	
	this.over = false
	this.result = "deuce"	//deuce  win   lose
}
//时间推进
fighting.prototype.update = function(dt) {
	this.curTime += dt
	console.log("update : ",this.curTime)
	for(var i in this.atkTeam){
		if(!this.atkTeam[i].died){
			for(var skillId in this.atkTeam[i].fightSkills){
				if(this.curTime > this.atkTeam[i].fightSkills[skillId].getCoolDownTime()){
					this.atkTeam[i].fightSkills[skillId].updateCD(this.curTime)
					this.atkTeam[i].useSkill(skillId)
				}
			}
		}
	}
	for(var i in this.defTeam){
		if(!this.defTeam[i].died){
			for(var skillId in this.defTeam[i].fightSkills){
				if(this.curTime > this.defTeam[i].fightSkills[skillId].getCoolDownTime()){
					this.defTeam[i].fightSkills[skillId].updateCD(this.curTime)
					this.defTeam[i].useSkill(skillId)
				}
			}
		}
	}
	this.checkOver()
}
//结束标识
fighting.prototype.checkOver = function() {
	var flag = true
	for(var i in this.atkTeam){
		if(!this.atkTeam[i].died){
			flag = false
			break
		}
	}
	if(flag){
		this.over = true
		this.result = "lose"
		return
	}
	flag = true
	for(var i in this.defTeam){
		if(!this.defTeam[i].died){
			flag = false
			break
		}
	}
	if(flag){
		this.over = true
		this.result = "win"
		return
	}
}
fighting.prototype.isOver = function() {
	return this.over
}
//获取战斗结果
fighting.prototype.getResult = function() {
	return this.result
}
module.exports = {
	"id" : "fighting",
	func : fighting,
	scope : "prototype",
	args : [{
		name : "atkTeam",
		type : "Object"
	},{
		name : "defTeam",
		type : "Object"
	}],
	props : [{
		name : "formula",
		ref : "formula"
	}]
}