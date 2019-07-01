//伙伴系统
module.exports = function() {
	//开启伙伴1
	this.openPartner = function(uid,characterId) {
		this.createCharacter(this.areaId,uid,characterId)
	}
}