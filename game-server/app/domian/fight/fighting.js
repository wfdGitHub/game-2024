var seeded = require("./seeded.js")
var fighting = function(atkTeam,defTeam,otps) {
	this.curTime = 0
	this.atkTeam = atkTeam
	this.defTeam = defTeam
	this.stepper = otps.stepper
	this.maxTime = otps.maxTime
    this.characterCount = 0
    this.characterArr = this.atkTeam.concat(this.defTeam)
	var self = this
	this.characterArr.forEach(function(character) {
		character.characterId = self.characterCount++
	})
	this.over = false
	this.result = "none"	//deuce  win   lose
	this.skillList = []
	this.recordList = []
	this.readList = []
    this.seeded = new seeded(otps.seeded || (new Date()).getTime())
}
//时间推进
fighting.prototype.update = function() {
	if(this.over){
		return
	}
	//检测读取记录
	if(this.readList.length && this.readList[0].t == this.curTime){
		var record = this.readList.shift()
		console.log(record)
		this.characterArr[record.c].fightSkills[record.s].use()
	}
    //检测使用技能
    if(this.skillList.length){
    	var skill = this.skillList.shift()
    	var record = {
    		t : this.curTime,
    		c : skill.character.characterId,
    		s : skill.skillId
    	}
    	this.recordList.push(record)
    	if(!skill.character.died){
    		skill.useSkill()
    	}
    }else{
		this.curTime += this.stepper
	    var self = this
	    //更新
	    this.characterArr.forEach(function(character,index) {
	        if(!character.died){
	        	character.update(self.stepper)
	        }
	    })
    }
	this.checkOver()
}
//结束标识
fighting.prototype.checkOver = function() {
	if(this.curTime >= this.maxTime){
		this.over = true
		this.result = "deuce"
		return
	}
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
module.exports = fighting