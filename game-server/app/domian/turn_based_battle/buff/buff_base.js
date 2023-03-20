//BUFF基类 回合数  层数
var model = function(fighting) {
	this.fighting = fighting
	this.buffId = "none"
	this.list = []
}
//新增BUFF
model.prototype.addBuff = function(attacker,character,otps) {

}
//移除一层BUFF
model.prototype.delBuff = function() {

}
//BUFF回合更新
model.prototype.update = function() {

}
//BUFF消失
model.prototype.destroy = function() {
	
}
//====BUFF效果
//获取加成属性
model.prototype.getAttInfo = function(name) {}

module.exports = model