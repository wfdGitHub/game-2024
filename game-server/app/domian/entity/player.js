var bearcat = require("bearcat")
var player = function(otps) {
	this.name = otps.name
	this.uid = otps.uid
	this.heros = otps.heros
}
player.prototype.getPlayerInfo = function() {
	var playerInfo = {
		name : this.name,
		uid : this.uid,
		heros : this.heros
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