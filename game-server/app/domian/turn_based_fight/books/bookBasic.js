//天书
var model = function(otps) {
	this.name = otps.name		//天书名称
	this.team = []				//所在阵容
	this.enemy = []				//敌对阵容
	this.belong = otps.belong   //所属阵容
	this.lv = otps["lv"] || 1		//等级
	this.star = otps["star"] || 1		//星级
	this.teamInfo = {}
	//=========基础属性=======//
	this.attInfo = {}
	this.attInfo.maxHP = otps["maxHP"] || 0				//最大生命值
	this.attInfo.atk = otps["atk"] || 0					//攻击力
	this.attInfo.phyDef = otps["phyDef"] || 0			//物理防御力
	this.attInfo.magDef = otps["magDef"] || 0			//法术防御力
	this.totalDamage = 0						//累计伤害
	this.totalHeal = 0							//累计治疗
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	var value = this.attInfo[name] || 0
	return value
}
model.prototype.onHit = function() {
}
model.prototype.kill = function() {
}
model.prototype.init = function(team,enemy,locator,seeded) {
	this.team = team
	this.enemy = enemy
	this.locator = locator
	this.seeded = seeded
}
model.prototype.action = function() {
	console.error("神器行动未定义")
}
module.exports = model