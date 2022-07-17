//主动伤害技能
var baseSkill = require("./baseSkill.js")
var model = function(otps,character) {
	baseSkill.call(this,otps,character)
	//初始化参数
	this.type = "attack"
	this.skillType = "hero"
	this.skill_anger_s = 0 								//自身怒气恢复值
	this.skill_anger_a = 0 								//全队怒气恢复值
	this.skill_less_anger = 0 							//降低目标怒气值
	this.maxHP_damage = 0 								//生命上限伤害

	//初始化方法
	this.initArg = function() {
		for(var i = 1;i <= 5;i++){
			if(this.otps["key"+i] && this.otps["value"+i]){
				var key = this.otps["key"+i]
				var value = this.otps["value"+i]
				switch(key){
					case "burn_att_change_skill":
					case "burn_buff_change_skill":
					case "burn_att_change_normal":
					case "burn_buff_change_normal":
					case "kill_buff":
						value = JSON.parse(value)
					break
					case "buff1":
						this.addBuff(value)
					break
					case "buff2":
						this.addBuff(value)
					break
					case "buff3":
						this.addBuff(value)
					break
				}
				this[key] = value
			}
		}
		if(this.character.skill_anger_s)
			this.skill_anger_s += this.character.skill_anger_s
		if(this.character.skill_anger_a)
			this.skill_anger_a += this.character.skill_anger_a
		if(this.character.skill_less_anger)
			this.skill_less_anger += this.character.skill_less_anger
		if(this.character.atkcontrol){
			for(var id in this.skill_buffs){
				if(this.skill_buffs[id].buffId == "disarm" || this.skill_buffs[id].buffId == "dizzy" || this.skill_buffs[id].buffId == "silence")
					this.skill_buffs[id].buffRate += this.skill_buffs[id].buffRate * this.character.atkcontrol
			}
		}
	}
	//初始化完成
	this.initArg()
}
module.exports = model