var bearcat = require("bearcat")
var player = function(otps) {
	this.name = otps.name
	this.uid = otps.uid
	this.heros = []
	for(var i = 0;i < otps.heros.length;i++){
		this.heros[i] = bearcat.getBean("hero",otps.heros[i])
	}
}
player.prototype.getPlayerInfo = function() {
	var playerInfo = {
		name : this.name,
		uid : this.uid,
		heros : []
	}
	for(var i = 0;i < this.heros.length;i++){
		playerInfo.heros.push(this.heros[i].getHeroInfo())
	}
	return playerInfo
}
module.exports = {
	id : "player",
	func : player,
	args : [{
		name : "otps",
		type : "Object"
	}],
	lazy : true
}