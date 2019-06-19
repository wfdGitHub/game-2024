//伙伴系统
module.exports = function() {
	//开启伙伴1
	this.openPartner1 = function(uid) {
		var otps = {
			characterId : 10002,
			areaId : this.areaId,
			uid : uid
		}
		this.createCharacter(otps)
	}
	//开启伙伴2
	this.openPartner2 = function(uid) {
		var otps = {
			characterId : 10003,
			areaId : this.areaId,
			uid : uid
		}
		this.createCharacter(otps)
	}
	//伙伴进阶
	this.advancedPartner = function() {
		// body...
	}
}