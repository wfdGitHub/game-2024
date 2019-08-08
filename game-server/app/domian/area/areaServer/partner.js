var partner_cfg = require("../../../../config/gameCfg/partner_cfg.json")
var partner_passive = require("../../../../config/gameCfg/partner_passive.json")
var characters_cfg = require("../../../../config/gameCfg/characters.json")
//伙伴系统
module.exports = function() {
	var self = this
	this.partnerTmpPassive = {}
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
		self.consumeItems(uid,str,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			self.openPartner(uid,characterId)
			cb(true)
		})
	}
	//获取已获得转生被动技能列表
	this.getLearnPassiveList = function(uid,characterId,samsara,cb) {
		if(!characters_cfg[characterId] || characters_cfg[characterId].characterType !== "partner" || !partner_passive[samsara]){
			cb(false,"args error "+characterId+" "+samsara)
			return
		}
		var str = uid+""+characterId+""+samsara
		if(this.partnerTmpPassive[str]){
			cb(true,this.partnerTmpPassive[str])
		}
		cb(true,this.partnerTmpPassive[str])
	}
	//学习转生被动技能
	this.learnPassive = function(uid,characterId,samsara,lId,cb) {

	}
	//重置转生技能
	this.resetLearnPassive = function(uid,characterId,samsara,cb) {
		// body...
	}
	//开启伙伴
	this.openPartner = function(uid,characterId) {
		this.createCharacter(this.areaId,uid,characterId)
	}
}