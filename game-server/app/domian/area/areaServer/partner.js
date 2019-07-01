//伙伴系统
module.exports = function() {
	//开启伙伴1
	this.openPartner1 = function(uid) {
		this.createCharacter(this.areaId,uid,10002)
	}
	//开启伙伴2
	this.openPartner2 = function(uid) {
		this.createCharacter(this.areaId,uid,10003)
	}
}