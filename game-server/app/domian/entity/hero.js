var bearcat = require("bearcat")
var hero = function(otps) {
	this.heroId = otps.heroId
	this.name = otps.name
	this.level = otps.level
	this.hp = otps.hp
	this.mp = otps.mp
	this.atk = otps.atk
	this.def = otps.def
}
hero.prototype.getHeroInfo = function() {
	var heroInfo = {
		heroId : this.heroId,
		name : this.name,
		level : this.level,
		hp : this.hp,
		mp : this.mp,
		atk : this.atk,
		def : this.def
	}
	return heroInfo
}
module.exports = {
	id : "hero",
	func : hero,
	args : [{
		name : "otps",
		type : "Object"
	}],
	lazy : true
}