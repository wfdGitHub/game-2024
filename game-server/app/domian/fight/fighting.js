var seeded = require("./seeded.js")
var golbal_skill = require("../../../config/gameCfg/golbal_skill.json")
var fighting = function(atkTeam,defTeam,otps) {
	this.curTime = 0
	this.atkTeam = atkTeam
	this.defTeam = defTeam
	this.stepper = otps.stepper
	this.maxTime = otps.maxTime
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
	for(var i in this.atkTeam){
		this.atkTeam[i].setArg(this.atkTeam,this.defTeam,this)
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
	for(var i in this.defTeam){
		this.defTeam[i].setArg(this.defTeam,this.atkTeam,this)
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
				character.fightSkills[skillId].updateCD(parseInt(self.seeded.random() * 3000))
			}else{
				character.fightSkills[skillId].updateCD(parseInt(self.seeded.random() * 3000) + character.fightSkills[skillId].skillCD * 1000)
			}
		}
	})
}
//时间推进
fighting.prototype.update = function() {
	if(this.over){
		return
	}
	//检测读取记录
	if(this.readList.length && this.readList[0].t == this.curTime){
		var record = this.readList.shift()
		this.characterArr[record.c].fightSkills[record.s].use()
	}
    //检测使用技能
    if(this.skillList.length){
    	var skill = this.skillList.shift()
    	var record = {
    		t : this.curTime,
    		c : skill.character.nodeId,
    		s : skill.skillId
    	}
    	if(skill.character.characterType != "mob"){
    		this.recordList.push(record)
    	}
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
	var info = {
		result : this.result,
		recordList : this.recordList,
		seededNum : this.seededNum,
		time : this.curTime,
		characterArr : []
	}
	this.characterArr.forEach(function(character) {
		info.characterArr.push(character.getSimpleInfo())
	})
	var verify = ""+info.result+info.recordList.length+info.seededNum+info.time
	info.characterArr.forEach(function(character) {
		verify += character.name+character.hp+"/"+character.maxHP
	})
	info.verify = verify
	return info
}
module.exports = fighting