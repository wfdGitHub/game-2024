var partner_cfg = require("../../../../config/gameCfg/partner_cfg.json")
//伙伴系统
module.exports = function() {
	//激活伙伴
	this.activatePartner = function(uid,characterId,cb) {
		if(!partner_cfg[characterId] || !this.players[uid]){
			cb(false)
			return
		}
		if(this.players[uid].characters[characterId]){
			cb(false,"角色已存在" + characterId)
			return
		}
		var str = partner_cfg[characterId]["activate"]
		var self = this
		self.consumeItems(uid,str,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			self.openPartner(uid,characterId)
			cb(true)
		})
	}
	//开启伙伴
	this.openPartner = function(uid,characterId) {
		this.createCharacter(this.areaId,uid,characterId)
	}
}