var partner_cfg = require("../../../../config/gameCfg/partner_cfg.json")
//伙伴系统
module.exports = function() {
	//激活伙伴
	this.activatePartner = function(uid,characterId,cb) {
		if(!partner_cfg[characterId]){
			cb(false)
			return
		}
		
	}
	//开启伙伴
	this.openPartner = function(uid,characterId) {
		this.createCharacter(this.areaId,uid,characterId)
	}
}