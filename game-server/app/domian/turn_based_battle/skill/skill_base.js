//技能基类 伤害  治疗  BUFF
var buff_base = require("./buff_base.js")
var model = function(character,otps,talents) {
	otps = otps || {}
	this.character = character
	this.sid = otps.sid || 0 		//技能ID
	this.isAnger = otps.isAnger || false //是否为怒气技能
	this.d_type = "phy" 		//phy  物伤  mag  法伤   real  真伤
	//伤害参数
	this.atk_count = otps["atk_count"] || 1
	this.atk_mul = otps["atk_mul"] || 0
	this.atk_value = otps["atk_value"] || 0
	this.atk_aim = otps["atk_aim"] || 0
	//治疗参数
	this.heal_mul = otps["heal_mul"] || 0
	this.heal_value = otps["heal_value"] || 0
	this.heal_aim = otps["heal_aim"] || 0
	this.buffs = {}
	// this.buffs["mag_damage"] = new buff_base(JSON.stringify({buffId : "mag_damage","mul" : 0.3,"value":1000,"rate" : 0.5,"targetType":"skill_targets","duration":2}))
	this.talents = talents || {}
	this.tmpCount = 0
	this.tmpDamage = 0
}
//技能初始化
model.prototype.init = function() {

}
//使用技能前
model.prototype.before = function() {
	//释放技能时消耗生命值为临时伤害
	if(this.talents.hp_to_damage){
		var info = this.character.onOtherDamage(this,this.character.getTotalAtt("hp") * 0.3)
		this.tmpDamage += info.realValue
	}
	//自身每损失一定血量，增加一段伤害
	if(this.talents.hp_low_count)
		this.tmpCount +=  Math.max(0,Math.floor((1 - this.character.getTotalAtt("hp") / this.character.getTotalAtt("maxHP")) / this.talents.hp_low_count))
}
//使用技能后
model.prototype.after = function() {
	this.tmpDamage = 0
	this.tmpCount = 0
}
//==============技能天赋加载
//新增天赋
model.prototype.mergeSkillTalent = function(info,talentId,value) {
	if(talent_list[talentId]){
		let tmpTalent = {}
		for(var i = 1;i <= 2;i++){
			if(talent_list[talentId]["key"+i]){
				tmpTalent[talent_list[talentId]["key"+i]] = talent_list[talentId]["value"+i]
				if(tmpTalent[talent_list[talentId]["key"+i]] == "dynamic")
					tmpTalent[talent_list[talentId]["key"+i]] = value || 0
			}
		}
		model.mergeData(info,tmpTalent)
	}else{
		console.error("talentId error",talentId)
	}
}
//数据合并
model.prototype.mergeData = function(info1,info2) {
	for(var i in info2){
		if(info2[i]){
			if(info1[i] && Number.isFinite(info2[i])){
				if(Number.isFinite(info1[i])){
					info1[i] += info2[i]
				}else{
					info1[i] = info2[i]
				}
			}else{
				info1[i] = info2[i]
			}
		}
	}
}
//==============获取技能信息
module.exports = model