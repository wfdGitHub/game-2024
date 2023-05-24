//超额内力伤害
var buff_entity = require("../buff_entity.js")
var model = function(fighting,character,buffId,buffCfg) {
	//继承父类属性
	buff_entity.call(this,fighting,character,buffId,buffCfg)
}
//继承父类方法
model.prototype = Object.create(buff_entity.prototype) //继承父类方法
//新增一层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(!buff)
		return
	this.skill = this.character.packageSkillBySid(buff.otps.sid)
	this.list.push({attacker:attacker,buff : buff,duration : buff.duration})
	this.addRecord({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
}
model.prototype.domain = function() {
	if(this.skill){
		var teamValue = 0
		var enemyValue = 0
		var teamList = this.fighting.locator.getTargets(this.character,"team_all")
		var enemyTeam = this.fighting.locator.getTargets(this.character,"enemy_all")
		var maxMagFriend
		for(var i = 0;i < teamList.length;i++){
			teamValue += teamList[i].getTotalAtt("main_mag")
			if(teamList[i].id != this.character.id){
				if(!maxMagFriend || teamList[i].getTotalAtt("main_mag") > maxMagFriend.getTotalAtt("main_mag"))
					maxMagFriend = teamList[i]
			}
		}
		for(var i = 0;i < enemyTeam.length;i++)
			enemyValue += enemyTeam[i].getTotalAtt("main_mag")
		if(teamValue > enemyValue + 120){
			this.fighting.skillManager.useSkill(this.character.useOtherSkillFree(this.skill))
			if(maxMagFriend)
				this.fighting.skillManager.useSkill(maxMagFriend.useOtherSkillFree(this.skill))
		}
	}
}
module.exports = model