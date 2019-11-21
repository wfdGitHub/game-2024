var seeded = require("./seeded.js")
var golbal_skill = require("../../../config/gameCfg/golbal_skill.json")
var fighting = function(atkTeam,defTeam,otps) {
	this.curTime = 0
	this.atkTeam = atkTeam
	this.defTeam = defTeam
	this.stepper = otps.stepper
	this.maxTime = otps.maxTime
	this.auto = otps.auto || false
    this.nodeCount = 0
    this.characterArr = this.atkTeam.concat(this.defTeam)
	var self = this
	this.characterArr.forEach(function(character) {
		character.nodeId = self.nodeCount++
	})
	this.over = false
	this.result = "none"	//deuce  win   lose
	this.skillList = []
	this.recordList = []
	this.readList = otps.readList || []
	this.seededNum = otps.seededNum || (new Date()).getTime()
    this.seeded = new seeded(this.seededNum)
	for(var i = 0;i < this.atkTeam.length;i++){
		this.atkTeam[i].setArg(this.atkTeam,this.defTeam,this)
		this.atkTeam[i].belong = "atkTeam"
		if(this.atkTeam[i].globalSkills.length){
			for(var j = 0;j < this.atkTeam[i].globalSkills.length;j++){
					var tmpSkill = golbal_skill[this.atkTeam[i].globalSkills[j]]
					var arg = tmpSkill.arg
					if(tmpSkill.team == "we"){
						for(var z = 0;z < this.atkTeam.length;z++){
							this.atkTeam[z].percentformula(this.atkTeam[z],arg)
						}
					}else if(tmpSkill.team == "they"){
						for(var z = 0;z < this.defTeam.length;z++){
							this.defTeam[z].percentformula(this.defTeam[z],arg)
						}
					}
			}
		}
	}
	for(var i = 0;i < this.defTeam.length;i++){
		this.defTeam[i].setArg(this.defTeam,this.atkTeam,this)
		this.defTeam[i].belong = "defTeam"
		if(this.defTeam[i].globalSkills.length){
			for(var j = 0;j < this.defTeam[i].globalSkills.length;j++){
					var tmpSkill = golbal_skill[this.defTeam[i].globalSkills[j]]
					var arg = tmpSkill.arg
					if(tmpSkill.team == "we"){
						for(var z = 0;z < this.defTeam.length;z++){
							this.defTeam[z].percentformula(this.defTeam[z],arg)
						}
					}else if(tmpSkill.team == "they"){
						for(var z = 0;z < this.atkTeam.length;z++){
							this.atkTeam[z].percentformula(this.atkTeam[z],arg)
						}
					}
			}
		}
	}
	this.characterArr.forEach(function(character) {
		for(var skillId in character.fightSkills){
			if(character.fightSkills[skillId].defaultSkill){
				character.fightSkills[skillId].updateCD(parseInt(self.seeded.random("普攻延时") * 1000))
			}else{
				character.fightSkills[skillId].updateCD(parseInt(self.seeded.random("技能延时") * 1000))
			}
		}
	})
}
//时间推进
fighting.prototype.update = function() {
	if(this.over)
		return
	//检测读取记录
	for(var i = 0;i < this.readList.length;i++){
		if(this.readList[i].t <= this.curTime){
			let record = this.readList[i]
			this.characterArr[record.c].fightSkills[record.s].use()
		}else{
			this.readList = this.readList.slice(i,this.readList.length)
			break
		}
	}
    //检测使用技能
    if(this.skillList.length){
    	this.skillList.sort(function(a,b) {
    		return a.character.nodeId > b.character.nodeId || (a.character.nodeId == b.character.nodeId && a.skillId > b.skillId) ? -1 : 1
    	})
    	for(var i = 0;i < this.skillList.length;i++){
	    	if(!this.skillList[i].character.died){
		        if(this.auto || this.skillList[i].character.characterType != "mob"){
			    	var record = {
			    		t : this.curTime,
			    		c : this.skillList[i].character.nodeId,
			    		s : this.skillList[i].skillId
			    	}	        	
		    		this.recordList.push(record)
		    	}
	    		this.skillList[i].useSkill()
	    	}
    	}
    	this.skillList = []
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
	for(var i = 0;i < this.atkTeam.length;i++){
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
	for(var i = 0;i < this.defTeam.length;i++){
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
	var info = {
		result : this.result,
		recordList : this.recordList,
		seededNum : this.seededNum,
		time : this.curTime,
		atkTeam : [],
		defTeam : []
	}
	this.atkTeam.forEach(function(character) {
		info.atkTeam.push(character.baseOtps)
	})
	this.defTeam.forEach(function(character) {
		info.defTeam.push(character.baseOtps)
	})
	var verify = {
		result : info.result,
		recordList : info.recordList,
		seededNum : info.seededNum,
		time : info.time,
		character : {}
	}
	this.characterArr.forEach(function(character) {
		verify.character[character.characterId] = character.getInfo()
	})
	info.verify = JSON.stringify(verify)
	return info
}
module.exports = fighting