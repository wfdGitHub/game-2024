var model = function(fighting) {
	this.fighting = fighting
	this.list = []
	this.stageIndex = 0
}
model.prototype.init = function() {
	this.list = []
	this.stageIndex = 0
}
model.prototype.push = function(info) {
	this.list.push(info)
}
model.prototype.getList = function() {
	return this.list.concat([])
}
model.prototype.isWin = function() {
	return this.fighting.getNormalWin()
}
model.prototype.explain = function() {
	console.log(this.list)
}
module.exports = model