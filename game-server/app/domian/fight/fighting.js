var fighting = function(atkTeam,defTeam) {
	this.curTime = 0
	this.atkTeam = atkTeam
	this.defTeam = defTeam
	this.characterArr = this.atkTeam.concat(this.defTeam)
	this.over = false
	this.result = "deuce"	//deuce  win   lose
}
//时间推进
fighting.prototype.update = function(dt) {
	this.curTime += dt
	// console.log("update : ",this.curTime)
	var self = this
	this.characterArr.forEach(function(character,index) {
		if(!character.died){
			for(var skillId in character.fightSkills){
				if(character.fightSkills[skillId].checkCondition(self.curTime)){
					character.useSkill(skillId,self.curTime)
				}
			}
		}
	})
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