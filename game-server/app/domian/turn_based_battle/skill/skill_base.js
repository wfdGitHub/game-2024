//技能基类 伤害  治疗  BUFF
var model = function(character,otps,talents) {
	otps = otps || {}
	this.character = character
	this.sid = otps.sid || 0 		//技能ID
	this.isAnger = otps.isAnger || false //是否为怒气技能
	this.d_type = otps.d_type || "phy" 	//phy  物伤  mag  法伤   real  真伤
	//属性
	this.attInfo = {}
	this.attTmpInfo = {}
	//伤害参数
	this.attInfo.atk_count = otps["atk_count"] || 1
	this.attInfo.atk_mul = otps["atk_mul"] || 0
	this.attInfo.atk_value = otps["atk_value"] || 0
	this.attInfo.real_value = 0
	this.atk_aim = otps["atk_aim"] || 0
	//治疗参数
	this.attInfo.heal_mul = otps["heal_mul"] || 0
	this.attInfo.heal_value = otps["heal_value"] || 0
	this.heal_aim = otps["heal_aim"] || 0
	this.buffs = {}
	this.talents = talents || {}
	this.init()
}
//技能初始化
model.prototype.init = function() {
	for(var i = 1;i <= 3;i++){
		if(this.talents["buff"+i]){
			var buff = this.character.fighting.buffManager.getBuffByData(this.talents["buff"+i])
			this.buffs[buff.buffId] = buff
		}
	}
	//技能系数和附加值转为全目标共享,每个目标不超过最大值的一半
	if(this.talents.attack_share){
		this.attInfo.atk_share_value = this.attInfo.atk_value
		this.attInfo.atk_share_mul = this.attInfo.atk_mul
		this.attInfo.atk_value = 0
		this.attInfo.atk_mul = 0
	}
}
//使用技能前
model.prototype.before = function() {
	//自身每损失一定血量，增加一段伤害
	if(this.talents.hp_low_count)
		this.changeTotalTmp("atk_count",Math.max(0,Math.floor((1 - this.character.getTotalAtt("hp") / this.character.getTotalAtt("maxHP")) / this.talents.hp_low_count)))
	//释放技能时消耗生命值为临时伤害
	if(this.talents.hp_to_damage){
		var info = this.character.onOtherDamage(this,this.character.getTotalAtt("hp") * 0.3)
		this.changeTotalTmp("real_share_value",info.realValue)
	}
	//伤害无视护甲
	if(this.talents.ign_armor){
		this.character.changeTotalTmp("ign_armor",this.talents.ign_armor)
	}
}
//使用技能后
model.prototype.after = function() {
	this.attTmpInfo = {}
	//技能回怒
	if(this.talents.addAnger)
		this.character.addAnger(this.talents.addAnger,true)
	//使用技能结束插入临时记录
	this.character.fighting.insertTmpRecord()
}
//使用攻击技能前
model.prototype.attackBefore = function(targets) {
	if(this.getTotalAtt("real_share_value")){
		this.changeTotalTmp("real_value",Math.floor(this.getTotalAtt("real_share_value") / targets.length / this.getTotalAtt("atk_count")))
		delete this.attTmpInfo.real_share_value
	}
	if(this.getTotalAtt("atk_share_mul")){
		this.changeTotalTmp("atk_mul",this.getTotalAtt("atk_share_mul") / Math.max(2,targets.length))
		delete this.attTmpInfo.atk_share_mul
	}
	if(this.getTotalAtt("atk_share_value")){
		this.changeTotalTmp("atk_value",Math.floor(this.getTotalAtt("atk_share_value") / Math.max(2,targets.length)))
		delete this.attTmpInfo.atk_share_value
	}
}
//改变临时属性
model.prototype.changeTotalTmp = function(name,value) {
	if(!this.attTmpInfo[name])
		this.attTmpInfo[name] = 0
	this.attTmpInfo[name] += Number(value) || 0
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	var value = this.attInfo[name] || 0
	value += this.attTmpInfo[name] || 0
	return value
}
//==============获取技能信息
module.exports = model