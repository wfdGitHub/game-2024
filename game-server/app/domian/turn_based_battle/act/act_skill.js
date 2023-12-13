//技能控制器
var model = function(otps,hero) {
	this.hero = hero
	this.id = otps.id
	this.name = otps.name
	this.NEEDCD = otps.cd 					 //技能CD
	this.skillDur = otps.skillDur || 1000    //技能持续时间
	this.resRange = otps.resRange ||  100  	 //释放距离
	this.targetType = otps.targetType 		 //目标类型
	this.times = otps.times || [0] 			 //结算时间列表
	this.values = otps.values || [1]  		 //技能系数列表
	//状态参数
	this.cd = 0 							 //当前技能CD
	this.state = 0 							 //0 未释放   1  释放中
	this.curDur = 0 						 //当前持续时间
	this.timeIndex = 0 						 //当前结算时间ID
}
//技能刷新
model.prototype.update = function(dt) {
	if(this.state != 1)
		return
	this.curDur += dt
	if(this.times[this.timeIndex] && this.times[this.timeIndex] > this.curDur){
		console.log("攻击"+this.values[this.timeIndex])
		this.timeIndex++
	}
	if(this.curDur >= this.skillDur)
		this.hero.stopSkill(this)
}
//开始释放技能
model.prototype.resSkill = function() {
	if(this.state == 1)
		console.error("技能已释放"+this.id)
	this.state = 1
	this.curDur = 0
	this.timeIndex = 0
	console.log("resSkill"+this.id)
}
//技能释放结束
model.prototype.stopSkill = function() {
	this.state = 0
	console.log("stopSkill"+this.id)
}
module.exports = model